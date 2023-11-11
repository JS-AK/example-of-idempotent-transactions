import { getConfig } from "./config/index.js";
import { init } from "./app.js";

const { data: config, message } = getConfig();

if (!config) {
	process.stderr.write(`${message}\n`);
	process.exit(1);
} else {
	await init(config);
}
