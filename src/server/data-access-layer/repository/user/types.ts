export type CoreFields = {
	id: string;

	balance: number;
	email: string;

	created_at: Date;
	updated_at: Date | null;
};

export type EntityForCheck = {
	id: CoreFields["id"];
};
