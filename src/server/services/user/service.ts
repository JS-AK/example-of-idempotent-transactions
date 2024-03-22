import * as Types from "../../types/index.js";

import BaseService from "../base-service.js";

export default class Service extends BaseService {
	#businessError;
	#crypto;
	#dal;
	#logger;

	constructor(data: {
		businessError: Types.System.BusinessError.Service;
		crypto: Types.System.Crypto.Service;
		dal: Types.ServiceLocator.default["dal"];
		logger: Types.System.Logger.Service;
	}) {
		super();

		this.#businessError = data.businessError;
		this.#crypto = data.crypto;
		this.#dal = data.dal;
		this.#logger = data.logger;
	}

	async #getEntityForCheck(
		payload: { id?: string; hrNumber?: string; email?: string; },
	): Promise<Types.Common.TDataError<Types.Dal.User.Types.EntityForCheck>> {
		const user = await this.#dal
			.repository
			.user
			.getEntityForCheck(payload);

		if (!user) {
			return this.#businessError.user.NOT_FOUND;
		}

		return { data: user };
	}

	innerSpace = {
		getEntityForCheck:
			async (data: { id?: string; }) => this.#getEntityForCheck(data),
	};

	outerSpace = {
		getBalance: async (payload: { id: string; }): Promise<Types.Common.TDataError<number>> => {
			const balance = await this.#dal
				.repository
				.user
				.getBalance(payload);

			return { data: balance };
		},
	};
}
