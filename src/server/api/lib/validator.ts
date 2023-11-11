import Ajv from "ajv";
import ajvFormats from "ajv-formats";
import ajvKeywords from "ajv-keywords";

class Validator {
	#ajv;
	#repository = new Map();

	constructor() {
		this.#ajv = new Ajv.default({ coerceTypes: true, useDefaults: true });

		this.#ajv.addKeyword({
			compile: () => (bigIntRaw: string) => {
				const int = Number(bigIntRaw);

				if (!Number.isInteger(int)) return false;

				const bigInt = BigInt(bigIntRaw);

				/* 9223372036854775807 is max in PostgreSQL */
				if (bigInt > 9223372036854775807n) {
					return false;
				}

				return bigIntRaw === int.toString() || bigIntRaw === bigInt.toString();
			},
			error: { message: "Wrong id" },
			keyword: "isBigint",
			schemaType: "boolean",
			type: "string",
		});

		ajvKeywords.default(this.#ajv);
		ajvFormats.default(this.#ajv);
	}

	#addCompiledSchema(validator: Ajv.default, schema: Ajv.Schema) {
		const compiled = validator.compile(schema);

		this.#repository.set(schema, compiled);

		return compiled;
	}

	get ajv() {
		return this.#ajv;
	}

	getCompiledSchema(validator: Ajv.default, schema: Ajv.Schema): Ajv.ValidateFunction {
		const compiled = this.#repository.get(schema);

		if (!compiled) {
			return this.#addCompiledSchema(validator, schema);
		}

		return compiled;
	}
}

export default new Validator();
