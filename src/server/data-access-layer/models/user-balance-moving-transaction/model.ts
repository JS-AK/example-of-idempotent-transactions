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
};
