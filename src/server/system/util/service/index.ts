export class Service {
	getISODate(date: unknown): string | undefined {
		if (date instanceof Date && !isNaN(date.valueOf())) {
			return date.toISOString();
		}

		return undefined;
	}

	getTime(date: unknown): string | undefined {
		if (date instanceof Date && !isNaN(date.valueOf())) {
			const datePrepared = new Date(date.toISOString());
			const hours = datePrepared.getHours().toString().padStart(2, "0");
			const minutes = datePrepared.getMinutes().toString().padStart(2, "0");

			return `${hours}:${minutes}`;
		}

		return undefined;
	}

	toTimestamp<T extends string | null>(
		date: T,
	): T extends string ? number : null {
		return date
			? (new Date(date + "Z").getTime() as T extends string ? number : never)
			: null as T extends string ? number : null;
	}

	toISOString<T extends number | undefined>(
		date: T,
	): T extends number ? string : undefined {
		return date
			? (new Date(date).toISOString() as T extends number ? string : never)
			: undefined as T extends number ? string : undefined;
	}

	toDateWithNull<T extends number | string | null | undefined>(
		date: T,
	): T extends null ? null : T extends (number | string) ? Date : undefined {
		if (date === null) {
			return null as T extends null ? null : never;
		}

		if (!date) {
			return undefined as T extends null
				? never
				: T extends (number | string) ? never : undefined;
		}

		const dateResult = new Date(date);

		if (dateResult instanceof Date && !isNaN(dateResult.valueOf())) {
			return dateResult as T extends null
				? never
				: T extends (number | string) ? Date : never;
		}

		throw new Error("Invalid date");
	}

	getTimeAfterSomeMins(mins: number) {
		const now = new Date();

		return new Date(now.setMinutes(now.getMinutes() + mins));
	}

	getTimeAfterSomeDays(days: number) {
		const date = new Date();

		date.setDate(date.getDate() + days);

		return date;
	}

	getTimeAfterSomeMonths(months: number) {
		const date = new Date();

		date.setMonth(date.getMonth() + months);

		return date;
	}
}
