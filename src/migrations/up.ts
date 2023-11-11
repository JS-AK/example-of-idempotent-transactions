import path from "node:path";

import * as DbManager from "@js-ak/db-manager";

import { getConfig } from "../server/config/index.js";

const { data: dataConfig, message } = getConfig();

if (!dataConfig) {
	process.stderr.write(`${message}\n`);
	process.exit(1);
} else {
	const pool = DbManager.PG.BaseModel.getStandardPool({
		database: dataConfig.DB_POSTGRE_DATABASE,
		host: dataConfig.DB_POSTGRE_HOST,
		password: dataConfig.DB_POSTGRE_PASSWORD,
		port: dataConfig.DB_POSTGRE_PORT,
		user: dataConfig.DB_POSTGRE_USER,
	});

	await DbManager
		.PG
		.MigrationSystem
		.Up
		.start(pool, {
			migrationsTableName: "migration_control",
			// pathToJS: path.resolve(process.cwd(), "build", "migrations", "js"),
			pathToSQL: path.resolve(process.cwd(), "src", "migrations", "sql"),
		});

	await pool.end();
}
