import { Static, Type } from "@sinclair/typebox";
import { JSONSchemaType } from "ajv";

const getBalanceSchema = {
	params: Type.Object({ id: Type.String() }, { additionalProperties: false }),
	result: Type.Object({ amount: Type.Integer() }, { additionalProperties: false }),
};

export type TGetBalance = {
	params: Static<typeof getBalanceSchema.params>;
	result: Static<typeof getBalanceSchema.result>;
};

export const getBalance = {
	name: "user/get-balance",
	permissions: { admin: true, user: true },
	schemas: {
		params: getBalanceSchema.params as unknown as JSONSchemaType<TGetBalance["params"]>,
		result: getBalanceSchema.result as unknown as JSONSchemaType<TGetBalance["result"]>,
	},
};
