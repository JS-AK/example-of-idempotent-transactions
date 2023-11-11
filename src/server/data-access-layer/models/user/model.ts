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
const tableName = "users"; // table from DB
const primaryKey = "id"; // primaryId from table
const createField = { title: "created_at", type: "timestamp" } as const;
const updateField = { title: "updated_at", type: "timestamp" } as const;
const tableFields: Types.TableKeys[] = [
	"balance",
	"created_at",
	"email",
	"id",
	"updated_at",
];

// ----- queries -----------------------
// const queries = {

// };
