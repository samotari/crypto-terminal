var app = app || {};

app.views = app.views || {};

app.views.utility.ListItem = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		model: null,

		constructor: function() {

			// Must go before event bindings.
			app.abstracts.BaseView.prototype.constructor.apply(this, arguments);

			if (this.collection) {
				this.listenTo(this.model, 'all', this.render);
			}
		},
	});
})();
