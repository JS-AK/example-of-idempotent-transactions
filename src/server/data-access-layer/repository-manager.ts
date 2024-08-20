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
	#queryBuilderFactory;
	#repository;
	#standardPool;
	#transactionPool;
	#transactions;

	constructor(options: { config: Config; logger: Types.System.Logger.Service; }) {
		this.#config = options.config;
		this.#logger = options.logger;
		this.#standardPool = PG.BaseModel.getStandardPool(this.#config);
		this.#transactionPool = PG.BaseModel.getTransactionPool(this.#config);
		this.#repository = this.#createRepository();
		this.#transactions = this.#setupTransactions();
		this.#queryBuilderFactory = new PG.QueryBuilderFactory(this.#standardPool, {
			isLoggerEnabled: true,
			logger: this.#logger,
		});

		this.#setupErrorHandling();
	}

	get queryBuilderFactory() {
		return this.#queryBuilderFactory;
	}

	get repository() {
		return this.#repository;
	}

	get standardPool(): PG.BaseModel["pool"] {
		return this.#standardPool;
	}

	get transactionPool(): PG.BaseModel["pool"] {
		return this.#transactionPool;
	}

	get transactions() {
		return this.#transactions;
	}

	#createRepository() {
		return {
			user: Models.User.domain(this.#config),
			userBalanceMovingTransaction: Models.UserBalanceMovingTransaction.domain(this.#config),
		} as const;
	}

	#setupTransactions() {
		return {
			"user-balance-transaction-create-1":
				Transactions.Actions.UserBalanceMovingTransactionCreate1.exec.bind(this),
			"user-balance-transaction-create-2":
				Transactions.Actions.UserBalanceMovingTransactionCreate2.exec.bind(this),
		} as const;
	}

	#setupErrorHandling() {
		const handleError = (error: Error) => this.#logger.error(error.message);

		const setupPoolErrorHandling = (pool: PG.BaseModel["pool"]) => {
			pool.on("error", handleError);
			pool.on("connect", (client) => { client.on("error", handleError); });
		};

		const standardPool = PG.BaseModel.getStandardPool(this.#config);
		const transactionPool = PG.BaseModel.getTransactionPool(this.#config);

		setupPoolErrorHandling(standardPool);
		setupPoolErrorHandling(transactionPool);
	}

	async shutdown() {
		await PG.BaseModel.removeStandardPool(this.#config);
		await PG.BaseModel.removeTransactionPool(this.#config);
	}
}
