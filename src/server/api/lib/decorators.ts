import { TUserRoles } from "../../types/common/index.js";

import { JsonRpcV2 } from "./json-rpc-v2.js";

export function AuthGuard() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
	return function decorator(originalMethod: any, context: ClassMethodDecoratorContext) {
		function replacementMethod(this: JsonRpcV2) {
			if (!this.request.meta.authorization) {
				return { error: { code: 1, message: "No token provided" } };
			}

			const tokenWithoutBearer = this.request.meta.authorization.substring(7);

			const { data, error } = this.sl
				.system
				.jwt
				.verify(tokenWithoutBearer);

			if (error) {
				return { error: { code: 1, message: error.message } };
			}

			const jwtPayload = data.payload;

			if (typeof jwtPayload.sub !== "string") {
				return { error: { code: 1, message: "Invalid payload" } };
			}

			if (!(new Set<TUserRoles>(["admin", "user"]).has(jwtPayload.roleTitle))) {
				return { error: { code: 1, message: "Invalid payload" } };
			}

			this.user.id = jwtPayload.sub;
			this.user.role.title = jwtPayload.roleTitle;

			return originalMethod.call(this);
		}

		return replacementMethod;
	};
}

export function PermissionAccessGuard() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
	return function decorator(originalMethod: any, context: ClassMethodDecoratorContext) {
		function replacementMethod(this: JsonRpcV2) {
			if (!this.permissions) {
				return { error: { code: 1, message: "Invalid permissions" } };
			}

			if (!this.permissions[this.user.role.title]) {
				return { error: { code: 1, message: "Invalid permissions" } };
			}

			return originalMethod.call(this);
		}

		return replacementMethod;
	};
}
