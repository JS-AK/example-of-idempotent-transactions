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

		const { userBalanceTransaction } = payload;

		const { query, values } = DbManager.PG.BaseModel
			.getInsertFields<
				Types.Dal.UserBalanceMovingTransaction.Types.CreateFields,
				Types.Dal.UserBalanceMovingTransaction.Types.TableKeys
			>({
				params: {
					delta_change: userBalanceTransaction.delta_change,
					operation: userBalanceTransaction.operation,
					unique_identificator: userBalanceTransaction.unique_identificator,
					user_id: userBalanceTransaction.user_id,
				},
				returning: ["id"],
				tableName: repository.userBalanceMovingTransaction.tableName,
			});

		const id = (await client.query<{ id: string; }>(query, values)).rows[0]?.id;

		if (!id) throw new Error("Something went wrong");

		const balance = (await client.query<{ balance: string; }>(`
			UPDATE ${repository.user.tableName}
			SET balance = balance - $1
			WHERE id = $2
			RETURNING balance
		`, [userBalanceTransaction.delta_change, userBalanceTransaction.user_id])).rows[0]?.balance;

		if (Number(balance) < 0) throw new Error("Balance cannot be made negative");

		await client.query("COMMIT");

		return { id };
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
}
