import * as Api from "../../index.js";
import validation, { TUpdateBalance } from "./validation/index.js";

export class ApiClass extends Api.JsonRpcV2<TUpdateBalance> {
	constructor(
		payload: TUpdateBalance["params"],
		options: Api.IBaseClassOpts<TUpdateBalance>,
	) {
		super(payload, {
			...options,
			schemas: validation.updateBalance2.schemas,
		});
	}

	static getMethodName() {
		return validation.updateBalance2.name;
	}

	static getSchemas() {
		return validation.updateBalance2.schemas;
	}

	async execute() {
		const { data, error } = await this.services
			.userBalanceMovingTransaction
			.outerSpace
			.updateBalance2(this.params);

		if (error) return { error };

		return { data: { success: data } };
	}
}
