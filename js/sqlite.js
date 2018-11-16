var app = app || {};

/*
	TODO:
	- Remove this file after existing users are updated.

	SQLite storage provided by the following:
	https://github.com/litehelpers/Cordova-sqlite-storage
*/
app.onDeviceReady(function() {

	'use strict';

	// SQLite plugin not supported in browser.
	if (!app.isCordova() || cordova.platformId === 'browser') return;

	app.sqlite = {

		migrateToLocalStorage: function(collection, done) {
			app.log('Migrating SQLite data to LocaleStorage', collection.storeName);
			var store = collection.sqliteStore;
			app.sqlite.tableExists(store.tableName, function(error, exists) {
				if (error) return done(error);
				if (!exists) return done();
				async.series([
					function(next) {
						app.sqlite.copySQLiteDataToLocalStorage(collection, next);
					},
					function(next) {
						store.dropTable(next);
					},
				], function(error) {
					if (error) app.log(error);
					done();
				});
			});
		},

		tableExists: function(name, cb) {
			var sql = 'SELECT name FROM sqlite_master WHERE type="table" AND name="' + name + '"';
			var params = [];
			app.sqlite.db.executeSql(sql, params, function onSuccess(result) {
				var exists = (function() {
					var index, row;
					for (index = 0; index < result.rows.length; index++) {
						row = result.rows.item(index);
						if (row.name === name) return true;
					}
					return false;
				})();
				cb(null, exists);
			}, cb/* onError */);
		},

		copySQLiteDataToLocalStorage: function(collection, cb) {
			app.log('copySQLiteDataToLocalStorage', collection.storeName);
			var store = collection.sqliteStore;
			if (!store) return cb();
			store.findAll({ limit: 9999 }, function(error, items) {
				if (error) return cb(error);
				try {
					_.invoke(collection.models, 'destroy');
					collection.reset([]);
					collection.add(items);
					_.invoke(collection.models, 'save');
				} catch (error) {
					return cb(error);
				}
				cb();
			});
		},
	};

	app.onStart(function openDatabase(done) {
		app.sqlite.db = window.sqlitePlugin.openDatabase(app.config.sqlite, function() {
			// Successfully connected to database.
			app.log('sqlite database connected');
			done();
		}, done);
	});

	app.onStart(function(done) {
		var collections = [
			app.paymentRequests,
			app.settings.collection,
		];
		async.each(collections, function(collection, next) {
			app.sqlite.migrateToLocalStorage(collection, next);
		}, done);
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

	Store.prototype.dropTable = function(cb) {
		app.log('SQLiteStore.dropTable');
		var done = _.once(cb);
		this.newTransaction(function(tx) {
			this._dropTable(function(error, result) {
				tx.finish();
			});
		}, done);
	};

	Store.prototype._dropTable = function(cb) {
		var sql = 'DROP TABLE IF EXISTS '+this.tableName;
		var params = [];
		this.query(sql, params, cb);
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

	Store.prototype.deserializeData = function(data) {
		return JSON.parse(data);
	};

	app.sqlite.Store = Store;
});
