import fastify from "fastify";

import * as Protocols from "../../../protocols/index.js";
import { Types } from "../index.js";

import * as Api from "../../../api/lib/json-rpc-v2.js";

export const exec = (
	fastify: fastify.FastifyInstance,
	data: { methods: Map<string, typeof Api.JsonRpcV2>; sl: Types.ServiceLocator.default; },
	next: () => void,
) => {
	const { methods, sl } = data;

	const protocol = new Protocols.JsonRpcV2.Protocol({ methods, sl });

	fastify.after(() => {
		for (const [method, api] of methods) {
			fastify.route({
				handler: async (
					request: fastify.FastifyRequest<{ Body: Types.System.JsonRpc.Types.Request; }>,
					reply: fastify.FastifyReply,
				) => {
					return reply.send(await protocol.exec(
						request.body,
						{ authorization: request.headers.authorization },
					));
				},
				method: "POST",
				schema: {
					body: {
						properties: {
							id: { type: "string" },
							jsonrpc: { type: "string" },
							method: { enum: [method], type: "string" },
							params: api.getSchemas().params,
						},
						required: ["id", "jsonrpc", "method", "params"],
						type: "object",
					},
					response: {
						200: {
							description: "Success Response",
							properties: {
								error: {
									properties: { code: { type: "integer" }, message: { type: "string" } },
									type: "object",
								},
								id: { type: "string" },
								jsonrpc: { type: "string" },
								result: api.getSchemas().result,
							},
							type: "object",
						},
					},
					tags: [method.split("/")[0] || ""],
				},
				serializerCompiler: () => (data) => JSON.stringify(data), // DISABLE default fastify serialization
				url: `/api/${method}`,
				validatorCompiler: () => () => true, // DISABLE default fastify validation
			});
		}
	});

	fastify.setErrorHandler((
		error,
		request: fastify.FastifyRequest<{ Body: Types.System.JsonRpc.Types.Request; }>,
		reply: fastify.FastifyReply,
	) => {
		if (request.body) {
			const jsonrpc = new sl.system.JsonRpc(request.body);

			{
				const error = jsonrpc.validate();

				if (error) return reply.send(error);
			}

			return reply.send(jsonrpc
				.response
				.error
				.invalidRequest
				.compare(error.message, 1));
		}

		reply.send(error);
	});

	next();
};
