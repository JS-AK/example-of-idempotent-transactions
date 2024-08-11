import * as TransactionTypes from "../types/index.js";

import { RepositoryManager } from "../../repository-manager.js";

export async function exec(
	this: RepositoryManager,
	payload: TransactionTypes.UserBalanceTransactionCreate,
) {
	const { queryBuilderFactory, repository, transactionPool } = this;
	const { create } = payload;

	const client = await transactionPool.connect();

	try {
		await client.query("BEGIN");

		const [userBalanceTransaction] = await queryBuilderFactory
			.createQueryBuilder({
				client,
				dataSource: repository.userBalanceMovingTransaction.tableName,
			})
			.insert({ params: create })
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
