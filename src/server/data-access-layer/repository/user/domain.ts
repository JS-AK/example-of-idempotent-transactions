import { PG } from "@js-ak/db-manager";

import * as Types from "./types.js";

import { model } from "./model.js";

class Domain extends PG.Domain.BaseTable<PG.Model.BaseTable, { CoreFields: Types.CoreFields; }> {
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

export const domain = (creds: PG.ModelTypes.TDBCreds) =>
	new Domain({ model: model(creds) });
