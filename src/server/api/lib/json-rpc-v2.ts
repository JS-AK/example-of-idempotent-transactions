import * as Ajv from "ajv";

import * as Types from "../../types/index.js";
import { IBaseClass } from "./base-class.js";
import Validator from "./validator.js";

export type IBaseClassOpts<T> = {
	logger: Types.System.Logger.Service;
	request: { id: string | number; method: string; };
	schemas?: { params: Ajv.JSONSchemaType<T>; result: Ajv.JSONSchemaType<T>; };
	services: Types.ServiceLocator.default["services"];
};

export class JsonRpcV2<T extends object> implements IBaseClass {
	#validateParamsFunction: Ajv.ValidateFunction | null;
	#validateResultFunction: Ajv.ValidateFunction | null;

	logger;
	params;
	request;
	schemas;
	services;

	constructor(params: T, options: IBaseClassOpts<T>) {
		this.#validateParamsFunction = null;
		this.#validateResultFunction = null;

		this.logger = options.logger;
		this.params = params;
		this.request = options.request;
		this.schemas = options.schemas;
		this.services = options.services;
	}

	async execute(): Promise<Types.Common.TDataError> {
		throw new Error("NOT IMPLEMENTED");
	}

	validateParams(): { error: number; message: string; } {
		if (this.schemas) {
			const valid = this.#validateParams();

			if (!this.#validateParamsFunction) {
				return { error: 1, message: "Something went wrong" };
			}

			if (!valid) {
				return {
					error: 1,
					message: JSON.stringify(this.#validateParamsFunction.errors),
				};
			}
		}

		return { error: 0, message: "ok" };
	}

	validateResult(result: unknown): { error: number; message: string; } {
		if (this.schemas?.result) {
			const valid = this.#validateResult(result);

			if (!this.#validateResultFunction) {
				return { error: 1, message: "Something went wrong" };
			}

			if (!valid) {
				return {
					error: 1,
					message: JSON.stringify(this.#validateResultFunction.errors),
				};
			}
		}

		return { error: 0, message: "ok" };
	}

	#validateParams(): boolean {
		if (!this.schemas) return false;

		this.#validateParamsFunction = Validator.getCompiledSchema(
			Validator.ajv,
			this.schemas.params,
		);

		return this.#validateParamsFunction(this.params);
	}

	#validateResult(result: unknown): boolean {
		if (!this.schemas) return false;

		this.#validateResultFunction = Validator.getCompiledSchema(
			Validator.ajv,
			this.schemas.result,
		);

		return this.#validateResultFunction(result);
	}

	// STATIC METHODS

	static getMethodName() {
		throw new Error("NOT IMPLEMENTED");
	}

	static getSchemas() {
		throw new Error("NOT IMPLEMENTED");
	}
}
