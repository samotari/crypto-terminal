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

		itemViews: [],
		index: 0,

		initialize: function() {

			this.$items = this.$('.slider-items');
			this.itemViews = _.map(this.options.items, this.addItem, this);
			this.$items.css('width', (100 * this.itemViews.length) + '%');
			this.$('.slider-item').css('width', (100 / this.itemViews.length) + '%');
		},

		onSwipe: function(evt, velocity) {

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

			if (this.index !== index) {
				// Changed the slide.
				var item = this.getVisibleItemAtIndex(index);
				if (item) {
					this.trigger('change:active', item.key);
				}
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

			var itemView = (new this.ItemView(item)).render();
			itemView.$el.attr('data-key', item.key);
			this.$items.append(itemView.el);
			return itemView;
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

			return _.filter(this.options.items, function(item, index) {
				return this.isVisible(index);
			}, this);
		},

		getNumberVisibleItems: function() {

			return this.getVisibleItems().length;
		},

		getMaxVisibleIndex: function() {

			return this.getNumberVisibleItems() - 1;
		},

		isVisible: function(index) {

			return this.$('.slider-item').eq(index).hasClass('visible');
		},

		onClose: function() {

			_.each(this.itemViews, function(itemView) {
				itemView.close();
			});
		}

	});

})();
