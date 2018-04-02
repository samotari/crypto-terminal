var app = app || {};

app.collections = app.collections || {};

app.collections.PaymentRequests = (function() {

	'use strict';

	return app.abstracts.BaseCollection.extend({
		model: app.models.PaymentRequest,
		storeName: 'payment_requests',
	});

})();
