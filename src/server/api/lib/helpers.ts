import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import path from "path";

import { JsonRpcV2 } from "./json-rpc-v2.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const collectMethods = async (pathToMethods: string) => {
	const methods = new Map();

	const pathToFolders = path.resolve(__dirname, pathToMethods);

	const filesAndFolders = await fs.readdir(pathToFolders);

	for (const faf of filesAndFolders) {
		const apiFiles = await fs.readdir(path.resolve(pathToFolders, faf));

		for (const apiFile of apiFiles) {
			if (apiFile.split(".js").length === 1) continue;

			const ApiClasses = await import(`${pathToMethods}/${faf}/${apiFile}`);

			Object.keys(ApiClasses).forEach((className) => {
				const ApiClass = ApiClasses[className];

				if (ApiClass?.prototype instanceof JsonRpcV2) {
					const methodName = ApiClass.getMethodName();

					if (methods.has(methodName)) {
						throw new Error(`method ${methodName} already registered`);
					}

					methods.set(methodName, ApiClass);
				}
			});
		}
	}

	return methods;
};
