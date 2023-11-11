export type CreateFields = Pick<TableFields,
	| "balance"
	| "email"
>;

export type EntityForCheck = {
	id: TableFields["id"];
};

export type SearchFields = Partial<TableFields>;

export type TableFields = {
	id: string;

	balance: number;
	email: string;

	created_at: Date;
	updated_at: Date | null;
};

export type TableKeys = keyof TableFields;

export type UpdateFields = Partial<Pick<TableFields,
	| "balance"
>>;
