import * as Api from "../../index.js";
import validation, { TUpdateBalance } from "./validation/index.js";

export class ApiClass extends Api.JsonRpcV2<TUpdateBalance> {
	async execute() {
		const { data, error } = await this.services
			.userBalanceMovingTransaction
			.outerSpace
			.updateBalance2(this.params);

		if (error) return { error };

		return { data: { success: data } };
	}

	static getMethodName() {
		return validation.updateBalance2.name;
	}

	static getSchemas() {
		return validation.updateBalance2.schemas;
	}

}
