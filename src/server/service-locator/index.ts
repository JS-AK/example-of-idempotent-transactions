import * as Types from "../types/index.js";

import * as Services from "../services/index.js";
import * as System from "../system/index.js";
import { RepositoryManager } from "../data-access-layer/index.js";

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

		systemLogger.isEnabled = !config.IS_TEST;

		this.loggers = {
			api: systemLogger.child({ pSource: "API", pThread: this.getThread() }),
			common: systemLogger.child({ pSource: "COMMON", pThread: this.getThread() }),
			pg: systemLogger.child({ pSource: "PG", pThread: this.getThread() }),
			queueManager: systemLogger.child({ pSource: "SERVICE-QUEUE-MANAGE", pThread: this.getThread() }),
			twoPhasedCommitTransaction: systemLogger.child({ pSource: "SERVICE-TWO-PHASED-COMMIT-TRANSACTION", pThread: this.getThread() }),
			user: systemLogger.child({ pSource: "SERVICE-USER", pThread: this.getThread() }),
			userBalanceMovingTransaction: systemLogger.child({ pSource: "SERVICE-USER-BALANCE-MOVING-TRANSACTION", pThread: this.getThread() }),
		};

		this.dal = RepositoryManager.init(
			{
				database: this.config.DB_POSTGRE_DATABASE,
				host: this.config.DB_POSTGRE_HOST,
				password: this.config.DB_POSTGRE_PASSWORD,
				port: this.config.DB_POSTGRE_PORT,
				user: this.config.DB_POSTGRE_USER,
			},
			{
				isLoggerEnabled: true,
				logger: this.loggers.pg,
			},
		);

		this.system = {
			JsonRpc: System.JsonRpc.Service,
			bullmq: new System.BullMQ.Service({
				config: {
					host: this.config.REDIS_HOST,
					password: this.config.REDIS_PASSWORD,
					port: this.config.REDIS_PORT,
				},
			}),
			businessError: new System.BusinessError.Service(),
			crypto: new System.Crypto.Service(),
			jwt: new System.Jwt.Service({
				config: {
					audience: config.JWT_AUDIENCE,
					issuer: config.JWT_ISSUER,
					secret: config.JWT_SECRET,
					ttl: config.JWT_ACCESS_TTL,
					type: config.JWT_ACCESS,
				},
			}),
		};

		this.services = {
			queueManager: new Services.QueueManager.Service.default({
				bullmq: this.system.bullmq,
				config: this.config,
				logger: this.loggers.queueManager,
			}),
			twoPhasedCommitTransaction: new Services.TwoPhasedCommitTransaction.Service.default({
				businessError: this.system.businessError,
				dal: this.dal,
				logger: this.loggers.twoPhasedCommitTransaction,
			}),
			user: new Services.User.Service.default({
				businessError: this.system.businessError,
				dal: this.dal,
				logger: this.loggers.user,
			}),
			userBalanceMovingTransaction: new Services.UserBalanceMovingTransaction.Service.default({
				businessError: this.system.businessError,
				dal: this.dal,
				logger: this.loggers.userBalanceMovingTransaction,
			}),
		};

		Object.values(this.services).forEach((service) => {
			if (service instanceof Services.BaseService.default) {
				service.injectServices(this.services);
			}
		});
	}

	#save() {
		store.sl = this;
	}

	async init() {
		try {
			process.env.TZ = "UTC";

			await this.dal.init();
			await this.system.bullmq.init();

			this.services.queueManager.init();

			this.#save();
		} catch (error) {
			await this.shutdown();

			throw error;
		}
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
