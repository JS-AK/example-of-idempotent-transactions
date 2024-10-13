export type CoreFields = {
	id: string;

	finished_at: Date | null;
	idempotence_key: string;
	started_at: Date;
	status: "in_progress" | "success" | "failed" | "created";

	created_at: Date;
	updated_at: Date | null;
};

export type EntityForCheck = {
	id: CoreFields["id"];
};
