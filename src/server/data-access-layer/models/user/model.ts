// ----- Dependencies ----------------------------
import { PG } from "@js-ak/db-manager";

// ----- Class ------------------------------
export class Model extends PG.Model.BaseTable { }

export const initModel = (creds: PG.ModelTypes.TDBCreds) => {
	return new Model(
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
};
