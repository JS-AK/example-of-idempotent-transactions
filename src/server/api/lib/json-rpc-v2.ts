import * as Ajv from "ajv";

import * as Types from "../../types/index.js";
import { IBaseClass } from "./base-class.js";
import Validator from "./validator.js";

export type IBaseClassOpts<T extends { params: object; result: object; }> = {
	logger: Types.System.Logger.Service;
	request: { id: string | number; method: string; };
	schemas?: { params: Ajv.JSONSchemaType<T["params"]>; result: Ajv.JSONSchemaType<T["result"]>; };
	services: Types.ServiceLocator.default["services"];
};

export class JsonRpcV2<T extends { params: object; result: object; }> implements IBaseClass<T> {
	#validateParamsFunction: Ajv.ValidateFunction | null;
	#validateResultFunction: Ajv.ValidateFunction | null;

	logger;
	params;
	request;
	schemas;
	services;

	constructor(params: T["params"], options: IBaseClassOpts<T>) {
		this.#validateParamsFunction = null;
		this.#validateResultFunction = null;

		this.logger = options.logger;
		this.params = params;
		this.request = options.request;
		this.schemas = options.schemas;
		this.services = options.services;
	}

	async execute(): Promise<Types.Common.TDataError<T["result"]>> {
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

	static getMethodName(): string {
		throw new Error("NOT IMPLEMENTED");
	}

	static getSchemas<P, R>(): {
		params: Ajv.JSONSchemaType<P>;
		result: Ajv.JSONSchemaType<R>;
	} {
		throw new Error("NOT IMPLEMENTED");
	}
}
