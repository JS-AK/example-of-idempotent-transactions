import * as Api from "../../index.js";
import validation, { TGetBalance } from "./validation/index.js";

export class ApiClass extends Api.JsonRpcV2<TGetBalance> {
	constructor(
		payload: TGetBalance["params"],
		options: Api.IBaseClassOpts<TGetBalance>,
	) {
		super(payload, {
			...options,
			schemas: validation.getBalance.schemas,
		});
	}

	static getMethodName() {
		return validation.getBalance.name;
	}

	static getSchemas() {
		return validation.getBalance.schemas;
	}

	async execute() {
		const { data, error } = await this.services
			.user
			.outerSpace
			.getBalance(this.params);

		if (error) return { error };

		return { data: { amount: data } };
	}
}
