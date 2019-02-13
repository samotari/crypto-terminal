var app = app || {};

app.lang = app.lang || {};

app.lang['en'] = (function() {

	return {
		'self.label': 'English',
		'main.message.status.0': 'Error: Network seems to be down',

		'about.version': 'Version',
		'about.repo-url': 'Source code and issue tracker',
		'about.support-email': 'Support email',

		'admin.general-settings.label': 'General settings',
		'admin.payment-history.label': 'Payment History',
		'admin.pin.label': 'Admin PIN',
		'admin.pin.description': 'Prevents unauthorized access to administrative areas',
		'admin.pin.set-pin.title': 'Set PIN',
		'admin.pin.change-pin.title': 'Change PIN',
		'admin.pin.set': 'Set PIN',
		'admin.pin.change': 'Change PIN',
		'admin.pin.remove': 'Remove PIN',
		'admin.pin.min-length': 'PIN must be at least {{minLength}} digit(s)',

		'getting-started.buttons.back': 'Back',
		'getting-started.buttons.continue': 'Next',
		'getting-started.welcome.title': 'Welcome!',
		'getting-started.welcome.instructions': 'CryptoTerminal is a payment terminal. It is not a wallet application. It is designed for you to easily receive payments while keeping your private keys stored safely offline or in a hardware wallet such as one of the following:',
		'getting-started.welcome.start': 'Start',
		'getting-started.welcome.skip': 'Skip guided setup',
		'getting-started.choose-payment-methods.title': 'Choose payment methods',
		'getting-started.choose-payment-methods.instructions': 'Which payment methods would you like to accept?',
		'getting-started.done.title': 'Yay!',
		'getting-started.done.app-is-ready': 'Your CryptoTerminal is now ready to use.',
		'getting-started.done.contact-below': 'If you have any trouble or would like to provide feedback, you can reach us directly at the email address shown below.',
		'getting-started.done.ok': 'OK',
		'getting-started.general-settings.title': 'General settings',

		'settings.display-currency.label': 'Display Currency',
		'settings.date-format.label': 'Date Format',
		'settings.theme.label': 'Theme',
		'settings.theme.option.default.label': 'Default',
		'settings.theme.option.dark.label': 'Dark',
		'settings.in-app-audio.label': 'Sound',
		'settings.in-app-audio.description': 'Main on/off switch for all sounds in the app',
		'settings.accept-crypto-currencies.label': 'Which payment methods would you like to accept?',
		'settings.field-required': '{{label}} is required',
		'settings.screen-saver.label': 'Screen Saver',
		'settings.screen-saver.description': 'Show the screen saver animation after a long time of inactivity',

		'pay-enter-amount.description': 'Enter amount to be paid',
		'pay-enter-amount.continue': 'Continue',
		'pay-enter-amount.valid-number': 'Amount must be a number',
		'pay-enter-amount.greater-than-zero': 'Amount must be greater than zero.',

		'pay-choose-method.description': 'Select payment method',
		'pay-choose-method.cancel': 'Cancel',

		'pay-address.description': 'Scan the QR code to pay',
		'pay-address.cancel': 'Cancel',
		'pay-address.back': 'Back',

		'display-payment-address.message.warning': 'Warning!',
		'display-payment-address.message.offline': 'Device is offline.',
		'display-payment-address.message.cannot-verify-payment': 'Cannot verify payment.',

		'payment.status.pending': 'Pending',
		'payment.status.canceled': 'Canceled',
		'payment.status.unconfirmed': 'Accepted',
		'payment.status.confirmed': 'Confirmed',
		'payment.status.timed-out': 'Timed out',

		'payment-history.failed-to-get-payment-data': 'Failed to load payment data',
		'payment-history.empty': 'No payments yet',
		'payment-history.export.success': 'Your payments history has been exported in your downloads folder',
		'payment-history.export.fail': 'An error happened during the export of payments history.',
		'payment-history.export.dialog.download': 'Download',
		'payment-history.export.dialog.cancel': 'Cancel',
		'payment-history.export.dialog.message': 'The payment history is ready to download.',
		'payment-history.export.dialog.default-file-name': 'payment-history',
		'payment-history.export.dialog.fileName-label': 'File name (.csv)',

		'payment-details.title': 'Payment Details',
		'payment-details.label.status': 'Status',
		'payment-details.label.timestamp': 'Date',
		'payment-details.label.amount': 'Amount',
		'payment-details.back': 'Back',

		'payment-request.crypto-amount.field-missing': 'Cannot convert to cryptocurrency amount without "{{field}}"',
		'payment-request.crypto-amount.unknown-method': 'Cannot convert to cryptocurrency amount because the payment method does not exist',
		'payment-request.data.invalid': '"data" field invalid',
		'payment-request.status.invalid': '"status" field invalid',

		'payment-status.unconfirmed.message': 'Thanks!',
		'payment-status.unconfirmed.done': 'Done',
		'payment-status.timed-out.message': 'Timed out',
		'payment-status.timed-out.done': 'OK',

		'payment-replaceable.accept': 'Accept',
		'payment-replaceable.reject': 'Reject',
		'payment-replaceable.message': 'Attention!',
		'payment-replaceable.info': 'This transaction can be replaced by higher fee, do you want to accept it?',

		'sample-addresses.label': 'Sample Addresses:',
		'enter-pin.cancel': 'Cancel',
		'enter-pin.submit': 'Enter',
		'pin-required.title': 'PIN Required',
		'pin-required.instructions': 'Enter the admin PIN to continue',
		'pin-required.incorrect': 'The PIN you entered was incorrect',
		'device.camera.not-available': 'Device camera not available',

		'more-menu.about': 'About this app',
		'more-menu.recommended-mobile-wallets': 'Recommended mobile wallets',

		'ct-api.missing-exchange-rates': 'Missing exchange rates data',
		'recommended-mobile-wallets.title': 'Recommended Mobile Wallets',
		'recommended-mobile-wallets.description': 'The following are the mobile wallet applications that we recommend to our customers.',
		'recommended-mobile-wallets.instructions': 'Scan a QR code with your mobile device to navigate to that app\'s Play or App store listing.',
		'recommended-mobile-wallets.section-title.android': 'For Android devices',
		'recommended-mobile-wallets.section-title.ios': 'For iOS devices',

		'screen-saver.instructions': '(tap anywhere to activate)',
	};

})();
