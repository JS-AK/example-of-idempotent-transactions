import { Static, Type } from "@sinclair/typebox";
import { JSONSchemaType } from "ajv";

const getBalance = {
	params: Type.Object({
		id: Type.String(),
	}, { additionalProperties: false }),
	result: Type.Object({
		amount: Type.Integer(),
	}, { additionalProperties: false }),
};

export type TGetBalance = {
	params: Static<typeof getBalance.params>;
	result: Static<typeof getBalance.result>;
};

class Validation {
	getBalance = {
		name: "user/get-balance",
		permissions: { admin: true, user: true },
		schemas: {
			params: getBalance.params as unknown as JSONSchemaType<TGetBalance["params"]>,
			result: getBalance.result as unknown as JSONSchemaType<TGetBalance["result"]>,
		},
	};
}

export default new Validation();
