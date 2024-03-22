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
		.Down
		.start(pool, {
			migrationsTableName: "migration_control",
			pathToSQL: path.resolve(process.cwd(), "src", "migrations", "sql"),
		});

	await pool.end();
}
