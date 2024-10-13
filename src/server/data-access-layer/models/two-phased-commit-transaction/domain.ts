import { PG } from "@js-ak/db-manager";

import * as Types from "./types.js";

import { model } from "./model.js";

class Domain extends PG.Domain.BaseTable<PG.Model.BaseTable, { CoreFields: Types.CoreFields; }> { }

export const domain = (creds: PG.ModelTypes.TDBCreds) =>
	new Domain({ model: model(creds) });
