export type Array2OrMore<T> = {
	0: T;
	1: T;
} & Array<T>;

export type TDataError<T = unknown> =
	| { data: T; error?: never; }
	| { data?: never; error: { code: number; message: string; }; };

export type TRequiredDeep<T> = T extends Array2OrMore<infer U>
	? Array2OrMore<TRequiredDeep<U>>
	: Required<{ [K in keyof T]: TRequiredDeep<T[K]> }>;

export type TUserAuth = { id: string; role: { title: TUserRoles; }; };

export type TUserRoles = "admin" | "user" | "unknown";
