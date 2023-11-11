export class Service {
	common = {
		ACCESS_DENIED: {
			error: {
				code: 1,
				message: "ACCESS_DENIED",
			},
		},
		UNKNOWN_ERROR: {
			error: {
				code: 1,
				message: "UNKNOWN_ERROR",
			},
		},
	};
	user = {
		NOT_FOUND: {
			error: {
				code: 1,
				message: "USER_NOT_FOUND",
			},
		},
	};
	userBalanceMovingTransaction = {
		NOT_FOUND: {
			error: {
				code: 1,
				message: "USER_BALANCE_MOVING_TRANSACTION_NOT_FOUND",
			},
		},
		UNIQUE_IDENTIFICATOR_ALREADY_EXISTS: {
			error: {
				code: 1,
				message: "USER_BALANCE_MOVING_TRANSACTION_UNIQUE_IDENTIFICATOR_ALREADY_EXISTS",
			},
		},
	};
}
