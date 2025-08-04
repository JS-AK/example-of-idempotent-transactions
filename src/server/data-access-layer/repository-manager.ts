import { PG, Types } from "@js-ak/db-manager";

import * as Repository from "./repository/index.js";

export type PoolClient = PG.Model.BaseTable["pool"];

export const init = (creds: PG.ModelTypes.TDBCreds, options: {
	isLoggerEnabled: boolean;
	logger: Types.TLogger;
}) => new PG.RepositoryManager(
	{
		twoPhasedCommitTransaction: Repository.TwoPhasedCommitTransaction.domain(creds),
		user: Repository.User.domain(creds),
		userBalanceMovingTransaction: Repository.UserBalanceMovingTransaction.domain(creds),
	},
	{ config: creds, isLoggerEnabled: options.isLoggerEnabled, logger: options.logger },
);
