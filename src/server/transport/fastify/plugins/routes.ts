import fastify from "fastify";

import * as Protocols from "../../../protocols/index.js";
import { Types } from "../index.js";
import { collectMethods } from "../../../api/lib/helpers.js";

export default async function exec(
	fastify: fastify.FastifyInstance,
	sl: Types.ServiceLocator.default,
	next: () => void,
) {
	const methods = await collectMethods("../json-rpc-v2");
	const protocol = new Protocols.JsonRpcV2.Protocol({ methods, sl });

	fastify.after(() => {
		for (const [method, api] of methods) {
			fastify.route({
				handler: async (
					request: fastify.FastifyRequest<{ Body: Types.System.JsonRpc.Types.Request; }>,
					reply: fastify.FastifyReply,
				) => {
					return reply.send(await protocol.exec({ data: request.body }));
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
					tags: [method.split("/")[0]],
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
}
