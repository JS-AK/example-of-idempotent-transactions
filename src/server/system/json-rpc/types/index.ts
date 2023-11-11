/* eslint-disable @typescript-eslint/no-explicit-any */

export type Request<T = any> = {
	jsonrpc: "2.0";
	id: string | number;
	method: string;
	params?: T;
};

export type Response<T = any> = {
	jsonrpc: "2.0";
	id: string | number | null;
	method?: string;
	result?: T;
	error?: ResponseError;
};

export type ResponseError = {
	code: number;
	message: string;
};
