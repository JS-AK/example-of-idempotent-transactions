import * as DbManager from "@js-ak/db-manager";

import * as TransactionTypes from "../types/index.js";
import * as Types from "../../../types/index.js";

export default async function (
	options: {
		pool: DbManager.PG.BaseModel["pool"];
		repository: Types.ServiceLocator.default["dal"]["repository"];
	},
	payload: TransactionTypes.UserBalanceTransactionCreate,
) {
	const { pool, repository } = options;

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		const { create } = payload;

		await client.query<{ balance: string; }>(`
			SELECT *
			FROM ${repository.user.tableName}
			WHERE id = $1
			FOR UPDATE
		`, [create.user_id]);

		const [userBalanceTransaction] = await repository.userBalanceMovingTransaction.model
			.queryBuilder({ client })
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

		const { rows: [user] } = await client.query<{ balance: string; }>(`
			UPDATE ${repository.user.tableName}
			SET balance = balance - $1
			WHERE id = $2
			RETURNING balance
		`, [create.delta_change, create.user_id]);

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
