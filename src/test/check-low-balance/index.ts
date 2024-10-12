import assert from "node:assert";
import { isMainThread } from "node:worker_threads";
import path from "node:path";
import { setTimeout } from "node:timers/promises";
import test from "node:test";

import * as DbManager from "@js-ak/db-manager";

import * as Types from "../../server/types/index.js";
import { init } from "../../server/app.js";

const config: Types.Config.ConfigOptions = {
	DB_POSTGRE_DATABASE: "postgres",
	DB_POSTGRE_HOST: "localhost",
	DB_POSTGRE_PASSWORD: "admin",
	DB_POSTGRE_PORT: 5432,
	DB_POSTGRE_USER: "postgres",

	IS_MAIN_THREAD: isMainThread,
	IS_TEST: true,

	JWT_ACCESS: "JWT_ACCESS",
	JWT_ACCESS_TTL: 60 * 60 * 1000,
	JWT_AUDIENCE: "JWT_AUDIENCE",
	JWT_ISSUER: "JWT_ISSUER",
	JWT_SECRET: "JWT_SECRET",

	REDIS_HOST: "localhost",
	REDIS_PASSWORD: "redis_password",
	REDIS_PORT: 6379,

	SERVER_HOST: "localhost",
	SERVER_MODE: "DEV",
	SERVER_PORT: 5000,
	SERVER_URI: "http://localhost",
};

const dbConfig = {
	database: config.DB_POSTGRE_DATABASE,
	host: config.DB_POSTGRE_HOST,
	password: config.DB_POSTGRE_PASSWORD,
	port: config.DB_POSTGRE_PORT,
	user: config.DB_POSTGRE_USER,
};

export default async () => {
	const url = `${config.SERVER_URI}:${config.SERVER_PORT}`;

	return test("main workflow", async (ctx) => {
		await ctx.test("db down", async () => {
			const pool = DbManager.PG.BaseModel.getStandardPool(dbConfig);

			await DbManager.PG.MigrationSystem.Down.start(pool, {
				logger: false,
				migrationsTableName: "migration_control",
				pathToSQL: path.resolve(process.cwd(), "src", "migrations", "sql"),
			});

			await DbManager.PG.BaseModel.removeStandardPool(dbConfig);
		});

		await ctx.test("db up", async () => {
			const dbConfig = {
				database: config.DB_POSTGRE_DATABASE,
				host: config.DB_POSTGRE_HOST,
				password: config.DB_POSTGRE_PASSWORD,
				port: config.DB_POSTGRE_PORT,
				user: config.DB_POSTGRE_USER,
			};

			const pool = DbManager.PG.BaseModel.getStandardPool(dbConfig);

			await DbManager.PG.MigrationSystem.Up.start(pool, {
				logger: false,
				migrationsTableName: "migration_control",
				pathToSQL: path.resolve(process.cwd(), "src", "migrations", "sql"),
			});

			await DbManager.PG.BaseModel.removeStandardPool(dbConfig);
		});

		await ctx.test("initialize app", async (ctx) => {
			const server = await init(config);

			await setTimeout(1000);

			await ctx.test("get-user-balance", async () => {
				const method = "user/get-balance";

				const res = await fetch(`${url}/api/${method}`, {
					body: JSON.stringify({
						id: crypto.randomUUID(),
						jsonrpc: "2.0",
						method,
						params: { id: "1" },
					}),
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});

				const data = await res.json();

				assert.equal(data.result.amount, 10000);
			});

			await ctx.test("update-user-balance-1", async () => {
				const promises = [];
				const method = "user-balance-moving-transaction/update-user-balance-1";

				for (let idx = 0; idx < 10; idx++) {
					promises.push(fetch(`${url}/api/${method}`, {
						body: JSON.stringify({
							id: crypto.randomUUID(),
							jsonrpc: "2.0",
							method,
							params: {
								deltaChange: 1330,
								operation: "reduce",
								uniqueIdentificator: crypto.randomUUID(),
								userId: "1",
							},
						}),
						headers: { "Content-Type": "application/json" },
						method: "POST",
					}));
				}

				await Promise.all(promises);

				await setTimeout(10000);

				{
					const method = "user/get-balance";

					const res = await fetch(`${url}/api/${method}`, {
						body: JSON.stringify({
							id: crypto.randomUUID(),
							jsonrpc: "2.0",
							method,
							params: { id: "1" },
						}),
						headers: { "Content-Type": "application/json" },
						method: "POST",
					});

					const data = await res.json();

					assert.equal(data.result.amount >= 0, true);
				}
			});

			await ctx.test("get-user-balance-2", async () => {
				const method = "user/get-balance";

				const res = await fetch(`${url}/api/${method}`, {
					body: JSON.stringify({
						id: crypto.randomUUID(),
						jsonrpc: "2.0",
						method,
						params: { id: "2" },
					}),
					headers: { "Content-Type": "application/json" },
					method: "POST",
				});

				const data = await res.json();

				assert.equal(data.result.amount, 10000);
			});

			await ctx.test("update-user-balance-2", async () => {
				const promises = [];
				const method = "user-balance-moving-transaction/update-user-balance-2";

				for (let idx = 0; idx < 10; idx++) {
					promises.push(fetch(`${url}/api/${method}`, {
						body: JSON.stringify({
							id: crypto.randomUUID(),
							jsonrpc: "2.0",
							method,
							params: {
								deltaChange: 1330,
								operation: "reduce",
								uniqueIdentificator: crypto.randomUUID(),
								userId: "2",
							},
						}),
						headers: { "Content-Type": "application/json" },
						method: "POST",
					}));
				}

				await Promise.all(promises);

				await setTimeout(10000);

				{
					const method = "user/get-balance";

					const res = await fetch(`${url}/api/${method}`, {
						body: JSON.stringify({
							id: crypto.randomUUID(),
							jsonrpc: "2.0",
							method,
							params: { id: "2" },
						}),
						headers: { "Content-Type": "application/json" },
						method: "POST",
					});

					const data = await res.json();

					assert.equal(data.result.amount >= 0, true);
				}
			});

			await server.close();
		});

		await ctx.test("db down", async () => {
			const pool = DbManager.PG.BaseModel.getStandardPool(dbConfig);

			await DbManager.PG.MigrationSystem.Down.start(pool, {
				logger: false,
				migrationsTableName: "migration_control",
				pathToSQL: path.resolve(process.cwd(), "src", "migrations", "sql"),
			});

			await DbManager.PG.connection.shutdown();
		});
	});
};
