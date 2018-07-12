var app = app || {};

app.views = app.views || {};

app.views.Slider = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		events: {
			'swipe .slider-items': 'onSwipe',
		},

		ItemView: (function() {
			return app.abstracts.BaseView.extend({
				className: 'slider-item',
				template: '#template-slider-item',
				onRender: function() {
					this.$el.addClass(this.options.key);
					this.$content = this.$('.slider-item-content');
					this.$content.append(this.options.contentView.render().el);
				},
				onClose: function() {
					if (this.options.contentView) {
						this.options.contentView.close();
					}
				}
			});
		})(),

		visible: [],
		itemViews: [],
		index: 0,

		initialize: function() {

			this.items = this.options.items;
			this.$items = this.$('.slider-items');
			this.$items.css('width', (100 * this.items.length) + '%');
			_.each(this.items, this.addItem, this);
			var visibleItemKeys = _.chain(this.options.items).where({ visible: true }).pluck('key').value();
			this.showItems(visibleItemKeys);
		},

		serializeData: function() {

			return {
				canSwipe: this.options.canSwipe !== false,
			};
		},

		onSwipe: function(evt, velocity) {

			if (this.options.canSwipe === false) return;
			var currentIndex = this.index || 0;
			// Positive velocity is left-to-right.
			// Negative velocity is right-to-left.
			var newIndex = velocity > 0 ? currentIndex - 1 : currentIndex + 1;
			var currentPosX = this.calculateItemOffsetX(currentIndex);
			var newOffsetX = this.calculateItemOffsetX(newIndex);
			var distance = Math.abs(currentPosX - newOffsetX);
			var speed = Math.abs(velocity);
			var duration = Math.min(distance / speed, 300);
			this.setIndex(newIndex, { animate: true, duration: duration });
		},

		setIndex: function(index, options) {

			// Index cannot be less than zero.
			// Nor can it better greater than the number of items minus one.
			var maxVisibleIndex = this.getMaxVisibleIndex();
			index = Math.max(0, Math.min(index, maxVisibleIndex));

			var item = this.getVisibleItemAtIndex(index);

			this.renderItem(item);

			if (this.index !== index && item) {
				// Changed the slide.
				this.trigger('change:active', item.key);
			}

			// Calculate the offset of the slide by its index.
			var offsetX = this.calculateItemOffsetX(index);

			// Move and animate the items element to bring the slide into view.
			this.translateX(offsetX, options);

			this.index = index;
		},

		translateX: function(posX, options) {

			options = _.defaults(options || {}, {
				duration: 200,
			});
			var maxVisibleIndex = this.getMaxVisibleIndex();
			var maxPosX = $(window).width() * maxVisibleIndex;
			posX = Math.min(posX, maxPosX);
			this.$items.css('transition-duration', Math.floor(options.duration).toString() + 'ms');
			this.$items.css('transform', 'translate3d(-' + posX + 'px, 0, 0)');
		},

		calculateItemOffsetX: function(index) {

			var width = $(window).width();
			return index * width;
		},

		addItem: function(item) {

			if (item.$el) return;
			item.$el = $('<div/>');
			item.$el.toggleClass('visible', this.isVisible(item.key));
			item.$el.addClass(this.ItemView.prototype.className);
			item.$el.attr('data-key', item.key);
			item.$el.css('width', (100 / this.items.length) + '%')
			this.$items.append(item.$el);
		},

		renderItem: function(item) {

			if (!item || item.rendered === true) return;
			item.view = (new this.ItemView(item));
			item.view.setElement(item.$el);
			item.view.render();
			item.rendered = true;
			return item.view;
		},

		switchToItem: function(key) {

			var visibleItems = this.getVisibleItems();
			var index = _.findIndex(visibleItems, function(item) {
				return item.key === key;
			});
			if (index !== -1) {
				this.setIndex(index);
			}
		},

		getVisibleItemAtIndex: function(index) {

			return this.getVisibleItems()[index] || null;
		},

		getVisibleItems: function() {

			return _.filter(this.items, function(item, index) {
				return this.isVisible(item.key);
			}, this);
		},

		getNumberVisibleItems: function() {

			return this.getVisibleItems().length;
		},

		getMaxVisibleIndex: function() {

			return this.getNumberVisibleItems() - 1;
		},

		getPreviousVisibleItem: function() {

			var currentIndex = this.index || 0;
			var previousIndex = currentIndex - 1;
			if (previousIndex < 0) return null;
			return this.getVisibleItemAtIndex(previousIndex);
		},

		getNextVisibleItem: function() {

			var currentIndex = this.index || 0;
			var maxVisibleIndex = this.getMaxVisibleIndex();
			var nextIndex = currentIndex + 1;
			if (nextIndex > maxVisibleIndex) return null;
			return this.getVisibleItemAtIndex(nextIndex);
		},

		getCurrentItem: function() {

			var currentIndex = this.index || 0;
			return this.getVisibleItemAtIndex(currentIndex) || null;
		},

		isVisible: function(key) {

			return _.contains(this.visible, key);
		},

		showItems: function(keys) {

			if (!_.isArray(keys)) {
				keys = Array.prototype.slice.call(arguments);
			}
			this.visible = _.uniq(this.visible.concat(keys));
			this.updateItemElementsVisibility();
		},

		hideItems: function(keys) {

			if (!_.isArray(keys)) {
				keys = Array.prototype.slice.call(arguments);
			}
			this.visible = _.difference(this.visible, keys);
			this.updateItemElementsVisibility();
		},

		updateItemElementsVisibility: function() {

			_.each(this.items, function(item) {
				if (item.$el) {
					item.$el.toggleClass('visible', this.isVisible(item.key));
				}
			}, this);
		},

		onClose: function() {

			_.each(this.items, function(item) {
				if (item.view) {
					item.view.close();
				}
			});
		},

	});

})();
