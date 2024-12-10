export type CreateFields = Pick<TableFields,
	| "user_id"
	| "delta_change"
	| "operation"
	| "unique_identificator"
>;

export type EntityForCheck = {
	id: TableFields["id"];
};

export type SearchFields = Partial<TableFields>;

export type TableFields = {
	id: string;

	user_id: string;

	delta_change: number;
	operation: "increase" | "reduce";
	unique_identificator: string;

	created_at: Date;
	updated_at: Date | null;
};

export type TableKeys = keyof TableFields;

export type UpdateFields = Partial<Pick<TableFields,
	| "delta_change"
>>;
