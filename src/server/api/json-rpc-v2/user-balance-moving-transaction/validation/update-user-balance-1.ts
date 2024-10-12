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

export type TUpdateBalance1 = {
	params: Static<typeof updateBalanceSchema.params>;
	result: Static<typeof updateBalanceSchema.result>;
};

export const updateBalance1 = {
	name: "user-balance-moving-transaction/update-user-balance-1",
	permissions: { admin: true, user: true },
	schemas: {
		params: updateBalanceSchema.params as unknown as JSONSchemaType<TUpdateBalance1["params"]>,
		result: updateBalanceSchema.result as unknown as JSONSchemaType<TUpdateBalance1["result"]>,
	},
};
