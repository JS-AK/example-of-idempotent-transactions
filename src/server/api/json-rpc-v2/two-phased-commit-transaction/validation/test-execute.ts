import { Static, Type } from "@sinclair/typebox";
import { JSONSchemaType } from "ajv";

const testExecuteSchema = {
	params: Type.Object({}, { additionalProperties: false }),
	result: Type.Object({ success: Type.Boolean() }, { additionalProperties: false }),
};

export type TTestExecute = {
	params: Static<typeof testExecuteSchema.params>;
	result: Static<typeof testExecuteSchema.result>;
};

export const testExecute = {
	name: "two-phased-commit-transaction/test-execute",
	permissions: { admin: true, user: true },
	schemas: {
		params: testExecuteSchema.params as unknown as JSONSchemaType<TTestExecute["params"]>,
		result: testExecuteSchema.result as unknown as JSONSchemaType<TTestExecute["result"]>,
	},
};
