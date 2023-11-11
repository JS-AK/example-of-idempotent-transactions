import * as Transport from "./transport/index.js";
import { ConfigOptions } from "./config/index.js";
import ServiceLocator from "./service-locator/index.js";

export async function init(config: ConfigOptions) {
	const sl = new ServiceLocator(config);

	await sl.init();

	const fastifyInstance = new Transport.Fastify.Server({
		host: config.SERVER_HOST,
		logger: sl.loggers.api,
		mode: config.SERVER_MODE,
		port: config.SERVER_PORT,
		sl,
		uri: config.SERVER_URI,
	});

	await fastifyInstance.listen();

	return fastifyInstance;
}

export const shutdown = async () => {
	await ServiceLocator.removeSL();
};
