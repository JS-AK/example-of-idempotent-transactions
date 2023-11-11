import cors from "@fastify/cors";
import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import * as Plugins from "./plugins/index.js";
import { BaseTransport } from "../base-transport.js";
import { Types } from "./index.js";

export class Server extends BaseTransport {
	#host;
	#logger;
	#port;
	#sl;
	#server: fastify.FastifyInstance;
	#uri;

	#isProductionMode: boolean;

	constructor(options: {
		host: string;
		mode: string;
		logger: Types.System.Logger.Service;
		sl: Types.ServiceLocator.default;
		port: number;
		uri: string;
	}) {
		super();

		this.#host = options.host;
		this.#logger = options.logger;
		this.#port = options.port;
		this.#server = fastify();
		this.#sl = options.sl;
		this.#uri = options.uri;

		this.#isProductionMode = options.mode === "PROD";
	}

	#register = {
		cors: async () => {
			await this.#server.register(cors, {
				methods: "*",
				origin: this.#isProductionMode ? this.#uri : "*",
			});
		},
		routes: async () => {
			await this.#server.register(Plugins.Routes.default, this.#sl);
		},
		swagger: async () => {
			await this.#server.register(fastifySwagger, {
				swagger: {
					consumes: ["application/json"],
					host: this.#uri,
					info: {
						description: "documentation",
						title: "api",
						version: "1.0.0",
					},
					produces: ["application/json"],
					schemes: ["http", "https"],
					securityDefinitions: {
						apiKey: {
							description: "Authorization header token, sample: \"Bearer #TOKEN#\"",
							in: "header",
							name: "authorization",
							type: "apiKey",
						},
					},
				},
			});
			await this.#server.register(fastifySwaggerUi, { routePrefix: "/api/documentation" });
		},
	};

	async #init() {
		await this.#register.cors();
		if (!this.#isProductionMode) await this.#register.swagger();
		await this.#register.routes();
	}

	async listen(): Promise<void> {
		await this.#init();

		this.#server.listen(
			{ host: this.#host, port: this.#port },
			(err) => {
				if (err) {
					this.#logger.error(err.message);
					process.exit(1);
				}

				this.#logger.info(`Server started as ${this.#host}:${this.#port}`);
			},
		);
	}

	async close(): Promise<void> {
		await this.#server.close();
		await this.#sl.shutdown();

		this.#logger.info("Server closed");
	}
}
