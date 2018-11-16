var app = app || {};

app.views = app.views || {};

app.views.utility.List = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		ItemView: function() {
			return app.views.utility.ListItem;
		},

		itemViews: [],
		modelToView: {},
		template: null,
		collection: null,

		constructor: function() {

			// Must go before event bindings.
			app.abstracts.BaseView.prototype.constructor.apply(this, arguments);

			_.bindAll(this, 'addItem', 'removeItem', 'renderItems', 'onScroll');

			var collection = _.result(this, 'collection');

			if (collection) {
				this.listenTo(collection, 'add', this.addItem);
				this.listenTo(collection, 'remove', this.removeItem);
				this.listenTo(collection, 'sort reset', _.debounce(this.renderItems, 20));
			}

			this.throttledSaveScrollHeight = _.throttle(_.bind(this.saveScrollHeight, this), 20);
			this.lastScrollHeight = 0;
		},

		getItemContainer: function() {

			if (!_.isUndefined(this.itemContainer)) {
				var itemContainer = _.result(this, 'itemContainer');
				if (_.isString(itemContainer)) {
					return this.$(itemContainer);
				} else if (itemContainer instanceof Backbone.$) {
					return itemContainer;
				}
				return Backbone.$(itemContainer);
			}

			return this.$el;
		},

		onRender: function() {

			app.log('List.onRender');
			this.$items = this.getItemContainer();
			this.$items.on('scroll', this.onScroll);
			this.renderItems();
		},

		renderItems: function() {

			if (!this.$items) return;
			app.log('List.renderItems');
			this.removeAll();
			var collection = _.result(this, 'collection');
			_.each(collection.models, function(model) {
				this.addItem(model, collection);
			}, this);
		},

		addItem: function(model, collection, options) {

			if (!this.$items) return;
			app.log('List.addItem');
			options = options || {};
			var ItemView = _.result(this, 'ItemView');
			var view = new ItemView({ model: model });
			view.render();
			if (!_.isUndefined(options.at)) {
				if (options.at === 0) {
					this.$items.prepend(view.el);
				} else {
					this.$items.children('*:nth-child(' + options.at + ')').first().after(view.el);
				}
			} else {
				this.$items.append(view.el);
			}
			this.itemViews.push(view);
			this.modelToView[model.cid] = view;
		},

		removeItem: function(model) {

			app.log('List.removeItem');
			var index = _.findIndex(this.itemViews, function(itemView) {
				return itemView.model.cid === model.cid;
			});

			if (index !== -1) {
				this.itemViews[index].close();
			}
		},

		removeAll: function() {

			app.log('List.removeAll');
			_.invoke(this.itemViews, 'close');
			this.itemViews = [];
		},

		checkItems: function() {

			app.log('List.checkItems');
			var collection = _.result(this, 'collection');
			if (!collection) return;
			var modelsIdHash = {};
			_.each(collection.models, function(model, index) {
				modelsIdHash[model.cid] = true;
				var hasItemView = !!this.modelToView[model.cid];
				if (!hasItemView) {
					this.addItem(model, collection, { at: index });
				}
			}, this);
			_.each(this.itemViews, function(itemView) {
				var hasModel = modelsIdHash[itemView.model.cid];
				if (!hasModel) {
					this.removeItem(model);
				}
			}, this);
		},

		setElement: function() {

			app.log('List.setElement');
			app.abstracts.BaseView.prototype.setElement.apply(this, arguments);
			this.checkItems();
			this.$items = this.getItemContainer();
			this.$items.on('scroll', this.onScroll);
			this.restoreLastScrollHeight();
			return this;
		},

		onScroll: function() {

			app.log('List.onScroll');
			this.throttledSaveScrollHeight();
		},

		saveScrollHeight: function() {

			if (this.$items) {
				this.lastScrollHeight = this.$items.scrollTop();
			}
		},

		restoreLastScrollHeight: function() {

			if (this.lastScrollHeight && this.$items) {
				this.$items.scrollTop(this.lastScrollHeight);
			}
		},

		onClose: function() {

			app.log('List.onClose');
			if (this.$items) {
				this.$items.off('scroll', this.onScroll);
			}
			this.removeAll();
		},

	});
})();
