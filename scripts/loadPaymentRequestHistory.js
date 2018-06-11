/**
	The purpose of this script is to flood Payment History with many different items in order to test it.
 */

(function(repetitions) {
	var currencies = app.config.supportedDisplayCurrencies;
	var statuses = app.models.PaymentRequest.prototype.getStatuses();

	var takeRandomItem = function (items) {
		return items[Math.floor(Math.random()*items.length)];
	}

	var paymentRequestGenerator = function() {
		var rate = '163713.02';
		var amount = ((Math.random() * 100) | 10).toString()
		var cryptoAmount = amount / parseInt(rate);
		return {
			amount: amount,
			currency: takeRandomItem(currencies),
			data: {
				address: 'mtZsoWs3Q7KXYZPG5nZwutFTirah7NmDzc'
			},
			method: 'bitcoin',
			rate: rate,
			status: takeRandomItem(statuses),
			timestamp: (new Date()).getTime(),
			uri: 'bitcoin:mtZsoWs3Q7KXYZPG5nZwutFTirah7NmDzc?amount=' + cryptoAmount.toString().substr(0, 10)
		}
	}

	var createPaymentRequest = function(index, callback) {

		var model = new app.models.PaymentRequest();
		var paymentRequest = paymentRequestGenerator();
		model.set(paymentRequest).save();

		callback(null, {
			PaymentRequest: paymentRequest
		});
	};

	async.times(repetitions, function(n, next) {
		createPaymentRequest(n, function(error, paymentRequest) {
			setTimeout(function() {
				console.log('paymentRequest', paymentRequest);
				next(null, paymentRequest);
			}, 100);
		})
	}, function(error, results) {
		if (error) {
			return console.log('Error: ' + error);
		}

		console.log('Completed! ', results.length, ' items were created');
	});

})(2);
