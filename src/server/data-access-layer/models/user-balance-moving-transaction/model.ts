// ----- Dependencies ----------------------------
import * as DbManager from "@js-ak/db-manager";

import * as Types from "./types.js";

// ----- Class ------------------------------
export class Model extends DbManager.PG.BaseModel {
	constructor(creds: DbManager.PG.ModelTypes.TDBCreds) {
		super(
			{
				createField,
				primaryKey,
				tableFields,
				tableName,
				updateField,
			},
			creds,
		);
	}
}

// ----- Table properties ----------------------
const tableName = "user_balance_moving_transactions"; // table from DB
const primaryKey = "id"; // primaryId from table
const createField = { title: "created_at", type: "timestamp" } as const;
const updateField = { title: "updated_at", type: "timestamp" } as const;
const tableFields: Types.TableKeys[] = [
	"created_at",
	"delta_change",
	"id",
	"operation",
	"unique_identificator",
	"updated_at",
	"user_id",
];

// ----- queries -----------------------
// const queries = {

// };
