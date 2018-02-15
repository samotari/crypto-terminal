var app = app || {};

app.views = app.views || {};

app.views.SampleAddresses = (function() {

	'use strict';

	return app.abstracts.BaseView.extend({

		className: 'sample-addresses',
		template: '#template-sample-addresses',

		serializeData: function() {
			return {
				addresses: this.options.addresses,
				error: this.options.error,
			};
		}
	});

})();
