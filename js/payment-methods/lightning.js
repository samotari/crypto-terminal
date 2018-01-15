var app = app || {};

app.paymentMethods = app.paymentMethods || {};

app.paymentMethods.lightning = (function() {

    'use strict';

    return app.abstracts.PaymentMethod.extend({
	// The name of the cryptocurrency shown in the UI:
	label: 'Lightning',

	// The exchange symbol:
	code: 'BTC',

	// Used internally to reference itself:
	ref: 'lightning',

	lang: {
	    'en' : {
		'settings.memo.label': 'Invoice Memo',
	    	'invalid-payment-request': 'Invalid payment request',
	    }
	},

	settings: [
	    {
	    	name: 'memo',
	    	label: function() {
	    		return app.i18n.t('lightning.settings.memo.label');
	    	},
	    	type: 'text',
	    	required: false,
	    } 
	],


	generatePaymentRequest: function(amount, cb) {

	    var satoshi = parseInt(amount*1e8); // convert to satoshi

	    this.addInvoice(satoshi,_.bind(function(error,res){
		if (error){
		    cb(error);
		}

		var req = res.payment_request
		var paymentRequest = this.ref + ":" + req

		console.log(paymentRequest)

		cb(null,paymentRequest,paymentRequest,satoshi);
	    },this));


	},

	// addInvoice
	addInvoice: function(value,cb) {

	    // addInvoice
	    var memo = app.settings.get(this.ref + '.memo');
	    var expiry = 3600;

	    var uri = "http://localhost:8280";
	    uri += "/api/lnd/addinvoice";

	    var data = {"memo": memo, "value": value, "expiry":expiry};

	    $.post(uri, data).then( function(result,err) {
		cb(null,result);
	    }).fail(cb);
	},


	getExchangeRates: function(cb) {

	    app.services.coinbase.getExchangeRates(this.code, cb);

	},

	checkPaymentReceived: function(paymentRequest, cb) {

	    _.defer(_.bind(function() {
		var matches = paymentRequest.match(/lightning:([a-zA-Z0-9]+)/);

		if (!matches) {
		    return cb(new Error(app.i18n.t('lightning.invalid-payment-request')));
		}

		var payreq = matches[1];

		var uri = "http://localhost:8280";
		uri += "/api/lnd/listinvoices";

		var wasReceived = false;
		var amountReceived = 0;

		$.get(uri).then(function(result) {

		    _.each(result.invoices, function(invoice) {
			if (invoice.payment_request == payreq ){

			    wasReceived = invoice.settled;
			    amountReceived = invoice.value;
			    return false; // break from the .each function
			}
		    });

		    cb(null,wasReceived,amountReceived);

		}).fail(cb);

	    }, this));
	}
    });
})();
