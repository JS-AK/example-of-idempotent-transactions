import * as Ajv from "ajv";

import * as Types from "../../types/index.js";

export interface IBaseClass<T extends { params: object; result: object; }> {
	logger: Types.System.Logger.Service;
	params: object;
	permissions?: { [key: string]: boolean; };
	request: object;
	services: Types.ServiceLocator.default["services"];
	schemas?: { params: Ajv.JSONSchemaType<T["params"]>; result: Ajv.JSONSchemaType<T["result"]>; };

	execute(): Promise<Types.Common.TDataError>;

	validateParams(params: unknown): { error: number; message: string; };
	validateResult(result: unknown): { error: number; message: string; };
}
