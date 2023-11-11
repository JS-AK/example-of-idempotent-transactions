import path from "node:path";

import * as DbManager from "@js-ak/db-manager";

await DbManager
	.PG
	.MigrationSystem
	.CreateEmptySQL
	.create(path.resolve(process.cwd(), "src", "migrations", "sql"));

process.exit(0);
