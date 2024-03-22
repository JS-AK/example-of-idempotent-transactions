import * as Types from "../types/index.js";

import * as Dal from "../data-access-layer/index.js";
import * as Services from "../services/index.js";
import * as System from "../system/index.js";

const store: { sl?: ServiceLocator; } = { sl: undefined };

export default class ServiceLocator {
	config;
	dal;
	loggers;
	services;
	system;

	constructor(config: Types.Config.ConfigOptions) {
		this.config = config;

		const systemLogger = new System.Logger.Service();

		this.loggers = {
			api: systemLogger.child({ pSource: "API", pThread: this.getThread() }),
			bullmq: systemLogger.child({ pSource: "BULLMQ", pThread: this.getThread() }),
			common: systemLogger.child({ pSource: "COMMON", pThread: this.getThread() }),
			pg: systemLogger.child({ pSource: "PG", pThread: this.getThread() }),
			service: systemLogger.child({ pSource: "SERVICE", pThread: this.getThread() }),
		};

		this.dal = Dal.init({
			config: {
				database: this.config.DB_POSTGRE_DATABASE,
				host: this.config.DB_POSTGRE_HOST,
				password: this.config.DB_POSTGRE_PASSWORD,
				port: this.config.DB_POSTGRE_PORT,
				user: this.config.DB_POSTGRE_USER,
			},
			logger: this.loggers.pg,
		});

		this.system = {
			JsonRpc: System.JsonRpc.Service,
			bullmq: new System.BullMQ.Service({
				config: {
					host: this.config.REDIS_BULLMQ_HOST,
					password: this.config.REDIS_BULLMQ_PASSWORD,
					port: this.config.REDIS_BULLMQ_PORT,
				},
			}),
			businessError: new System.BusinessError.Service(),
			crypto: new System.Crypto.Service(),
		};

		this.services = {
			queueManager: new Services.QueueManager.Service.default({
				bullmq: this.system.bullmq,
				config: this.config,
				logger: this.loggers.bullmq,
			}),
			user: new Services.User.Service.default({
				businessError: this.system.businessError,
				crypto: this.system.crypto,
				dal: this.dal,
				logger: this.loggers.service,
			}),
			userBalanceMovingTransaction: new Services.UserBalanceMovingTransaction.Service.default({
				businessError: this.system.businessError,
				dal: this.dal,
				logger: this.loggers.service,
			}),
		};

		Object.values(this.services).forEach((e) => {
			if (e instanceof Services.BaseService.default) {
				e.injectServices(this.services);
			}
		});
	}

	#save() {
		store.sl = this;
	}

	async init() {
		process.env.TZ = "UTC";

		this.#save();
	}

	getThread() {
		return this.config.IS_MAIN_THREAD
			? "MAIN-THREAD"
			: "CHILD-THREAD";
	}

	async shutdown() {
		await this.dal.shutdown();
		await this.services.queueManager.shutdown();
	}

	static getSL() {
		const sl = store.sl;

		if (!sl) throw new Error("Service Locator actually is not prepared");

		return sl;
	}

	static async removeSL() {
		const sl = store.sl;

		if (!sl) throw new Error("Service Locator actually is not prepared");

		await sl.dal.shutdown();
		await sl.services.queueManager.shutdown();

		store.sl = undefined;
	}
}
