import * as Types from "../../types/index.js";

import BaseService from "../base-service.js";

export default class Service extends BaseService {
	#businessError;
	#logger;
	#repository;
	#dal;

	constructor(data: {
		businessError: Types.System.BusinessError.Service;
		dal: Types.ServiceLocator.default["dal"];
		logger: Types.System.Logger.Service;
	}) {
		super();

		this.#businessError = data.businessError;
		this.#logger = data.logger;

		this.#repository = data.dal.repository.twoPhasedCommitTransaction;
		this.#dal = data.dal;
	}

	async #execute(payload: {
		idempotenceKey: string;
	}): Promise<Types.Common.TDataError<true>> {
		const { idempotenceKey } = payload;

		const transaction = await this.#repository.createOne({
			idempotence_key: idempotenceKey,
			started_at: new Date(),
			status: "created",
		});

		if (!transaction) {
			this.#logger.error("Something went wrong");

			return this.#businessError.common.UNKNOWN_ERROR;
		}

		const data = await this.#dal.executeTransaction(async (client) => {
			const token1 = crypto.randomUUID();
			const token2 = crypto.randomUUID();

			await this.#repository
				.setClientInCurrentClass(client)
				.updateOneByPk(transaction.id, {
					finished_at: new Date(),
					status: "in_progress",
				});

			try {
				await this.services
					.user
					.outerSpace
					.abTest1(token1);

				await this.services
					.user
					.outerSpace
					.abTest2(token2);

				await Promise.all([
					this.services.user.outerSpace.closeTransaction(token1, "success"),
					this.services.user.outerSpace.closeTransaction(token2, "success"),
				]);

				await this.#repository
					.setClientInCurrentClass(client)
					.updateOneByPk(transaction.id, {
						finished_at: new Date(),
						status: "success",
					});

				return { success: true };
			} catch (error) {
				await Promise.all([
					this.services.user.outerSpace.closeTransaction(token1, "failed"),
					this.services.user.outerSpace.closeTransaction(token2, "failed"),
				]);

				throw error;
			}
		}).catch((e) => this.#logger.error(e.message));

		if (!data) {
			await this.#repository.updateOneByPk(transaction.id, {
				finished_at: new Date(),
				status: "failed",
			});

			return this.#businessError.common.UNKNOWN_ERROR;
		}

		return { data: true };
	}

	innerSpace = {
		execute: this.#execute.bind(this),
	};

	outerSpace = {
		testExecute: async (): Promise<Types.Common.TDataError<boolean>> => {
			await this.#execute({ idempotenceKey: crypto.randomUUID() });

			return { data: true };
		},
	};
}
