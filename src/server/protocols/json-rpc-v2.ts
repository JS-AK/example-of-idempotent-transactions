import { performance } from "node:perf_hooks";

import * as Types from "../types/index.js";

import * as Api from "../api/lib/json-rpc-v2.js";

type JsonRpcRequest = {
	data: Types.System.JsonRpc.Types.Request;
};

function GetTimeExec() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
	return function decorator(originalMethod: any, context: ClassMethodDecoratorContext) {
		async function replacementMethod(
			this: Protocol,
			request: JsonRpcRequest,
		) {
			const start = performance.now();
			const result = await originalMethod.call(this, request);
			const isHaveError = !!result?.error;
			const execTime = Math.round(performance.now() - start);

			if (isHaveError) {
				const requestText = `Request: ${JSON.stringify(request.data)}`;
				const responseText = `Response: ${JSON.stringify(result)}`;

				this.logger.warn(`${requestText}. ${responseText}. Execution time: ${execTime}ms`);
			} else {
				this.logger.info(`method: ${request.data.method}, id: ${request.data.id}. Execution time: ${execTime}ms`);
			}

			return result;
		}

		return replacementMethod;
	};
}

export class Protocol {
	#methods;
	#sl;

	logger;

	constructor(options: {
		methods: Map<string, typeof Api.JsonRpcV2>;
		sl: Types.ServiceLocator.default;
	}) {
		this.#methods = options.methods;
		this.#sl = options.sl;

		this.logger = options.sl.loggers.api;
	}

	// eslint-disable-next-line new-cap
	@GetTimeExec()
	async exec(request?: JsonRpcRequest): Promise<Types.System.JsonRpc.Types.Response> {
		if (!request) {
			const jsonrpc = new this.#sl.system.JsonRpc();

			return jsonrpc
				.response
				.error
				.invalidRequest
				.compare();
		}

		const jsonrpc = new this.#sl.system.JsonRpc(request.data);
		const error = jsonrpc.validate();

		if (error) return error;

		const method = jsonrpc.method;
		const params = jsonrpc.params;

		if (this.#methods.has(method)) {
			const ApiClass = this.#methods.get(method) as typeof Api.JsonRpcV2;
			const classInstance = new ApiClass(
				params,
				{
					logger: this.#sl.loggers.api,
					request: { id: jsonrpc.id, method },
					schemas: ApiClass.getSchemas(),
					services: this.#sl.services,
				},
			);

			// INCOMING PARAMS VALIDATION ERRORS
			{
				const { error, message } = classInstance.validateParams();

				if (error) {
					return jsonrpc
						.response
						.error
						.invalidParams
						.compare(message, error);
				}
			}

			try {
				const { data, error } = await classInstance.execute();

				// BUSINESS ERRORS CHECK
				if (error) {
					return jsonrpc
						.response
						.error
						.invalidRequest
						.compare(error.message, error.code);
				}

				// SERIALIZE RESULT
				{
					const { error, message } = classInstance.validateResult(
						JSON.parse(JSON.stringify(data)),
					);

					if (error) {
						return jsonrpc
							.response
							.error
							.invalidParams
							.compare(message, error);
					}
				}

				return jsonrpc
					.response
					.common
					.compare(data);
			} catch (error) {
				if (error instanceof Error) {
					this.logger.error(error.message);

					return jsonrpc
						.response
						.error
						.internalError
						.compare(error.message);
				} else {
					return jsonrpc
						.response
						.error
						.internalError
						.compare();
				}
			}
		} else {
			return jsonrpc
				.response
				.error
				.methodNotFound
				.compare();
		}
	}
}
