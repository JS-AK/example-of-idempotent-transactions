import { PG } from "@js-ak/db-manager";

export const model = (creds: PG.ModelTypes.TDBCreds) => new PG.Model.BaseTable(
	{
		createField: { title: "created_at", type: "timestamp" },
		primaryKey: "id",
		tableFields: [
			"id",

			"user_id",

			"delta_change",
			"operation",
			"unique_identificator",

			"created_at",
			"updated_at",
		],
		tableName: "user_balance_moving_transactions",
		updateField: { title: "updated_at", type: "timestamp" },
	},
	creds,
);