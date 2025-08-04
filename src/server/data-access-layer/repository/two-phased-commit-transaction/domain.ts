import { PG } from "@js-ak/db-manager";

import * as Types from "./types.js";

class Domain extends PG.Repository.Table<{ CoreFields: Types.CoreFields; }> { }

export const domain = (dbCreds: PG.ModelTypes.TDBCreds) =>
	new Domain({
		dbCreds,
		schema: {
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
	});
