var app = app || {};

app.lang = app.lang || {};

app.lang['en'] = (function() {

	return {
		'language.cs': 'Czech',
		'language.en': 'English',
		'language.es': 'Spanish',
		'main.message.status.0': 'Error: Network seems to be down',
		'menu.new-payment': 'New Payment',
		'menu.settings': 'Settings',
		'menu.payment-history': 'Payment History',
		'settings.title': 'Settings',
		'settings.general.label': 'General settings',
		'settings.display-currency.label': 'Display Currency',
		'settings.accept-crypto-currencies.label': 'Which currencies do you want to accept?',
		'settings.at-least-one-crypto-currency-required': 'Please configure at least one cryptocurrency',
		'settings.field-required': '{{label}} is required',
		'settings.save-success': 'Saved!',
		'settings.save': 'Save',
		'pay-enter-amount.description': 'Enter amount to be paid',
		'pay-enter-amount.continue': 'Continue',
		'pay-enter-amount.valid-number': 'Amount must be a valid number',
		'pay-enter-amount.greater-than-zero': 'Amount must be greater than zero.',
		'pay-choose-method.description': 'Select payment method',
		'pay-choose-method.cancel': 'Cancel',
		'pay-address.description': 'Scan the QR code to pay',
		'pay-address.timeout': 'Timed out while waiting for payment',
		'pay-address.missing-payment-id': 'Missing payment ID',
		'pay-address.cancel': 'Cancel',
		'pay-address.back': 'Change payment method',
		'payment-history.title': 'Payments History',
		'payment-history.failed-to-get-payment-data': 'Failed to load payment data',
		'payment-details.title': 'Payment Details',
		'payment-details.confirmed': 'Confirmed',
		'payment-details.unconfirmed': 'Unconfirmed',
		'payment-details.date': 'Date',
		'payment-details.amount': 'Amount',
		'payment-request.data.must-be-object': '"data" must be an object.',
	};

})();
