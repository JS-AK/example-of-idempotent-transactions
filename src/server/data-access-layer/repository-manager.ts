import { PG, Types } from "@js-ak/db-manager";

import * as Repository from "./repository/index.js";

export type PoolClient = PG.Model.BaseTable["pool"];

export class RepositoryManager {
	#repositoryManager;

	executeTransaction;
	repository;
	queryBuilderFactory;

	constructor(creds: PG.ModelTypes.TDBCreds, options: {
		isLoggerEnabled: boolean;
		logger: Types.TLogger;
	}) {
		this.#repositoryManager = new PG.RepositoryManager(
			{
				twoPhasedCommitTransaction: Repository.TwoPhasedCommitTransaction.domain(creds),
				user: Repository.User.domain(creds),
				userBalanceMovingTransaction: Repository.UserBalanceMovingTransaction.domain(creds),
			},
			{ config: creds, isLoggerEnabled: options.isLoggerEnabled, logger: options.logger },
		);

		this.executeTransaction = this.#repositoryManager.executeTransaction.bind(this.#repositoryManager);
		this.repository = this.#repositoryManager.repository;
		this.queryBuilderFactory = this.#repositoryManager.queryBuilderFactory;
	}

	async init() {
		await this.#repositoryManager.init();
	}

	async shutdown() {
		await this.#repositoryManager.shutdown();
	}
}
