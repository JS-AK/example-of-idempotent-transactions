import { PG } from "@js-ak/db-manager";

import * as Types from "./types.js";

import { Model, initModel } from "./model.js";

class Domain extends PG.Domain.BaseTable<Model, { CoreFields: Types.CoreFields; }> {
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

export const init = (creds: PG.ModelTypes.TDBCreds) => {
	return new Domain({ model: initModel(creds) });
};
