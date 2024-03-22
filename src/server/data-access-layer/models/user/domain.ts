import * as DbManager from "@js-ak/db-manager";

import * as Types from "./types.js";
import { Model } from "./model.js";

export default class Domain extends DbManager.PG.BaseDomain<{
	Model: Model;
	CreateFields: Types.CreateFields;
	SearchFields: Types.SearchFields;
	TableFields: Types.TableFields;
	UpdateFields: Types.UpdateFields;
}> {
	constructor(creds: DbManager.PG.ModelTypes.TDBCreds) {
		super({ model: new Model(creds) });
	}

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
