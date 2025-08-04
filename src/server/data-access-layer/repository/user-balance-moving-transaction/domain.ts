import { PG } from "@js-ak/db-manager";

import * as Types from "./types.js";

export default class Domain extends PG.Repository.Table<{
	CreateFields: Types.CreateFields;
	SearchFields: Types.SearchFields;
	CoreFields: Types.TableFields;
	UpdateFields: Types.UpdateFields;
}> {
	async getEntityForCheck(data: { uniqueIdentificator?: string; }) {
		const { one } = await super.getOneByParams({
			params: { unique_identificator: data.uniqueIdentificator },
			selected: ["id"],
		});

		return one as Types.EntityForCheck | undefined;
	}
}

export const domain = (dbCreds: PG.ModelTypes.TDBCreds) =>
	new Domain({
		dbCreds,
		schema: {
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
	});
