var app = app || {};

app.views = app.views || {};

app.views.Slider = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		events: {
			'touchstart .slider-items': 'onTouchStart',
			'touchmove .slider-items': 'onTouchMove',
			'touchend .slider-items': 'onTouchEndOrCancel',
			'touchcancel .slider-items': 'onTouchEndOrCancel',
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
		slidable: false,
		index: 0,

		initialize: function() {

			_.bindAll(this, 'finalizeTouchMovement');

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

		onTouchStart: function(evt) {

			this.touchStartPosX = evt.originalEvent.touches[0].pageX;
			this.touchStartTime = Date.now();
			this.slidable = true;
		},

		onTouchMove: function(evt) {

			if (!this.slidable) return;
			clearTimeout(this.touchMoveTimeout);
			/*
				!! IMPORTANT !!

				Calling preventDefault() prevents the premature touchcancel event in Android 4.4.x

				See:
				https://stackoverflow.com/questions/10367854/html5-android-touchcancel
			*/
			evt.preventDefault();
			var posX = this.lastTouchPosX = evt.originalEvent.touches[0].pageX;
			var offsetX = this.calculateItemOffsetX(this.index);
			var tmpOffsetX = offsetX + (this.touchStartPosX - posX);
			// Update the offset of the items container, but without an animation.
			this.translateX(tmpOffsetX, { animate: false });
		},

		onTouchEndOrCancel: function(evt) {

			if (!this.slidable) return;
			clearTimeout(this.touchMoveTimeout);
			this.finalizeTouchMovement();
		},

		calculateVelocity: function(endPosX, startPosX, startTime) {

			return (startPosX - endPosX) / (Date.now() - startTime);
		},

		finalizeTouchMovement: function() {

			// Prevent anymore sliding until a new touchstart event.
			this.slidable = false;
			// Calculate the distance swiped.
			var offsetX = this.calculateItemOffsetX(this.index);
			var moveX = offsetX + (this.touchStartPosX - this.lastTouchPosX);
			var absoluteMoveX = Math.abs(offsetX - moveX);
			var width = this.getSlideWidth();
			var velocity = this.calculateVelocity(
				this.lastTouchPosX,
				this.touchStartPosX,
				this.touchStartTime
			);
			var speed = Math.abs(velocity);
			var speedThreshold = app.config.sliders.speedThreshold;// pixels/milliseconds
			var index = this.index;
			if (absoluteMoveX > (width / 2) || speed > speedThreshold) {
				var numSlides = this.getNumberVisibleItems();
				if (velocity > speedThreshold || moveX > offsetX && index < numSlides
				) {
					index++;
				} else if (velocity < speedThreshold * -1 || moveX < offsetX) {
					index--;
				}
			}
			this.setIndex(index, { animate: true });
		},

		translateX: function(posX, options) {

			options = _.defaults(options || {}, {
				animate: false,
			});

			if (options.animate) {
				this.$items.addClass('slider-animate');
			} else {
				this.$items.removeClass('slider-animate');
			}

			var maxPosX = (this.getSlideWidth() * (this.options.items.length - 0.8));
			posX = Math.min(posX, maxPosX);
			this.$items.css('transform', 'translate3d(-' + posX + 'px, 0, 0)');
		},

		getSlideWidth: function() {

			return this.$el.width();
		},

		setIndex: function(index, options) {

			// Index cannot be less than zero.
			// Nor can it better greater than the number of items minus one.
			index = Math.max(0, Math.min(index, this.options.items.length - 1));

			options = _.defaults(options || {}, {
				animate: false,
			});

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

			// Calculate the offset of the slide by its index.
			var offsetX = this.calculateItemOffsetX(index);

			// Move and animate the items element to bring the slide into view.
			this.translateX(offsetX, options);
		},

		calculateItemOffsetX: function(index) {

			var width = this.getSlideWidth();
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
