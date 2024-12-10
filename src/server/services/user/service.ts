import EventEmitter from "node:events";

import * as Types from "../../types/index.js";

import BaseService from "../base-service.js";

export default class Service extends BaseService {
	#businessError;
	#logger;
	#repository;
	#dal;
	#transactionEventManager;

	constructor(data: {
		businessError: Types.System.BusinessError.Service;
		dal: Types.ServiceLocator.default["dal"];
		logger: Types.System.Logger.Service;
	}) {
		super();

		this.#businessError = data.businessError;
		this.#logger = data.logger;

		this.#repository = data.dal.repository.user;
		this.#dal = data.dal;

		this.#transactionEventManager = new EventEmitter();
	}

	async #getEntityForCheck(
		payload: { id?: string; hrNumber?: string; email?: string; },
	): Promise<Types.Common.TDataError<Types.Dal.User.Types.EntityForCheck>> {
		const user = await this.#repository.getEntityForCheck(payload);

		if (!user) {
			return this.#businessError.user.NOT_FOUND;
		}

		return { data: user };
	}

	async #abTest1(regToken: string) {
		return new Promise<{ data: true; }>((resolve, reject) => {
			this.#dal.executeTransaction(async (client) => {
				registerToken(regToken);

				await this.#repository.model
					.queryBuilder({ client })
					.select(["id"])
					.where({ params: {} })
					.execute<{ id: string; }>();

				resolve({ data: true });

				await new Promise<void>((resolve, reject) => {
					this.#transactionEventManager.on("close-transaction", (token, status) => {
						if (regToken !== token) return;

						switch (status) {
							case "success": {
								resolve();
								break;
							}

							case "failed": {
								reject(new Error("Failed"));
								break;
							}

							default: {
								reject(new Error(`Unknown status: ${status}`));
								break;
							}
						}
					});
				});

				deleteToken(regToken);
			}).catch((e) => {
				this.#logger.error(e.message);

				reject(e);
			});
		});
	}

	async #abTest2(regToken: string) {
		return new Promise<{ data: true; }>((resolve, reject) => {
			this.#dal.executeTransaction(async (client) => {
				registerToken(regToken);

				await this.#repository.model
					.queryBuilder({ client })
					.select(["id"])
					.where({ params: {} })
					.execute<{ id: string; }>();

				resolve({ data: true });

				await new Promise<void>((resolve, reject) => {
					this.#transactionEventManager.on("close-transaction", (token, status) => {
						if (regToken !== token) return;

						switch (status) {
							case "success": {
								resolve();
								break;
							}

							case "failed": {
								reject(new Error("Failed"));
								break;
							}

							default: {
								reject(new Error(`Unknown status: ${status}`));
								break;
							}
						}
					});
				});

				deleteToken(regToken);
			}).catch((e) => {
				this.#logger.error(e.message);

				reject(e);
			});
		});
	}

	async #closeTransaction(token: string, status: string) {
		this.#transactionEventManager.emit("close-transaction", token, status);
	}

	innerSpace = {
		getEntityForCheck:
			async (data: { id?: string; }) => this.#getEntityForCheck(data),
		holdEntityForUpdate:
			async (payload: { id: string; }, client: Types.Dal.PoolClient) => {
				const [entity] = await this.#repository.model
					.queryBuilder({ client })
					.select(["*"])
					.rawFor("FOR UPDATE")
					.where({ params: { id: payload.id } })
					.execute<Types.Dal.User.Types.CoreFields>();

				return entity;
			},
		updateBalance:
			async (payload: { deltaChange: number; id: string; type: "increase" | "reduce"; }, client: Types.Dal.PoolClient) => {
				switch (payload.type) {
					case "increase": {
						const [entity] = await this.#repository.model
							.queryBuilder({ client })
							.rawUpdate("balance = balance + $1", [payload.deltaChange])
							.where({ params: { id: payload.id } })
							.returning(["balance"])
							.execute<{ balance: string; }>();

						return entity;
					}

					case "reduce": {
						const [entity] = await this.#repository.model
							.queryBuilder({ client })
							.rawUpdate("balance = balance - $1", [payload.deltaChange])
							.where({ params: { id: payload.id } })
							.returning(["balance"])
							.execute<{ balance: string; }>();

						return entity;
					}

					default: {
						throw new Error("invalid payload.type");
					}
				}
			},
	};

	outerSpace = {
		abTest1: this.#abTest1.bind(this),
		abTest2: this.#abTest2.bind(this),
		closeTransaction: this.#closeTransaction.bind(this),
		getBalance: async (payload: { id: string; }): Promise<Types.Common.TDataError<number>> => {
			const balance = await this.#repository.getBalance(payload);

			return { data: balance };
		},
	};
}

const registerToken = async (token: string) => {
	if (tokens[token]) {
		throw new Error("Token already registered");
	}

	tokens[token] = Date.now();

	return;
};

const deleteToken = (token: string) => {
	if (!tokens[token]) {
		throw new Error("Token not found");
	}

	delete tokens[token];
};

const tokens: Record<string, number> = {};
