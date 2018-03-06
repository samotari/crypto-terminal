var app = app || {};

/*
	https://github.com/litehelpers/Cordova-sqlite-storage
*/
app.onDeviceReady(function() {

	'use strict';

	// SQLite plugin not supported in browser.
	if (!app.isCordova() || cordova.platformId === 'browser') return;

	app.sqlite = {};

	app.queues.onStart.push({
		fn: function(done) {
			app.sqlite.db = window.sqlitePlugin.openDatabase(app.config.sqlite, function() {
				// Successfully connected to database.
				app.log('sqlite database connected');
				done();
			}, done);
		},
	});

	var Store = function(name) {
		_.bindAll(this,
			'prepareResultItems',
			'setupTable'
		);
		this.tableName = this.makeTableName(name);
		this.db = app.sqlite.db;
	};

	Store.prototype.makeTableName = function(name) {

		if (name.substr(0, 1).replace(/[^a-z]/i).length !== 1) {
			// First character of table name must be a letter.
			name = 't' + name;
		}

		// Strip disallowed characters.
		name = name.replace(/[^a-zA-Z0-9_]/g, '');

		// Maximum length.
		name = name.substr(0, 20);

		return name;
	};

	Store.prototype.setupTable = function(cb) {
		app.log('SQLiteStore.setupTable');
		this.query('CREATE TABLE IF NOT EXISTS '+this.tableName+' (id TEXT PRIMARY KEY, data TEXT)', function(error) {
			cb(error);
		});
	};

	Store.prototype.create = function(model, cb) {
		app.log('SQLiteStore.create', model);
		model.id = model.get(model.idAttribute) || null;
		async.seq(
			this.setupTable,
			_.bind(this.ensureId, this, model),
			_.bind(function(next) {
				this._replace(model.id, model.toJSON(), next);
			}, this),
			function(next) {
				next(null, model.toJSON());
			}
		)(cb);
	};

	Store.prototype.ensureId = function(model, cb) {
		if (model.id) return cb();
		app.log('SQLiteStore.ensureId');
		var isUnique = false;
		var id;
		async.until(function() { return isUnique; }, _.bind(function(next) {
			id = app.util.generateRandomString(
				app.config.sqlite.uniqueId.length,
				app.config.sqlite.uniqueId.charset
			);
			this._find(id, function(error, result) {
				if (error) return next(error);
				isUnique = result.rows.length === 0;
				next();
			});
		}, this), function(error) {
			if (error) return cb(error);
			model.id = id;
			model.set(model.idAttribute, model.id);
			cb();
		});
	};

	Store.prototype.findAll = function(cb) {
		app.log('SQLiteStore.findAll');
		async.seq(
			this.setupTable,
			_.bind(this._findAll, this),
			this.prepareResultItems
		)(cb);
	};

	Store.prototype._findAll = function(cb) {
		this.query('SELECT id, data FROM '+this.tableName+'', cb);
	};

	Store.prototype.find = function(model, cb) {
		app.log('SQLiteStore.find');
		async.seq(
			this.setupTable,
			_.bind(this._find, this, model.id),
			this.prepareResultItems
		)(cb);
	};

	Store.prototype._find = function(id, cb) {
		this.query('SELECT id, data FROM '+this.tableName+' WHERE id = ?', [ id ], cb);
	};

	Store.prototype.update = function(model, cb) {
		app.log('SQLiteStore.update');
		async.seq(
			this.setupTable,
			_.bind(this._replace, this, model.id, model.toJSON()),
			function(next) {
				next(null, model.toJSON());
			}
		)(cb);
	};

	Store.prototype._replace = function(id, data, cb) {
		try {
			data = this.serializeData(data);
		} catch (error) {
			_.defer(function() {
				cb(error);
			});
			return;
		}
		this.query('REPLACE INTO '+this.tableName+' (id,data) VALUES (?,?)', [ id, data ], function(error) {
			cb(error);
		});
	};

	Store.prototype.destroy = function(model, cb) {
		app.log('SQLiteStore.destroy');
		async.seq(
			this.setupTable,
			_.bind(this._destroy, this, model.id)
		)(cb);
	};

	Store.prototype._destroy = function(id, cb) {
		this.query('DELETE FROM '+this.tableName+' WHERE id = ? LIMIT 1', [ id ], function(error) {
			cb(error);
		});
	};

	Store.prototype.query = function(sql, params, cb) {
		if (_.isFunction(params)) {
			cb = params;
			params = [];
		}
		app.log('SQLiteStore.query', sql, params);
		this.db.executeSql(sql, params, function(result) {
			app.log('query success');
			app.log(result);
			cb(null, result);
		}, function(error) {
			app.log('query error');
			app.log(error);
			cb(error);
		});
	};

	Store.prototype.prepareResultItems = function(result, cb) {
		var deserializeData = _.bind(this.deserializeData, this);
		_.defer(function() {
			try {
				var rows = [];
				for (var index = 0; index < result.rows.length; index++) {
					rows.push(result.rows.item(index));
				}
				var items = _.chain(rows).map(function(row) {
					try {
						var data = deserializeData(row.data);
					} catch (error) {
						return null;
					}
					return data;
				}).compact().value();
			} catch (error) {
				return cb(error);
			}
			cb(null, items);
		});
	};

	Store.prototype.serializeData = function(data) {
		return JSON.stringify(data);
	};

	Store.prototype.deserializeData = function(data) {
		return JSON.parse(data);
	};

	app.sqlite.Store = Store;
});
