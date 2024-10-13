import { PG } from "@js-ak/db-manager";

export const model = (creds: PG.ModelTypes.TDBCreds) => new PG.Model.BaseTable(
	{
		createField: { title: "created_at", type: "timestamp" },
		primaryKey: "id",
		tableFields: [
			"id",

			"finished_at",
			"idempotence_key",
			"started_at",
			"status",

			"created_at",
			"updated_at",
		],
		tableName: "two_phased_commit_transactions",
		updateField: { title: "updated_at", type: "timestamp" },
	},
	creds,
);
