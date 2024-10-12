import * as IORedis from "ioredis"; // Import the default export from 'ioredis'
import * as bullmq from "bullmq";

export type Job = bullmq.Job;
export type Queue = bullmq.Queue;
export type QueueEvents = bullmq.QueueEvents;
export type Worker = bullmq.Worker;

export class Service {
	#connectionOptions;
	#isConnected = false;

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

		if (!this.#isConnected) throw new Error("Failed to connect to Redis");

		const queue = new bullmq.Queue(queueName, { connection: this.#connectionOptions, defaultJobOptions });
		const queueEvents = new bullmq.QueueEvents(queueName, { connection: this.#connectionOptions });

		return [queue, queueEvents];
	};

	getWorker(): [typeof bullmq.Worker, bullmq.ConnectionOptions] {
		return [bullmq.Worker, this.#connectionOptions];
	}

	async checkConnection(): Promise<boolean> {
		const redis = new IORedis.Redis(this.#connectionOptions);

		redis.on("error", () => { redis.disconnect(); });

		try {
			await redis.ping();

			this.#isConnected = true;

			return true;
		} catch (error) {
			return false;
		} finally {
			redis.disconnect();
		}
	}

	async init(): Promise<void> {
		const connected = await this.checkConnection();

		if (!connected) throw new Error(`Failed to connect to Redis server at ${this.#connectionOptions.host}:${this.#connectionOptions.port}`);
	}
}
