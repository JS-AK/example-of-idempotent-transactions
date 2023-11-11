import pino from "pino";

interface ILogger {
	child(bindings: pino.Bindings): ILogger;
	debug(message: string, data?: Record<string, unknown>): void;
	info(message: string, data?: Record<string, unknown>): void;
	warn(message: string, data?: Record<string, unknown>): void;
	error(message: string, data?: Record<string, unknown>): void;
}

export class Service implements ILogger {
	#logger: pino.Logger;

	constructor(logger?: pino.Logger) {
		this.#logger = logger || pino.default({
			transport: {
				options: {
					colorize: false,
					ignore: "hostname,pid,pSource,pThread",
					messageFormat: "({pThread}:{pSource}) {msg}",
					singleLine: true,
					translateTime: "SYS:standard",
				},
				target: "pino-pretty",
			},
		});
	}

	child(bindings: pino.Bindings): Service {
		const childLogger = this.#logger.child(bindings);

		return new Service(childLogger);
	}

	debug(message: string, data?: Record<string, unknown> | undefined): void {
		this.#logger.debug(data ? { data, message } : message);
	}

	info(message: string, data?: Record<string, unknown> | undefined): void {
		this.#logger.info(data ? { data, message } : message);
	}

	warn(message: string, data?: Record<string, unknown> | undefined): void {
		this.#logger.warn(data ? { data, message } : message);
	}

	error(message: string, data?: Record<string, unknown> | undefined): void {
		this.#logger.error(data ? { data, message } : message);
	}
}
