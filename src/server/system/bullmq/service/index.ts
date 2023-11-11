import * as bullmq from "bullmq";

export type Job = bullmq.Job;
export type Queue = bullmq.Queue;
export type QueueEvents = bullmq.QueueEvents;
export type Worker = bullmq.Worker;

export class Service {
	#connectionOptions: bullmq.ConnectionOptions;

	constructor(data: {
		config: { host: string; password: string; port: number; };
	}) {
		this.#connectionOptions = {
			host: data.config.host,
			password: data.config.password,
			port: data.config.port,
		};
	}

	createQueueData(
		queueName: string,
		opts?: bullmq.DefaultJobOptions,
	): [bullmq.Queue, bullmq.QueueEvents] {
		const defaultJobOptions = opts || {
			attempts: 1_000,
			backoff: { delay: 5000, type: "fixed" },
		};

		return [
			new bullmq.Queue(queueName, { connection: this.#connectionOptions, defaultJobOptions }),
			new bullmq.QueueEvents(queueName, { connection: this.#connectionOptions }),
		];
	};

	getWorker(): [typeof bullmq.Worker, bullmq.ConnectionOptions] {
		return [bullmq.Worker, this.#connectionOptions];
	}
}
