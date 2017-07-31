var app = app || {};

app.collections = app.collections || {};

app.collections.PaymentRequests = (function() {

    'use strict';

	return Backbone.Collection.extend({

		localStorageKey: 'PR',
		
		localStorageAmountKey: '#PR',

		fetch: function() {

			var amoutOfPayments = localStorage.getItem(this.localStorageAmountKey);
			var paymentsFetched = [];
			var data;
			
			if (amoutOfPayments) {
				for (var e = 0; e < amoutOfPayments; e++) {
					data = JSON.parse(localStorage.getItem(this.localStorageKey + '-' + e))
					paymentsFetched.push(data);
				}
			}

			if (paymentsFetched) {
				return this.set(paymentsFetched);
			}
		},

		savePayment: function(payment) {

			var amountOfPaymentRequests = localStorage.getItem(this.localStorageAmountKey) || 0;
			var nextPaymentReference = this.localStorageKey + '-' + (++amountOfPaymentRequests);

			if (payment) {
				localStorage.setItem(this.localStorageAmountKey, amountOfPaymentRequests);
				localStorage.setItem(nextPaymentReference, JSON.stringify(payment));
			}
        }
	});

})();