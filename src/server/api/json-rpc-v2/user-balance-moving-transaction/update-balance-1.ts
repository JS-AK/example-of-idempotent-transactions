import * as Api from "../../index.js";
import { TUpdateBalance1, updateBalance1 } from "./validation/index.js";

export class ApiClass extends Api.JsonRpcV2<TUpdateBalance1> {
	async execute() {
		const { data, error } = await this.services
			.userBalanceMovingTransaction
			.outerSpace
			.updateBalance1(this.params);

		if (error) return { error };

		return { data: { success: data } };
	}

	static getMethodName() { return updateBalance1.name; }
	static getSchemas() { return updateBalance1.schemas; }
}
