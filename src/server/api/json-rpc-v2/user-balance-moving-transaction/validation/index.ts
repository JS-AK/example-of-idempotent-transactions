import { Static, Type } from "@sinclair/typebox";
import { JSONSchemaType } from "ajv";

const updateBalance = {
	params: Type.Object({
		deltaChange: Type.Number({ minimum: 1 }),
		operation: Type.Enum({ increase: "increase", reduce: "reduce" } as const),
		uniqueIdentificator: Type.String({ format: "uuid" }),
		userId: Type.String({ isBigint: true }),
	}, { additionalProperties: false }),
	result: Type.Object({
		success: Type.Boolean(),
	}, { additionalProperties: false }),
};

export type TUpdateBalance = {
	params: Static<typeof updateBalance.params>;
	result: Static<typeof updateBalance.result>;
};

class Validation {
	updateBalance1 = {
		name: "user-balance-moving-transaction/update-user-balance-1",
		permissions: { admin: true, user: true },
		schemas: {
			params: updateBalance.params as unknown as JSONSchemaType<TUpdateBalance["params"]>,
			result: updateBalance.result as unknown as JSONSchemaType<TUpdateBalance["result"]>,
		},
	};
	updateBalance2 = {
		name: "user-balance-moving-transaction/update-user-balance-2",
		permissions: { admin: true, user: true },
		schemas: {
			params: updateBalance.params as unknown as JSONSchemaType<TUpdateBalance["params"]>,
			result: updateBalance.result as unknown as JSONSchemaType<TUpdateBalance["result"]>,
		},
	};
}

export default new Validation();
