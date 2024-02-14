import express from 'express';

import UserSchema from './schemas/Users.js';
import ValentineSchema from './schemas/Valentines.js';

import {kupidon_router, profkom_router} from './router.js';

export default class {
	router = express.Router();
	db_models = {};

	constructor(plugin_name, database) {
		this.database = database;

		for (const [name, schema] of Object.entries(this.db_schemas)) {
			this.db_models[name] = this.database.model(name, schema);
		}

		this.router.all('/kupidon', kupidon_router);
		this.router.all('/profkom', profkom_router);

		console.log(`Plug-in ${plugin_name} started`);
	}
	
	db_schemas = {
		Users : UserSchema,
		Valentines : ValentineSchema,
	};
}