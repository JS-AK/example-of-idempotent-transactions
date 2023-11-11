/* eslint-disable @typescript-eslint/no-unused-vars */

export class BaseTransport {
	async listen(): Promise<void> {
		throw new Error("Not implemented");
	}
	async close(): Promise<void> {
		throw new Error("Not implemented");
	}
}
