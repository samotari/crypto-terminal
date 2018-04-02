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

	app.queues.onStart.push({
		fn: function(done) {
			var collections = [
				app.settings.collection,
				app.paymentRequests,
			];
			app.sqlite.db.transaction(
				function(tx) {
					_.each(collections, function(collection, index) {
						var store = collection.sqliteStore;
						if (store) {
							store.tx = tx;
							store._setupTable();
							store._count(function(error, total) {
								collection.total = total;
								store.tx = null;
								if (index === collections.length - 1) {
									// Last collection.
									// Finish the db transaction.
									tx.finish();
								}
							});
						}
					});
				},
				function(error) {
					app.log('db setup failed', error);
					done(error);
				}, function() {
					app.log('db setup succeeded');
					// Transaction was successful.
					done();
				}
			);
		},
	});

	var Store = function(name) {
		_.bindAll(this, 'prepareResultItems', 'newTransaction');
		this.tableName = this.makeTableName(name);
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

	Store.prototype._setupTable = function(cb) {
		app.log('SQLiteStore._setupTable');
		this.query('CREATE TABLE IF NOT EXISTS '+this.tableName+' (id TEXT PRIMARY KEY, data TEXT, created_at INTEGER)', function(error) {
			cb && cb(error);
		});
	};

	Store.prototype.create = function(model, cb) {
		app.log('SQLiteStore.create', model);
		model.id = model.get(model.idAttribute) || null;
		this.newTransaction(function(tx) {
			async.seq(
				_.bind(this.ensureId, this, model),
				_.bind(function(next) {
					this._replace(model.id, model.toJSON(), next);
				}, this)
			)(function() {
				tx.finish();
			});
		}, function(error) {
			if (error) {
				return cb(error);
			}
			cb(null, model.toJSON());
		});
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

	Store.prototype.findAll = function(options, cb) {
		app.log('SQLiteStore.findAll');
		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}
		var items;
		var prepareResultItems = this.prepareResultItems;
		var done = _.once(cb);
		this.newTransaction({ readOnly: true }, function(tx) {
			this._findAll(options, function(error, result) {
				try {
					items = prepareResultItems(result);
				} catch (error) {
					done(error);
				}
				tx.finish();
			});
		}, function(error) {
			if (error) {
				return done(error);
			}
			done(null, items);
		});
	};

	Store.prototype._findAll = function(options, cb) {
		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}
		options = _.defaults(options || {}, {
			limit: 10,
			offset: 0,
		});
		var sql = 'SELECT id, data FROM '+this.tableName+' ORDER BY created_at DESC LIMIT ? OFFSET ?';
		var params = [ options.limit, options.offset ];
		this.query(sql, params, cb);
	};

	Store.prototype.find = function(model, cb) {
		app.log('SQLiteStore.find');
		var items;
		var prepareResultItems = this.prepareResultItems;
		var done = _.once(cb);
		this.newTransaction({ readOnly: true }, function(tx) {
			this._find(model.id, function(error, result) {
				try {
					items = prepareResultItems(result);
				} catch (error) {
					done(error);
				}
				tx.finish();
			});
		}, function(error) {
			if (error) {
				return done(error);
			}
			done(null, items);
		});
	};

	Store.prototype._find = function(id, cb) {
		this.query('SELECT id, data FROM '+this.tableName+' WHERE id = ? LIMIT 1', [ id ], cb);
	};

	Store.prototype.update = function(model, cb) {
		app.log('SQLiteStore.update');
		this.newTransaction(function(tx) {
			this._replace(model.id, model.toJSON(), function() {
				tx.finish();
			});
		}, function(error) {
			if (error) {
				return cb(error);
			}
			cb(null, model.toJSON());
		});
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
		this.query('REPLACE INTO '+this.tableName+' (id,data,created_at) VALUES (?,?,?)', [
			id,
			data,
			Date.now(),
		], function(error) {
			cb(error);
		});
	};

	Store.prototype.destroy = function(model, cb) {
		app.log('SQLiteStore.destroy');
		this.newTransaction(function(tx) {
			this._destroy(model.id, function() {
				tx.finish();
			});
		}, cb);
	};

	Store.prototype._destroy = function(id, cb) {
		this.query('DELETE FROM '+this.tableName+' WHERE id = ? LIMIT 1', [ id ], cb);
	};

	Store.prototype._count = function(cb) {
		this.query('SELECT COUNT(*) FROM '+this.tableName, function(error, result) {
			if (error) {
				return cb(error);
			}
			var total = result.rows.item(0)['COUNT(*)'];
			cb(null, total);
		});
	};

	Store.prototype.query = function(sql, params, cb) {
		if (_.isFunction(params)) {
			cb = params;
			params = [];
		}
		app.log('SQLiteStore.query', sql, params);
		this.tx.executeSql(sql, params, function(tx, result) {
			app.log(result);
			cb && cb(null, result);
		});
	};

	/*
		Should use transactions with SQLite plugin to improve performance.

		See:
		https://stackoverflow.com/questions/28188164/android-sqlite-performance
	*/
	Store.prototype.newTransaction = function(options, ready, done) {
		if (_.isFunction(options)) {
			done = ready;
			ready = options;
			options = null;
		}
		options = _.defaults(options || {}, {
			readOnly: false,
		});
		ready = ready && _.bind(ready, this) || _.noop;
		done = done && _.bind(done, this) || _.noop;
		var txMethod = options.readOnly === true ? 'readTransaction' : 'transaction';
		var txReady = _.bind(function(tx) {
			this.tx = tx;
			ready(tx);
		}, this);
		var txError = _.bind(function(error) {
			this.tx = null;
			done(error);
		}, this);
		var txSuccess = _.bind(function() {
			this.tx = null;
			done();
		}, this);
		app.sqlite.db[txMethod](txReady, txError, txSuccess);
	};

	Store.prototype.prepareResultItems = function(result) {
		var rows = [];
		for (var index = 0; index < result.rows.length; index++) {
			rows.push(result.rows.item(index));
		}
		return _.chain(rows).map(function(row) {
			try {
				var data = this.deserializeData(row.data);
			} catch (error) {
				app.log(error);
				return null;
			}
			return data;
		}, this).compact().value();
	};

	Store.prototype.serializeData = function(data) {
		return JSON.stringify(data);
	};

	Store.prototype.deserializeData = function(data) {
		return JSON.parse(data);
	};

	app.sqlite.Store = Store;
});
