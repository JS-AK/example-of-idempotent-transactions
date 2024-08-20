import { PG } from "@js-ak/db-manager";

import * as Types from "./types.js";

import { model } from "./model.js";

export default class Domain extends PG.Domain.BaseTable<PG.Model.BaseTable, {
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

export const domain = (creds: PG.ModelTypes.TDBCreds) =>
	new Domain({ model: model(creds) });
