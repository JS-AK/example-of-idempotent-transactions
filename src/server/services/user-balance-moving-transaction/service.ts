import * as Types from "../../types/index.js";

import BaseService from "../base-service.js";

export default class Service extends BaseService {
	#businessError;
	#crypto;
	#dal;
	#logger;

	constructor(data: {
		businessError: Types.System.BusinessError.Service;
		crypto: Types.System.Crypto.Service;
		dal: Types.ServiceLocator.default["dal"];
		logger: Types.System.Logger.Service;
	}) {
		super();

		this.#businessError = data.businessError;
		this.#crypto = data.crypto;
		this.#dal = data.dal;
		this.#logger = data.logger;
	}

	#check = {
		before: {
			updateBalance: async (payload: {
				deltaChange: number;
				operation: "increase" | "reduce";
				uniqueIdentificator: string;
				userId: string;
			}): Promise<Types.Common.TDataError<true>> => {
				if (!this.services) throw new Error("services is not provided");

				const {
					uniqueIdentificator,
					userId,
				} = payload;

				{
					const user = await this.services
						.user
						.innerSpace
						.getEntityForCheck({ id: userId });

					if (user.error) return { error: user.error };
				}

				{
					const userBalanceMovingTransaction = await this.#dal
						.repository
						.userBalanceMovingTransaction
						.getEntityForCheck({ uniqueIdentificator });

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
		const user = await this.#dal
			.repository
			.userBalanceMovingTransaction
			.getEntityForCheck(payload);

		if (!user) {
			return this.#businessError.userBalanceMovingTransaction.NOT_FOUND;
		}

		return { data: user };
	}

	queueJobs = {
		reduceBalance: async (data: {
			deltaChange: number;
			uniqueIdentificator: string;
			userId: string;
		}) => {
			await this.#dal.transactions["user-balance-transaction-create"]({
				userBalanceTransaction: {
					delta_change: data.deltaChange,
					operation: "reduce",
					unique_identificator: data.uniqueIdentificator,
					user_id: data.userId,
				},
			});

			return { data: true };
		},
	};

	innerSpace = {
		getEntityForCheck:
			async (data: { uniqueIdentificator?: string; }) => this.#getEntityForCheck(data),
	};

	outerSpace = {
		updateBalance: async (payload: {
			deltaChange: number;
			operation: "increase" | "reduce";
			uniqueIdentificator: string;
			userId: string;
		}): Promise<Types.Common.TDataError<true>> => {
			if (!this.services) throw new Error("services is not provided");

			const check = await this.#check.before.updateBalance(payload);

			if (check.error) return { error: check.error };

			switch (payload.operation) {
				case "increase": {
					return this.#businessError.common.ACCESS_DENIED;
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

					if (result.error) {
						return { error: result.error };
					}

					return { data: true };
				}

				default: {
					return this.#businessError.common.ACCESS_DENIED;
				}
			}
		},
	};
}
