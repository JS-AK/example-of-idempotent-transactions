import * as Ajv from "ajv";

import * as Types from "../../types/index.js";

export interface IBaseClass {
	logger: Types.System.Logger.Service;
	params: object;
	permissions?: { [key: string]: boolean; };
	request: object;
	services: Types.ServiceLocator.default["services"];
	schemas?: { params: Ajv.JSONSchemaType<object>; result: Ajv.JSONSchemaType<object>; };

	execute(): Promise<Types.Common.TDataError>;

	validateParams(params: unknown): { error: number; message: string; };
	validateResult(result: unknown): { error: number; message: string; };
}
