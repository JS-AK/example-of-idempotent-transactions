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
	IS_TEST: boolean;

	JWT_ACCESS: string;
	JWT_ACCESS_TTL: number;
	JWT_AUDIENCE: string;
	JWT_ISSUER: string;
	JWT_SECRET: string;

	REDIS_HOST: string;
	REDIS_PASSWORD: string;
	REDIS_PORT: number;

	SERVER_HOST: string;
	SERVER_MODE: string;
	SERVER_PORT: number;
	SERVER_URI: string;
};

type ConfigOptionsRaw = {
	JWT_ACCESS?: string;
	JWT_ACCESS_TTL?: string;
	JWT_AUDIENCE?: string;
	JWT_ISSUER?: string;
	JWT_SECRET?: string;

	DB_POSTGRE_DATABASE?: string;
	DB_POSTGRE_HOST?: string;
	DB_POSTGRE_PASSWORD?: string;
	DB_POSTGRE_PORT?: string;
	DB_POSTGRE_USER?: string;

	REDIS_HOST?: string;
	REDIS_PASSWORD?: string;
	REDIS_PORT?: string;

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

	JWT_ACCESS: process.env.JWT_ACCESS,
	JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL,
	JWT_AUDIENCE: process.env.JWT_AUDIENCE,
	JWT_ISSUER: process.env.JWT_ISSUER,
	JWT_SECRET: process.env.JWT_SECRET,

	REDIS_HOST: process.env.REDIS_HOST,
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
	REDIS_PORT: process.env.REDIS_PORT,

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
			DB_POSTGRE_PORT: Number(preparedConfig.DB_POSTGRE_PORT),
			DB_POSTGRE_USER: preparedConfig.DB_POSTGRE_USER,

			IS_MAIN_THREAD: isMainThread,
			IS_TEST: false,

			JWT_ACCESS: preparedConfig.JWT_ACCESS,
			JWT_ACCESS_TTL: Number(preparedConfig.JWT_ACCESS_TTL), // (s)
			JWT_AUDIENCE: preparedConfig.JWT_AUDIENCE,
			JWT_ISSUER: preparedConfig.JWT_ISSUER,
			JWT_SECRET: preparedConfig.JWT_SECRET,

			REDIS_HOST: preparedConfig.REDIS_HOST,
			REDIS_PASSWORD: preparedConfig.REDIS_PASSWORD,
			REDIS_PORT: parseInt(preparedConfig.REDIS_PORT),

			SERVER_HOST: preparedConfig.SERVER_HOST,
			SERVER_MODE: preparedConfig.SERVER_MODE,
			SERVER_PORT: Number(preparedConfig.SERVER_PORT),
			SERVER_URI: preparedConfig.SERVER_URI,
		},
		error: 0,
	};
};
