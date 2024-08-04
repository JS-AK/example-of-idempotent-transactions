import { PG } from "@js-ak/db-manager";

import * as TransactionTypes from "../types/index.js";
import { RepositoryManager } from "../../repository-manager.js";

export async function exec(
	this: {
		pool: PG.BaseModel["pool"];
		queryBuilderFactory: PG.QueryBuilderFactory;
		repository: RepositoryManager["repository"];
	},
	payload: TransactionTypes.UserBalanceTransactionCreate,
) {
	const { pool, queryBuilderFactory, repository } = this;

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		const { create } = payload;

		await repository.user.model
			.queryBuilder({ client })
			.select(["*"])
			.rawFor("FOR UPDATE")
			.where({ params: { id: create.user_id } })
			.execute<{ id: string; }>();

		const [userBalanceTransaction] = await queryBuilderFactory
			.createQueryBuilder({
				client,
				dataSource: repository.userBalanceMovingTransaction.tableName,
			})
			.insert({
				params: {
					delta_change: create.delta_change,
					operation: create.operation,
					unique_identificator: create.unique_identificator,
					user_id: create.user_id,
				},
			})
			.returning(["id"])
			.execute<{ id: string; }>();

		if (!userBalanceTransaction) throw new Error("Something went wrong");

		const [user] = await queryBuilderFactory
			.createQueryBuilder({
				client,
				dataSource: repository.user.tableName,
			})
			.rawUpdate("balance = balance - $1", [create.delta_change])
			.where({ params: { id: create.user_id } })
			.returning(["balance"])
			.execute<{ balance: string; }>();

		if (!user) throw new Error("Something went wrong");
		if (Number(user.balance) < 0) throw new Error("Balance cannot be made negative");

		await client.query("COMMIT");

		return { id: userBalanceTransaction.id };
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
}
