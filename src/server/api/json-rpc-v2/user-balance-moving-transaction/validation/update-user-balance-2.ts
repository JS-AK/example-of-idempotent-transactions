import { Static, Type } from "@sinclair/typebox";
import { JSONSchemaType } from "ajv";

const updateBalanceSchema = {
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

export type TUpdateBalance2 = {
	params: Static<typeof updateBalanceSchema.params>;
	result: Static<typeof updateBalanceSchema.result>;
};

export const updateBalance2 = {
	name: "user-balance-moving-transaction/update-user-balance-2",
	permissions: { admin: true, user: true },
	schemas: {
		params: updateBalanceSchema.params as unknown as JSONSchemaType<TUpdateBalance2["params"]>,
		result: updateBalanceSchema.result as unknown as JSONSchemaType<TUpdateBalance2["result"]>,
	},
};
