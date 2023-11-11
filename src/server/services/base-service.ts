import * as Types from "../types/index.js";

export default class BaseService {
	services: Types.ServiceLocator.default["services"] | undefined;

	injectServices(services: Types.ServiceLocator.default["services"]) {
		this.services = services;
	}
}
