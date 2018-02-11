var app = app || {};

app.views = app.views || {};

app.views.Slider = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		events: {
			'touchstart .slider-items': 'start',
			'touchmove .slider-items': 'move',
			'touchend .slider-items': 'end',
		},

		ItemView: (function() {
			return app.abstracts.BaseView.extend({
				className: 'slider-item',
				template: '#template-slider-item',
				onRender: function() {
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
		touchStartX: null,
		touchMoveX: null,
		moveX: null,
		index: 0,
		isLongTouch: false,

		initialize: function() {

			this.$items = this.$('.slider-items');
			this.itemViews = _.map(this.options.items, this.addItem, this);
			this.$items.css('width', (100 * this.itemViews.length) + '%');
			this.$('.slider-item').css('width', (100 / this.itemViews.length) + '%');
		},

		addItem: function(item) {

			var itemView = (new this.ItemView(item)).render();
			itemView.$el.attr('data-key', item.key);
			this.$items.append(itemView.el);
			return itemView;
		},

		switchToItem: function(key) {

			var index = this.getItemIndexByKey(key);
			if (index !== false) {
				this.setIndex(index);
				var offsetX = this.calculateItemOffsetX(index);
				this.$items.css('transform', 'translate3d(-' + offsetX + 'px, 0, 0)');
			}
		},

		getItemIndexByKey: function(key) {

			for (var index = 0; index < this.itemViews.length; index++) {
				if (this.itemViews[index].options.key === key) {
					return index;
				}
			}

			return false;
		},

		start: function(evt) {

			if (this.isLongTouchTimeout) {
				clearTimeout(this.isLongTouchTimeout);
			}

			// Test for flick.
			this.isLongTouch = false;
			this.isLongTouchTimeout = setTimeout(_.bind(function() {
				this.isLongTouch = true;
			}, this), 250);

			// Get the original touch position.
			this.touchStartX = evt.originalEvent.touches[0].pageX;

			// The movement gets all janky if there's a transition on the element.
			this.$('.slider-animate').removeClass('slider-animate');
		},

		move: function(evt) {

			// Continuously return touch position.
			this.touchMoveX = evt.originalEvent.touches[0].pageX;
			// Calculate distance to translate inner.
			var offsetX = this.calculateItemOffsetX(this.index);
			this.moveX = offsetX + (this.touchStartX - this.touchMoveX);
			if (this.moveX < 600) {
				// Makes the inner stop moving when there is no more content.
				this.$items.css('transform', 'translate3d(-' + this.moveX + 'px, 0, 0)');
			}
		},

		end: function(evt) {

			if (this.moveX) {
				// Calculate the distance swiped.
				var offsetX = this.calculateItemOffsetX(this.index);
				var absoluteMoveX = Math.abs(offsetX - this.moveX);
				var width = this.getWidth();
				// Calculate the index. All other calculations are based on the index.
				if (absoluteMoveX > width / 2 || !this.isLongTouch) {
					if (this.moveX > offsetX && this.index < this.getNumberVisibleItems() - 1) {
						this.setIndex(this.index + 1);
					} else if (this.moveX < offsetX && this.index > 0) {
						this.setIndex(this.index - 1);
					}
				}

				// Re-calculate the offset.
				offsetX = this.calculateItemOffsetX(this.index);

				// Move and animate the elements.
				this.$items
					.addClass('slider-animate')
					.css('transform', 'translate3d(-' + offsetX + 'px, 0, 0)');
			}

			this.moveX = null;
			this.touchMoveX = null;
			this.isLongTouch = false;

			if (this.isLongTouchTimeout) {
				clearTimeout(this.isLongTouchTimeout);
			}
		},

		getWidth: function() {

			return this.$el.width();
		},

		setIndex: function(index) {

			this.index = index;

			var adjustedIndex = index;

			this.$('.slider-item').slice(0, index + 1).each(function() {
				if (!$(this).is(':visible')) {
					adjustedIndex++;
				}
			});

			var key = this.options.items[adjustedIndex] && this.options.items[adjustedIndex].key;
			if (key) {
				this.trigger('change:active', key);
			}
		},

		calculateItemOffsetX: function(index) {

			var width = this.getWidth();
			var offsetX = index * width;

			// Adjust the offset to account for hidden items.
			this.$('.slider-item').slice(0, index).each(function() {
				if (!$(this).is(':visible')) {
					offsetX -= width;
				}
			});

			return offsetX;
		},

		getNumberVisibleItems: function() {

			return this.$('.slider-item:visible').length;
		},

		onClose: function() {

			_.each(this.itemViews, function(itemView) {
				itemView.close();
			});
		}

	});

})();
