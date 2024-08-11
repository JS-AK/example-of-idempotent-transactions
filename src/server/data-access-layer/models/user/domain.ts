import { PG } from "@js-ak/db-manager";

import * as Types from "./types.js";
import { Model } from "./model.js";

export default class Domain extends PG.Domain.BaseTable<Model, {
	CoreFields: Types.CoreFields;
}> {
	constructor(creds: PG.ModelTypes.TDBCreds) {
		super({ model: new Model(creds, { isLoggerEnabled: true }) });
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
