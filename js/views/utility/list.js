var app = app || {};

app.views = app.views || {};

app.views.utility.List = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		ItemView: function() {
			return app.views.utility.ListItem;
		},

		itemViews: [],
		template: null,
		collection: null,

		constructor: function() {

			// Must go before event bindings.
			app.abstracts.BaseView.prototype.constructor.apply(this, arguments);

			_.bindAll(this, 'addItem', 'removeItem', 'renderItems');

			if (this.collection) {
				this.listenTo(this.collection, 'add', this.addItem);
				this.listenTo(this.collection, 'remove', this.removeItem);
				this.listenTo(this.collection, 'sort reset', _.debounce(this.renderItems, 20));
			}
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

			this.renderItems();
		},

		renderItems: function() {

			app.log('List.renderItems');
			this.removeAll();
			_.each(this.collection.models, function(model) {
				this.addItem(model, this.collection);
			}, this);
		},

		addItem: function(model, collection, options) {

			app.log('List.addItem');
			var ItemView = _.result(this, 'ItemView');
			var view = new ItemView({ model: model });
			view.render();
			var $itemContainer = this.getItemContainer();
			$itemContainer.append(view.el);
			this.itemViews.push(view);
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

		onClose: function() {

			app.log('List.onClose');
			this.removeAll();
		},

	});
})();
