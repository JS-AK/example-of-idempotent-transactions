import * as Types from "../../types/index.js";

import BaseService from "../base-service.js";

export default class Service extends BaseService {
	#businessError;
	#logger;
	#repository;
	#dal;

	constructor(data: {
		businessError: Types.System.BusinessError.Service;
		dal: Types.ServiceLocator.default["dal"];
		logger: Types.System.Logger.Service;
	}) {
		super();

		this.#businessError = data.businessError;
		this.#logger = data.logger;

		this.#repository = data.dal.repository.userBalanceMovingTransaction;
		this.#dal = data.dal;
	}

	#check = {
		before: {
			updateBalance: async (payload: {
				deltaChange: number;
				operation: "increase" | "reduce";
				uniqueIdentificator: string;
				userId: string;
			}): Promise<Types.Common.TDataError<true>> => {
				const { uniqueIdentificator, userId } = payload;

				{
					const user = await this.services
						.user
						.innerSpace
						.getEntityForCheck({ id: userId });

					if (user.error) return { error: user.error };
				}

				{
					const userBalanceMovingTransaction = await this.#repository.getEntityForCheck({ uniqueIdentificator });

					if (userBalanceMovingTransaction) {
						return this.#businessError.userBalanceMovingTransaction.UNIQUE_IDENTIFICATOR_ALREADY_EXISTS;
					}
				}

				return { data: true };
			},
		},
	};

	async #getEntityForCheck(
		payload: { uniqueIdentificator?: string; },
	): Promise<Types.Common.TDataError<Types.Dal.UserBalanceMovingTransaction.Types.EntityForCheck>> {
		const user = await this.#repository.getEntityForCheck(payload);

		if (!user) {
			return this.#businessError.userBalanceMovingTransaction.NOT_FOUND;
		}

		return { data: user };
	}

	queueJobs = {
		reduceBalance: async (payload: {
			deltaChange: number;
			uniqueIdentificator: string;
			userId: string;
		}) => {
			const data = await this.#dal.executeTransaction(
				async (client) => {
					const [userBalanceTransaction] = await this.#dal.queryBuilderFactory
						.createQueryBuilder({
							client,
							dataSource: this.#dal.repository.userBalanceMovingTransaction.tableName,
						})
						.insert({
							params: {
								delta_change: payload.deltaChange,
								operation: "reduce",
								unique_identificator: payload.uniqueIdentificator,
								user_id: payload.userId,
							},
						})
						.returning(["id"])
						.execute<{ id: string; }>();

					if (!userBalanceTransaction) throw new Error("Something went wrong");

					const user = await this.services
						.user
						.innerSpace
						.updateBalance(
							{ deltaChange: payload.deltaChange, id: payload.userId, type: "reduce" },
							client,
						);

					if (!user) throw new Error("Something went wrong");
					if (Number(user.balance) < 0) throw new Error("Balance cannot be made negative");

					return { id: userBalanceTransaction.id };
				},
				{
					timeToRollback: 10000,
					transactionId: "reduce-balance",
				},
			).catch((e) => this.#logger.error(e.message));

			if (!data) return this.#businessError.common.UNKNOWN_ERROR;

			return { data: true };
		},
	};

	innerSpace = {
		createOne:
			async (payload: { deltaChange: number; uniqueIdentificator: string; userId: string; }, client: Types.Dal.PoolClient) => {
				const [userBalanceTransaction] = await this.#repository
					.model
					.queryBuilder({ client })
					.insert({
						params: {
							delta_change: payload.deltaChange,
							operation: "reduce",
							unique_identificator: payload.uniqueIdentificator,
							user_id: payload.userId,
						},
					})
					.returning(["id"])
					.execute<{ id: string; }>();

				return userBalanceTransaction;
			},
		getEntityForCheck:
			async (data: { uniqueIdentificator?: string; }) => this.#getEntityForCheck(data),
	};

	outerSpace = {
		updateBalance1: async (payload: {
			deltaChange: number;
			operation: "increase" | "reduce";
			uniqueIdentificator: string;
			userId: string;
		}): Promise<Types.Common.TDataError<true>> => {
			const check = await this.#check.before.updateBalance(payload);

			if (check.error) return { error: check.error };

			switch (payload.operation) {
				case "increase": {
					return this.#businessError.common.WORK_IN_PROGRESS;
				}

				case "reduce": {
					const result = await this.services
						.queueManager
						.queues
						.userBalanceMovingTransactionReduce
						.exec({
							deltaChange: payload.deltaChange,
							uniqueIdentificator: payload.uniqueIdentificator,
							userId: payload.userId,
						});

					if (result.error) { return { error: result.error }; }

					return { data: true };
				}

				default: {
					return this.#businessError.common.ACCESS_DENIED;
				}
			}
		},
		updateBalance2: async (payload: {
			deltaChange: number;
			operation: "increase" | "reduce";
			uniqueIdentificator: string;
			userId: string;
		}): Promise<Types.Common.TDataError<true>> => {
			const check = await this.#check.before.updateBalance(payload);

			if (check.error) return { error: check.error };

			switch (payload.operation) {
				case "increase": {
					return this.#businessError.common.WORK_IN_PROGRESS;
				}

				case "reduce": {
					const data = await this.#dal.executeTransaction(
						async (client) => {
							await this.services
								.user
								.innerSpace
								.holdEntityForUpdate({ id: payload.userId }, client);

							const userBalanceTransaction = await this
								.innerSpace
								.createOne(payload, client);

							if (!userBalanceTransaction) throw new Error("Something went wrong");

							const user = await this.services
								.user
								.innerSpace
								.updateBalance(
									{ deltaChange: payload.deltaChange, id: payload.userId, type: "reduce" },
									client,
								);

							if (!user) throw new Error("Something went wrong");
							if (Number(user.balance) < 0) throw new Error("Balance cannot be made negative");

							return { id: userBalanceTransaction.id };
						},
						{
							timeToRollback: 10000,
							transactionId: "reduce-balance-2",
						},
					).catch((e) => this.#logger.error(e.message));

					if (!data) return this.#businessError.common.UNKNOWN_ERROR;

					return { data: true };
				}

				default: {
					return this.#businessError.common.ACCESS_DENIED;
				}
			}
		},
	};
}
