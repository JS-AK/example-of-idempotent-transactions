import * as Api from "../../index.js";
import { TTestExecute, testExecute } from "./validation/index.js";

export class ApiClass extends Api.JsonRpcV2<TTestExecute> {
	async execute() {
		const { data, error } = await this.services
			.twoPhasedCommitTransaction
			.outerSpace
			.testExecute();

		if (error) return { error };

		return { data: { success: data } };
	}

	static getMethodName() { return testExecute.name; }
	static getSchemas() { return testExecute.schemas; }
}
