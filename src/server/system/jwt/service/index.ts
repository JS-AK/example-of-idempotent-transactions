import jwt from "jsonwebtoken";

export class Service {
	#audience;
	#issuer;
	#secret;
	#ttl;
	#type;

	constructor(data: {
		config: {
			audience: string;
			issuer: string;
			secret: string;
			ttl: number;
			type: string;
		};
	}) {
		this.#secret = data.config.secret;
		this.#type = data.config.type;
		this.#ttl = data.config.ttl;
		this.#issuer = data.config.issuer;
		this.#audience = data.config.audience;
	}

	#sign(data: {
		id: string;
		payload: { role: { title: string; }; };
		expiresIn: number;
	}) {
		return jwt.sign(
			{
				roleTitle: data.payload.role.title,
				type: this.#type,
			},
			this.#secret,
			{
				audience: this.#audience,
				expiresIn: data.expiresIn,
				issuer: this.#issuer,
				subject: data.id,
			},
		);
	}

	sign(id: string, payload: { role: { title: string; }; }) {
		return this.#sign({ expiresIn: this.#ttl, id, payload });
	}

	verify(token: string) {
		try {
			const data = jwt.verify(token, this.#secret) as jwt.JwtPayload;

			return { data: { payload: data } };
		} catch (error) {
			if (error instanceof jwt.JsonWebTokenError) {
				if (error instanceof jwt.TokenExpiredError) {
					return { error: { code: 1, message: "jwt expired" } };
				}

				return { error: { code: 1, message: error.message } };
			} else {
				return { error: { code: 1, message: "Something went wrong" } };
			}
		}
	}
}
