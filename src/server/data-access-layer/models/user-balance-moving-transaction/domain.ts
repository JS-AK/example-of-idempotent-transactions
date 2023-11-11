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

	async getEntityForCheck(data: { uniqueIdentificator?: string; }) {
		const { one } = await super.getOneByParams({
			params: { unique_identificator: data.uniqueIdentificator },
			selected: ["id"],
		});

		return one as Types.EntityForCheck | undefined;
	}
}
