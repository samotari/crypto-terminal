var app = app || {};

app.views = app.views || {};

app.views.ApiVerify = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'api-verify',
		template: '#template-api-verify',

		success: null,

		initialize: function() {
			this.success = this.options.status && this.options.status === 'success';
		},

		serializeData: function() {
			return {
				label: this.options.label,
				message: this.options.message,
			};
		},

		onRender: function() {
			this.$el.addClass(this.options.status);
		},
	});

})();
