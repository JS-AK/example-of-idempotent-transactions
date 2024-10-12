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
	#isEnabled: boolean;

	constructor(logger?: pino.Logger, isEnabled?: boolean) {
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

		this.#isEnabled = typeof isEnabled === "boolean" ? isEnabled : true;
	}

	set isEnabled(isEnabled: boolean) {
		this.#isEnabled = isEnabled;
	}

	child(bindings: pino.Bindings, isEnabled?: boolean): Service {
		const childLogger = this.#logger.child(bindings);

		return new Service(childLogger, typeof isEnabled === "boolean" ? isEnabled : this.#isEnabled);
	}

	debug(message: string, data?: Record<string, unknown> | undefined): void {
		if (!this.#isEnabled) return;

		this.#logger.debug(data ? { data, message } : message);
	}

	info(message: string, data?: Record<string, unknown> | undefined): void {
		if (!this.#isEnabled) return;

		this.#logger.info(data ? { data, message } : message);
	}

	warn(message: string, data?: Record<string, unknown> | undefined): void {
		if (!this.#isEnabled) return;

		this.#logger.warn(data ? { data, message } : message);
	}

	error(message: string, data?: Record<string, unknown> | undefined): void {
		if (!this.#isEnabled) return;

		this.#logger.error(data ? { data, message } : message);
	}
}
