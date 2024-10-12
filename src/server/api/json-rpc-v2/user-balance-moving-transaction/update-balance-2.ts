import * as Api from "../../index.js";
import { TUpdateBalance2, updateBalance2 } from "./validation/index.js";

export class ApiClass extends Api.JsonRpcV2<TUpdateBalance2> {
	async execute() {
		const { data, error } = await this.services
			.userBalanceMovingTransaction
			.outerSpace
			.updateBalance2(this.params);

		if (error) return { error };

		return { data: { success: data } };
	}

	static getMethodName() { return updateBalance2.name; }
	static getSchemas() { return updateBalance2.schemas; }
}
