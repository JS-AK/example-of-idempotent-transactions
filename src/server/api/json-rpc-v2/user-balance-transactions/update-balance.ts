import * as Api from "../../index.js";
import validation, { TUpdateBalance } from "./validation/index.js";

import * as Types from "../../../types/index.js";

export class ApiClass extends Api.JsonRpcV2<TUpdateBalance["params"]> {
	constructor(
		payload: TUpdateBalance["params"],
		options: Api.IBaseClassOpts<TUpdateBalance["params"]>,
	) {
		super(payload, {
			...options,
			schemas: validation.updateBalance.schemas,
		});
	}

	static getMethodName() {
		return validation.updateBalance.name;
	}

	static getSchemas() {
		return validation.updateBalance.schemas;
	}

	async execute(): Promise<Types.Common.TDataError<TUpdateBalance["result"]>> {
		const { data, error } = await this.services
			.userBalanceMovingTransaction
			.outerSpace
			.updateBalance(this.params);

		if (error) return { error };

		return { data };
	}
}
