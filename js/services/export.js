var app = app || {};

app.services = app.services || {};

app.services.export = (function () {

	'use strict';

	var csvHeaders = [
		"id",
		"amount",
		"currency",
		"display currency code",
		"display currency rate",
		"address",
		"date"
	];

	function convertToCsv(object) {
		return [
			object.id,
			object.amount,
			object.currency,
			object.displayCurrency.code,
			object.displayCurrency.rate,
			object.address,
			new Date(object.timestamp)
		];
	}

	return {
		exportPaymentHistory: function (history, success, error) {
			var csv = _.reduce(history, function (memo, num) {
				return memo + "\n" + convertToCsv(num).join(",");
			}, csvHeaders.join(","));

			app.writeFile("payments.csv", csv, success, error);
		}
	}

})();
