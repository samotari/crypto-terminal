var app = app || {};

app.lang = app.lang || {};

app.lang['de'] = (function() {

	return {
		'self.label': 'Deutsch',
		'main.message.status.0': 'Fehler: Das Netzwerk scheint nicht verfügbar zu sein',

		'about.version': 'Version',
		'about.repo-url': 'Quellcode und Problem Tracker',
		'about.support-email': 'Support E-mail',

		'admin.general-settings.label': 'Allgemeine Einstellungen',
		'admin.payment-history.label': 'Zahlungsverlauf',
		'admin.pin.label': 'Administrator PIN',
		'admin.pin.description': 'Verhindert den unbefugten Zugriff auf administrative Bereiche',
		'admin.pin.set-pin.title': 'PIN aktivieren',
		'admin.pin.change-pin.title': 'PIN ändern',
		'admin.pin.set': 'PIN aktivieren',
		'admin.pin.change': 'PIN ändern',
		'admin.pin.remove': 'PIN löschen',
		'admin.pin.min-length': 'Die PIN muss aus mindestens {{minLength}} Ziffer(n) bestehen',

		'getting-started.buttons.back': 'Zurück',
		'getting-started.buttons.next': 'Weiter',
		'getting-started.welcome.title': 'Geschafft!',
		'getting-started.welcome.instructions': 'CryptoTerminal wurde entwickelt, um mit Ihrer vorhandenen Wallet Anwendung verwendet zu werden. Auf diese Weise können Sie problemlos Zahlungen empfangen, während Ihre privaten Schlüssel sicher offline oder in einer Hardware-Wallet aufbewahren. Wir empfehlen Ihnen eine der folgenden Hardware-Brieftaschen zu verwenden, um Ihr Guthaben zu sichernn:',
		'getting-started.welcome.ready?': 'Sobald Sie Ihre Krypto-Wallets vorbereitet haben, drücken Sie "Starten" um mit dem Setup zu beginnen.',
		'getting-started.welcome.start': 'Starten',
		'getting-started.welcome.skip': 'Überspringen Sie das Setup',
		'getting-started.choose-payment-methods.title': 'Wählen Sie die gewünschten Zahlungsmethoden',
		'getting-started.choose-payment-methods.instructions': 'Welche Zahlungsmethoden möchten Sie akzeptieren?',
		'getting-started.done.title': 'Gratulation!',
		'getting-started.done.app-is-ready': 'Ihr CryptoTerminal ist jetzt einsatzbereit.',
		'getting-started.done.contact-below': 'Wenn Sie Probleme haben oder uns Feedback geben möchten, können Sie uns direkt unter der unten angegebenen E-Mail Adresse erreichen.',
		'getting-started.done.ok': 'OK',
		'getting-started.general-settings.title': 'Allgemeine Einstellungen',

		'settings.display-currency.label': 'Anzeige Währung',
		'settings.date-format.label': 'Datumsformat',
		'settings.in-app-audio.label': 'Musik',
		'settings.in-app-audio.description': 'Ein-/Ausschalter für alle Sounds in der App',
		'settings.accept-crypto-currencies.label': 'Welche Zahlungsmethoden möchten Sie akzeptieren?',
		'settings.field-required': '{{label}} wird benötigt',

		'pay-enter-amount.description': 'Geben Sie den zu zahlenden Betrag ein',
		'pay-enter-amount.continue': 'Fortsetzen',
		'pay-enter-amount.valid-number': 'Der Betrag muss eine Zahl sein.',
		'pay-enter-amount.greater-than-zero': 'Der Betrag muss größer als null sein.',

		'pay-choose-method.description': 'Wählen Sie die Zahlungsmethode',
		'pay-choose-method.cancel': 'Abbrechen',

		'pay-address.description': 'Scannen Sie den QR-Code, um zu bezahlen',
		'pay-address.cancel': 'Abbrechen',
		'pay-address.back': 'Zurück',

		'display-payment-address.message.warning': 'Warnung!',
		'display-payment-address.message.offline': 'Gerät ist offline.',
		'display-payment-address.message.cannot-verify-payment': 'Zahlung kann nicht verifiziert werden.',

		'payment.status.pending': 'Schwebend',
		'payment.status.canceled': 'Abgebrochen',
		'payment.status.unconfirmed': 'Akzeptiert',
		'payment.status.confirmed': 'Bestätigt',
		'payment.status.timed-out': 'Zeitüberschreitung',
		'payment-history.failed-to-get-payment-data': 'Fehler beim Laden der Zahlungsdaten',
		'payment-history.empty': 'Noch keine Zahlungen vorhanden',
		'payment-details.title': 'Zahlungsdetails',
		'payment-details.label.status': 'Status',
		'payment-details.label.timestamp': 'Datum',
		'payment-details.label.amount': 'Menge',
		'payment-details.back': 'Zurück',

		'payment-request.crypto-amount.field-missing': 'Kann nicht ohne "{{field}}" in Kryptowährungswert konvertiert werden',
		'payment-request.crypto-amount.unknown-method': 'Kann nicht in Kryptowährungswert konvertieren, da die Zahlungsmethode nicht existiert',
		'payment-request.data.invalid': '"Datum" Feld ungültig',
		'payment-request.status.invalid': '"Status" Feld ungültig',

		'payment-status.unconfirmed.message': 'Danke!',
		'payment-status.unconfirmed.done': 'Erledigt',
		'payment-status.timed-out.message': 'Zeitüberschreitung',
		'payment-status.timed-out.done': 'OK',

		'payment-replaceable.accept': 'Akzeptieren',
		'payment-replaceable.reject': 'Ablehnen',
		'payment-replaceable.message': 'Achtung!',
		'payment-replaceable.info': 'Diese Transaktion kann durch eine höhere Gebühr ersetzt werden, möchten Sie dies akzeptieren?',

		'sample-addresses.label': 'Beispiel Adressen:',
		'enter-pin.cancel': 'Abbruch',
		'enter-pin.submit': 'Enter',
		'pin-required.title': 'PIN notwendig',
		'pin-required.instructions': 'Geben Sie die PIN ein, um fortzufahren',
		'pin-required.incorrect': 'Die eingegebene PIN war falsch',
		'device.camera.not-available': 'Kamera nicht verfügbar',

		'more-menu.about': 'Über diese App',
		'more-menu.recommended-mobile-wallets': 'Empfohlene mobile Wallets',

		'ct-api.missing-exchange-rates': 'Fehlende Wechselkurs Daten',
		'recommended-mobile-wallets.title': 'Empfohlene mobile Wallets',
		'recommended-mobile-wallets.description': 'Folgende mobilen Wallet Anwendungen möchten wir unseren Kunden empfehlen.',
		'recommended-mobile-wallets.instructions': 'Scannen Sie einen der QR-Code mit Ihrem mobilen Gerät, um zum App-Store bzw. Play-Store der jeweiligen App zu gelangen.',
		'recommended-mobile-wallets.section-title.android': 'Für Android Geräte',
		'recommended-mobile-wallets.section-title.ios': 'Für iOS Geräte',

		'screen-saver.instructions': '(Tippen Sie irgendwo um CryptoTerminal zu aktivieren)',
	};

})();
