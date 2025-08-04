import { PG } from "@js-ak/db-manager";

import * as Types from "./types.js";

class Domain extends PG.Repository.Table<{ CoreFields: Types.CoreFields; }> {
	async getEntityForCheck(data: { id?: string; }) {
		const { one } = await super.getOneByParams({
			params: { id: data.id },
			selected: ["id"],
		});

		return one;
	}

	async getBalance(data: { id: string; }) {
		const { one } = await super.getOneByParams({
			params: { id: data.id },
			selected: ["balance"],
		});

		return Number(one?.balance) || 0;
	}
}

export const domain = (dbCreds: PG.ModelTypes.TDBCreds) =>
	new Domain(
		{
			dbCreds,
			schema: {
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
		},
	);
