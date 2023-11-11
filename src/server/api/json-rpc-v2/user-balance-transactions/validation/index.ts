import * as Typebox from "@sinclair/typebox";
import { JSONSchemaType } from "ajv";

// coming from validation types library

const updateBalance = {
	params: Typebox.Type.Object({
		deltaChange: Typebox.Type.Number({ minimum: 1 }),
		operation: Typebox.Type.Enum({ increase: "increase", reduce: "reduce" } as const),
		uniqueIdentificator: Typebox.Type.String({ format: "uuid" }),
		userId: Typebox.Type.String({ isBigint: true }),
	}, { additionalProperties: false }),
	result: Typebox.Type.Boolean(),
};

export type TUpdateBalance = {
	params: Typebox.Static<typeof updateBalance.params>;
	result: Typebox.Static<typeof updateBalance.result>;
};

class Validation {
	updateBalance = {
		name: "user-balance-moving-transaction/update-user-balance",
		permissions: { admin: true, user: true },
		schemas: {
			params: updateBalance.params as unknown as JSONSchemaType<TUpdateBalance["params"]>,
			result: updateBalance.result as unknown as JSONSchemaType<TUpdateBalance["result"]>,
		},
	};
}

export default new Validation();
