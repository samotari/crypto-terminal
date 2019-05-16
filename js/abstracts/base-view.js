var app = app || {};

app.abstracts = app.abstracts || {};

app.abstracts.BaseView = (function() {

	'use strict';

	return Backbone.View.extend({

		_rendered: false,

		// Set this to TRUE to keep the view instead of closing it.
		doNotClose: false,

		constructor: function(options) {

			this.options = options || {};

			this._subViews = [];

			_.bindAll(this,
				'close',
				'render',
				'onResize',
				'onChangeLocale'
			);

			Backbone.View.prototype.constructor.apply(this, arguments);

			this.listenTo(app.settings, 'change:locale', this.onChangeLocale);

			/*
				Start listening to resize on the window object.
				We're using a namespace for this individual view's events.
				This allows us to stop this view from listening without interfering with other listeners.

				See:
				https://api.jquery.com/event.namespace/
			*/
			$(window).on('resize.' + this.cid, _.throttle(this.onResize, 1000));
		},

		isRendered: function() {

			return this._rendered === true;
		},

		onChangeLocale: function() {

			this.reRender();
		},

		reRender: function() {

			if (this.isRendered() && this.isVisible()) {
				this.render();
			}
		},

		render: function() {

			var template = this.getTemplate();

			if (!template) {
				throw new Error('Cannot render view without a template');
			}

			var data = this.serializeData();
			var html = template(data);
			this.$el.html(html);
			this._rendered = true;
			this.onRender();
			return this;
		},

		onRender: function() {
			// Left empty intentionally.
			// Override as needed.
			return this;
		},

		isVisible: function() {

			return this.$el && this.$el.is(':visible');
		},

		serializeData: function() {

			return this.model && this.model.toJSON() || {};
		},

		getTemplate: function() {

			var id = _.result(this, 'template');

			if (!id) {
				throw new Error('Template not specified');
			}

			var $template = id && $(id);

			if (!$template || !($template.length > 0)) {
				throw new Error('Missing template: "' + id + '"');
			}

			var html = $template && $template.html() || '';
			return Handlebars.compile(html);
		},

		setElement: function() {

			Backbone.View.prototype.setElement.apply(this, arguments);
			_.each(this._subViews, function(subView) {
				subView.setElement(subView.$el);
			});
			return this;
		},

		attachSubView: function(subView) {

			this._subViews.push(subView);
		},

		onResize: function() {
			// Left empty intentionally.
			// Override as needed.
			return this;
		},

		close: function() {

			this.onClose();

			// Stop listening to other objects (models, collections, etc).
			this.stopListening();
			$(window).off('resize.' + this.cid);

			// Remove all callbacks bound to the view itself.
			this.unbind();

			// Remove the view from the DOM.
			this.remove();

			this.trigger('close');

			return this;
		},

		onClose: function() {
			// Left empty intentionally.
			// Override as needed.
			return this;
		}
	}, {
		extend: function(properties, classProperties) {
			properties = properties || {};
			// Extend the events object, instead of overwriting.
			properties.events = _.extend({}, this.prototype.events || {}, properties.events || {});
			return Backbone.View.extend.call(this, properties, classProperties);
		}
	});

})();
