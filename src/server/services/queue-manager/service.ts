import * as Types from "../../types/index.js";

import BaseService from "../base-service.js";

export default class Service extends BaseService {
	#bullmq;
	#config;
	#logger;

	#queues!: {
		["user-balance-moving-transaction-reduce"]: [
			Types.System.BullMQ.Queue,
			Types.System.BullMQ.QueueEvents,
			Types.System.BullMQ.Worker,
		];
	};

	constructor(data: {
		bullmq: Types.System.BullMQ.Service;
		config: Types.Config.ConfigOptions;
		logger: Types.System.Logger.Service;
	}) {
		super();

		this.#bullmq = data.bullmq;
		this.#config = data.config;
		this.#logger = data.logger;
	}

	init(): void {
		this.#queues = {
			["user-balance-moving-transaction-reduce"]: this.#initUserBalanceMovingTransactionReduce(),
		};
	}

	#initQueue(queueName: string) {
		const [queue, queueEvents] = this.#bullmq.createQueueData(queueName);

		queue.on("error", (error) => {
			this.#logger.error(`${queueName}. Queue error with reason: ${error.message}`);
		});

		if (this.#config.IS_MAIN_THREAD) {
			queueEvents.on("error", (error: Error) => {
				this.#logger.error(`${queueName}. Queue events error with reason: ${error.message}`);
			});

			queueEvents.on("waiting", ({ jobId }) => {
				this.#logger.info(`${queueName}. Job ${jobId} is waiting`);
			});

			queueEvents.on("active", ({ jobId, prev }) => {
				this.#logger.info(`${queueName}. Job ${jobId} is now active; previous status was ${prev}`);
			});

			queueEvents.on("completed", ({ jobId }) => {
				this.#logger.info(`${queueName}. Job ${jobId} has completed`);
			});

			queueEvents.on("failed", ({ failedReason, jobId }) => {
				this.#logger.error(`${queueName}. Job ${jobId} has failed with reason ${failedReason}`);
			});
		}

		return [queue, queueEvents] as [Types.System.BullMQ.Queue, Types.System.BullMQ.QueueEvents];
	}

	#initUserBalanceMovingTransactionReduceWorker(
		queueName: string,
		cb: (job: Types.System.BullMQ.Job,) => Promise<unknown>,
	) {
		if (!this.#config.IS_MAIN_THREAD) return;

		const [Worker, connection] = this.#bullmq.getWorker();

		const worker = new Worker(
			queueName,
			cb,
			{
				concurrency: 1,
				connection,
				lockDuration: 5 * 60_000,
				removeOnComplete: { count: 1000 },
				removeOnFail: { count: 5000 },
			},
		);

		worker.on("failed", (job, error) => {
			this.#logger.error(`${queueName}. Job ${job?.id}. Worker was failed with error: ${error.message}`);
		});

		worker.on("error", (error) => {
			this.#logger.error(`${queueName}. Worker was failed with error: ${error.message}`);
		});

		return worker;
	}

	#initUserBalanceMovingTransactionReduce() {
		const queueName = "USER-BALANCE-MOVING-TRANSACTION-REDUCE";
		const [queue, queueEvents] = this.#initQueue(queueName);

		const worker = this.#initUserBalanceMovingTransactionReduceWorker(
			queueName,
			async (job) => {
				try {
					return this.services.userBalanceMovingTransaction.queueJobs.reduceBalance(job.data);
				} catch (error) {
					throw error;
				}
			},
		);

		if (!worker) throw new Error("worker is not initialized");

		return [
			queue,
			queueEvents,
			worker,
		] as [Types.System.BullMQ.Queue, Types.System.BullMQ.QueueEvents, Types.System.BullMQ.Worker];
	}

	queues = {
		userBalanceMovingTransactionReduce: {
			exec: async (
				data: {
					deltaChange: number;
					uniqueIdentificator: string;
					userId: string;
				},
			) => {
				const jobName = this.queues
					.userBalanceMovingTransactionReduce
					.getJobName();
				const job = await this.#queues["user-balance-moving-transaction-reduce"][0].add(
					jobName,
					data,
					{ attempts: 1 },
				);

				return job.waitUntilFinished(this.#queues["user-balance-moving-transaction-reduce"][1]);
			},
			getJobName: () => "user-balance-moving-transaction-reduce",
		},
	};

	async shutdown(): Promise<void> {
		if (!this.#queues) return;

		const [
			queue,
			queueEvents,
			worker,
		] = this.#queues["user-balance-moving-transaction-reduce"];

		await Promise.all([
			queue.close(),
			queueEvents.close(),
			worker.close(),
		]);
	}
}
