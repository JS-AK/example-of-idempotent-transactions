// ----- Dependencies ----------------------------
import { PG } from "@js-ak/db-manager";

// ----- Class ------------------------------
export class Model extends PG.Model.BaseTable {
	constructor(creds: PG.ModelTypes.TDBCreds) {
		super(
			{
				createField: { title: "created_at", type: "timestamp" },
				primaryKey: "id",
				tableFields: [
					"id",
					"balance",
					"email",
					"created_at",
					"updated_at",
				],
				tableName: "users",
				updateField: { title: "updated_at", type: "timestamp" },
			},
			creds,
		);
	}
}
