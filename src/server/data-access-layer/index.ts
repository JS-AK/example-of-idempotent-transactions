import * as DbManager from "@js-ak/db-manager";

import * as Types from "../types/index.js";

import * as InnerTransactions from "./transactions/index.js";
import * as Models from "./models/index.js";

export const init = (options: {
	config: {
		database: string;
		host: string;
		password: string;
		port: number;
		user: string;
	};
	logger: Types.System.Logger.Service;
}) => {
	const { config, logger } = options;

	const repository = {
		user: new Models.User.Domain.default(config),
		userBalanceMovingTransaction: new Models.UserBalanceMovingTransaction.Domain.default(config),
	} as const;

	const transactionData = {
		pool: DbManager.PG.BaseModel.getTransactionPool(config),
		repository,
	} as const;

	const transactions = {
		"user-balance-transaction-create-1":
			(data: InnerTransactions.Types.UserBalanceTransactionCreate) =>
				InnerTransactions.Actions.UserBalanceMovingTransactionCreate1.default(
					transactionData,
					data,
				),
		"user-balance-transaction-create-2":
			(data: InnerTransactions.Types.UserBalanceTransactionCreate) =>
				InnerTransactions.Actions.UserBalanceMovingTransactionCreate2.default(
					transactionData,
					data,
				),
	} as const;

	DbManager.PG.BaseModel.getStandardPool(config)
		.on("error", (error) => logger.error(error.message));
	DbManager.PG.BaseModel.getTransactionPool(config)
		.on("error", (error) => logger.error(error.message));

	DbManager.PG.BaseModel.getStandardPool(config)
		.on("connect", (client) => { client.on("error", (error) => logger.error(error.message)); });
	DbManager.PG.BaseModel.getTransactionPool(config)
		.on("connect", (client) => { client.on("error", (error) => logger.error(error.message)); });

	const shutdown = async () => {
		await DbManager.PG.BaseModel.removeStandardPool(config);
		await DbManager.PG.BaseModel.removeTransactionPool(config);
	};

	return { repository, shutdown, transactions };
};
