import * as crypto from "node:crypto";
import { isMainThread } from "node:worker_threads";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import test from "node:test";

import * as DbManager from "@js-ak/db-manager";

import * as Types from "../../server/types/index.js";
import { init, shutdown } from "../../server/app.js";

const config: Types.Config.ConfigOptions = {
	DB_POSTGRE_DATABASE: "postgres",
	DB_POSTGRE_HOST: "localhost",
	DB_POSTGRE_PASSWORD: "admin",
	DB_POSTGRE_PORT: 5432,
	DB_POSTGRE_USER: "postgres",

	IS_MAIN_THREAD: isMainThread,

	REDIS_BULLMQ_HOST: "localhost",
	REDIS_BULLMQ_PASSWORD: "redis_password",
	REDIS_BULLMQ_PORT: 6379,

	SERVER_HOST: "localhost",
	SERVER_MODE: "DEV",
	SERVER_PORT: 5000,
	SERVER_URI: "http://localhost",
};

export default async () => {
	return test("main workflow", async (test) => {
		await test.test("db down", async () => {
			const dbConfig = {
				database: config.DB_POSTGRE_DATABASE,
				host: config.DB_POSTGRE_HOST,
				password: config.DB_POSTGRE_PASSWORD,
				port: config.DB_POSTGRE_PORT,
				user: config.DB_POSTGRE_USER,
			};

			const pool = DbManager.PG.BaseModel.getStandardPool(dbConfig);

			await DbManager
				.PG
				.MigrationSystem
				.Down
				.start(pool, {
					pathToSQL: path.resolve(process.cwd(), "src", "migrations", "sql"),
				});

			await DbManager.PG.BaseModel.removeStandardPool(dbConfig);
		});

		await test.test("db up", async () => {
			const dbConfig = {
				database: config.DB_POSTGRE_DATABASE,
				host: config.DB_POSTGRE_HOST,
				password: config.DB_POSTGRE_PASSWORD,
				port: config.DB_POSTGRE_PORT,
				user: config.DB_POSTGRE_USER,
			};

			const pool = DbManager.PG.BaseModel.getStandardPool(dbConfig);

			await DbManager
				.PG
				.MigrationSystem
				.Up
				.start(pool, {
					migrationsTableName: "migration_control",
					// pathToJS: path.resolve(process.cwd(), "build", "migrations", "js"),
					pathToSQL: path.resolve(process.cwd(), "src", "migrations", "sql"),
				});

			await DbManager.PG.BaseModel.removeStandardPool(dbConfig);
		});

		await test.test("initialize app", async (test) => {
			const server = await init(config);

			await test.test("Service outer methods", async () => {
				const promises = [];
				const method = "user-balance-moving-transaction/update-user-balance";
				const url = `${config.SERVER_URI}:${config.SERVER_PORT}`;

				await setTimeout(1000);

				for (let idx = 0; idx < 100; idx++) {
					promises.push(fetch(`${url}/api/${method}`, {
						body: JSON.stringify({
							id: crypto.randomUUID({ disableEntropyCache: true }),
							jsonrpc: "2.0",
							method,
							params: {
								deltaChange: 133,
								operation: "reduce",
								uniqueIdentificator: crypto.randomUUID({ disableEntropyCache: true }),
								userId: "1",
							},
						}),
						headers: { "Content-Type": "application/json" },
						method: "POST",
					}));
				}

				await Promise.all(promises);
			});

			await server.close();
		});

		await test.test("db down", async () => {
			const dbConfig = {
				database: config.DB_POSTGRE_DATABASE,
				host: config.DB_POSTGRE_HOST,
				password: config.DB_POSTGRE_PASSWORD,
				port: config.DB_POSTGRE_PORT,
				user: config.DB_POSTGRE_USER,
			};

			const pool = DbManager.PG.BaseModel.getStandardPool(dbConfig);

			await DbManager
				.PG
				.MigrationSystem
				.Down
				.start(pool, {
					pathToSQL: path.resolve(process.cwd(), "src", "migrations", "sql"),
				});

			await DbManager.PG.BaseModel.removeStandardPool(dbConfig);
		});
	});
};
