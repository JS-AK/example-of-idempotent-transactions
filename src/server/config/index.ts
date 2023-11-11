import { isMainThread } from "node:worker_threads";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const convertEnvToBoolean = (defaultBoolean: boolean, env?: string) => {
	if (env) {
		if (env.toLowerCase() === "true") return true;
		else if (env.toLowerCase() === "false") return false;
		else throw new Error(`Wrong boolean env ${env} incoming`);
	}

	return defaultBoolean;
};

export type ConfigOptions = {
	DB_POSTGRE_DATABASE: string;
	DB_POSTGRE_HOST: string;
	DB_POSTGRE_PASSWORD: string;
	DB_POSTGRE_PORT: number;
	DB_POSTGRE_USER: string;

	IS_MAIN_THREAD: boolean;

	REDIS_BULLMQ_HOST: string;
	REDIS_BULLMQ_PASSWORD: string;
	REDIS_BULLMQ_PORT: number;

	SERVER_HOST: string;
	SERVER_MODE: string;
	SERVER_PORT: number;
	SERVER_URI: string;
};

type ConfigOptionsRaw = {
	DB_POSTGRE_DATABASE?: string;
	DB_POSTGRE_HOST?: string;
	DB_POSTGRE_PASSWORD?: string;
	DB_POSTGRE_PORT?: string;
	DB_POSTGRE_USER?: string;

	REDIS_BULLMQ_HOST?: string;
	REDIS_BULLMQ_PASSWORD?: string;
	REDIS_BULLMQ_PORT?: string;

	SERVER_HOST?: string;
	SERVER_MODE?: string;
	SERVER_PORT?: string;
	SERVER_URI?: string;
};

const config: ConfigOptionsRaw = {
	DB_POSTGRE_DATABASE: process.env.DB_POSTGRE_DATABASE,
	DB_POSTGRE_HOST: process.env.DB_POSTGRE_HOST,
	DB_POSTGRE_PASSWORD: process.env.DB_POSTGRE_PASSWORD,
	DB_POSTGRE_PORT: process.env.DB_POSTGRE_PORT,
	DB_POSTGRE_USER: process.env.DB_POSTGRE_USER,

	REDIS_BULLMQ_HOST: process.env.REDIS_BULLMQ_HOST,
	REDIS_BULLMQ_PASSWORD: process.env.REDIS_BULLMQ_PASSWORD,
	REDIS_BULLMQ_PORT: process.env.REDIS_BULLMQ_PORT,

	SERVER_HOST: process.env.SERVER_HOST,
	SERVER_MODE: process.env.SERVER_MODE,
	SERVER_PORT: process.env.SERVER_PORT,
	SERVER_URI: process.env.SERVER_URI,
};

export const getConfig = (): {
	data?: ConfigOptions;
	error: number;
	message?: string;
} => {
	for (const [k, v] of Object.entries(config)) {
		if (!v) return { error: 1, message: `Empty env - ${k}` };
	}

	const preparedConfig = { ...config } as Required<ConfigOptionsRaw>;

	return {
		data: {
			DB_POSTGRE_DATABASE: preparedConfig.DB_POSTGRE_DATABASE,
			DB_POSTGRE_HOST: preparedConfig.DB_POSTGRE_HOST,
			DB_POSTGRE_PASSWORD: preparedConfig.DB_POSTGRE_PASSWORD,
			DB_POSTGRE_PORT: parseInt(preparedConfig.DB_POSTGRE_PORT, 10),
			DB_POSTGRE_USER: preparedConfig.DB_POSTGRE_USER,

			IS_MAIN_THREAD: isMainThread,

			REDIS_BULLMQ_HOST: preparedConfig.REDIS_BULLMQ_HOST,
			REDIS_BULLMQ_PASSWORD: preparedConfig.REDIS_BULLMQ_PASSWORD,
			REDIS_BULLMQ_PORT: parseInt(preparedConfig.REDIS_BULLMQ_PORT),

			SERVER_HOST: preparedConfig.SERVER_HOST,
			SERVER_MODE: preparedConfig.SERVER_MODE,
			SERVER_PORT: parseInt(preparedConfig.SERVER_PORT, 10),
			SERVER_URI: preparedConfig.SERVER_URI,
		},
		error: 0,
	};
};
