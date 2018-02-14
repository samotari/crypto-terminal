var app = app || {};

app.abstracts = app.abstracts || {};

app.abstracts.BaseView = (function() {

	'use strict';

	return Backbone.View.extend({

		_rendered: false,

		constructor: function(options) {

			this.options = options || {};

			_.bindAll(this, 'render', 'close');

			Backbone.View.prototype.constructor.apply(this, arguments);

			this.listenTo(app.settings, 'change:locale', this.render);
		},

		isRendered: function() {

			return this._rendered === true;
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

		serializeData: function() {

			return this.model && this.model.toJSON() || null;
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

		close: function() {

			this.onClose();

			// Stop listening to other objects (models, collections, etc).
			this.stopListening();

			// Remove all callbacks bound to the view itself.
			this.unbind();

			// Remove the view from the DOM.
			this.remove();

			return this;
		},

		onClose: function() {
			// Left empty intentionally.
			// Override as needed.
			return this;
		}
	});

})();
