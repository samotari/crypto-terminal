/**
	The purpose of this script is to flood Payment History with many different items in order to test it.
 */
(function(repetitions) {

	var currencies = app.util.getSupportedDisplayCurrencies();
	var statuses = _.difference(app.models.PaymentRequest.prototype.getStatuses(), ['pending']);

	var takeRandomItem = function (items) {
		return items[Math.floor(Math.random()*items.length)];
	};

	var createPaymentRequest = function() {
		var rate = '163713.02';
		var amount = ((Math.random() * 100) | 10).toString()
		var cryptoAmount = amount / parseInt(rate);
		var data = {
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
		};
		return data;
	};

	var paymentRequests = [];
	for (var index = 0; index < repetitions; index++) {
		paymentRequests.push(createPaymentRequest());
	}
	app.paymentRequests.add(paymentRequests).save();
	console.log('Completed! ', paymentRequests.length, ' items were created');

})(2);
