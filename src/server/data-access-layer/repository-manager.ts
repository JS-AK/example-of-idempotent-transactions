import { PG } from "@js-ak/db-manager";

import * as Types from "../types/index.js";

import * as Models from "./models/index.js";
import * as Transactions from "./transactions/index.js";

type Config = {
	database: string;
	host: string;
	password: string;
	port: number;
	user: string;
};

export class RepositoryManager {
	#config;
	#logger;

	repository;
	transactions;

	constructor(options: { config: Config; logger: Types.System.Logger.Service; }) {
		this.#config = options.config;
		this.#logger = options.logger;
		this.repository = this.#createRepository();
		this.transactions = this.#setupTransactions();
		this.#setupErrorHandling();
	}

	#createRepository() {
		return {
			user: new Models.User.Domain.default(this.#config),
			userBalanceMovingTransaction: new Models.UserBalanceMovingTransaction.Domain.default(this.#config),
		} as const;
	}

	#setupTransactions() {
		const transactionData = {
			pool: PG.BaseModel.getTransactionPool(this.#config),
			queryBuilderFactory: new PG.QueryBuilderFactory(PG.BaseModel.getTransactionPool(this.#config)),
			repository: this.repository,
		} as const;

		return {
			"user-balance-transaction-create-1":
				Transactions.Actions.UserBalanceMovingTransactionCreate1.exec.bind(transactionData),
			"user-balance-transaction-create-2":
				Transactions.Actions.UserBalanceMovingTransactionCreate2.exec.bind(transactionData),
		} as const;
	}

	#setupErrorHandling() {
		const handleError = (error: Error) => this.#logger.error(error.message);

		const standardPool = PG.BaseModel.getStandardPool(this.#config);
		const transactionPool = PG.BaseModel.getTransactionPool(this.#config);

		standardPool.on("error", handleError);
		transactionPool.on("error", handleError);

		standardPool.on("connect", (client) => { client.on("error", handleError); });
		transactionPool.on("connect", (client) => { client.on("error", handleError); });
	}

	async shutdown() {
		await PG.BaseModel.removeStandardPool(this.#config);
		await PG.BaseModel.removeTransactionPool(this.#config);
	}
}
