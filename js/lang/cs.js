var app = app || {};

app.lang = app.lang || {};

app.lang['cs'] = (function() {

	return {
		'self.label': 'Čeština',
		'main.message.status.0': 'Chyba: Síťové spojení bylo zřejmě přerušeno',

		'about.version': 'Verze',
		'about.repo-url': 'Zdrojový kód a tracker problémů',
		'about.support-email': 'Podpora e-mailu',

		'admin.general-settings.label': 'Obecná nastavení',
		'admin.payment-history.label': 'Historie plateb',
		'admin.pin.label': 'Kód na administrace',
		'admin.pin.description': 'Zabraňuje neoprávněnému přístupu do administrativních oblastí',
		'admin.pin.set-pin.title': 'Nastavit kód',
		'admin.pin.change-pin.title': 'Změnit kód',
		'admin.pin.set': 'Nastavit',
		'admin.pin.change': 'Změnit',
		'admin.pin.remove': 'Odebrat',
		'admin.pin.min-length': 'Kód musí mít alespoň {{minLength}} číslice',

		'getting-started.buttons.back': 'Zpět',
		'getting-started.buttons.continue': 'Další',
		'getting-started.welcome.title': 'Ahoj!',
		'getting-started.welcome.instructions': 'CryptoTerminal je navržen pro použití s Vaší stávající aplikací peněženky. To umožní přijímat platby snadno a současně udržovat soukromé klíče, které bezpečně uloží Vaše prostředky v režimu offline nebo hardwarové peněžence. Doporučujeme použít jednu z následujících hardwarových peněženek k zabezpečení Vašich finančních prostředků:',
		'getting-started.welcome.ready?': 'Jakmile máte kryptopeněženku připravenou, můžete zahájit instalaci stisknutím tlačítka "Start" níže.',
		'getting-started.welcome.start': 'Začít',
		'getting-started.welcome.skip': 'Přeskočit řízený proces instalace',
		'getting-started.choose-payment-methods.title': 'Metody plateb',
		'getting-started.choose-payment-methods.instructions': 'Jaké metody plateb chcete přijímat?',
		'getting-started.done.title': 'Jo!',
		'getting-started.done.app-is-ready': 'Váš CryptoTerminal je připravený.',
		'getting-started.done.contact-below': 'Pokud máte nějaké potíže nebo chcete dát zpětnou vazbu, můžete nás kontaktovat přímo na e-mailové adrese uvedené níže.',
		'getting-started.done.ok': 'OK',
		'getting-started.general-settings.title': 'Generální nastavení',

		'settings.display-currency.label': 'Zobrazovaná měna',
		'settings.date-format.label': 'Datový formát',
		'settings.in-app-audio.label': 'Zvuk',
		'settings.in-app-audio.description': 'Hlavni on/off vypínácek pro všechny zvuky v aplikaci',
		'settings.accept-crypto-currencies.label': 'Jaké metody plateb chcete přijímat?',
		'settings.field-required': '{{label}} je vyžadován',

		'pay-enter-amount.description': 'Zadejte placenou částku',
		'pay-enter-amount.continue': 'Pokračovat',
		'pay-enter-amount.valid-number': 'Částka musí být platné číslo',
		'pay-enter-amount.greater-than-zero': 'Částka musí být větší než nula',

		'pay-choose-method.description': 'Vyberte metodu platby',
		'pay-choose-method.cancel': 'Zrušit',

		'pay-address.description': 'Načtěte QR kód',
		'pay-address.cancel': 'Zrušit',
		'pay-address.back': 'Zpět',

		'display-payment-address.message.warning': 'Pozor!',
		'display-payment-address.message.offline': 'Zařízení je bez připojení',
		'display-payment-address.message.cannot-verify-payment': 'Ověření platby není možné',

		'payment.status.pending': 'Čekající',
		'payment.status.canceled': 'Zrušeno',
		'payment.status.unconfirmed': 'Přijatý',
		'payment.status.confirmed': 'Potvrzený',
		'payment.status.timed-out': 'Čas vypršel',
		'payment-history.failed-to-get-payment-data': 'Nepodařilo se načíst data o platbách',
		'payment-history.empty': 'Žádné platby',
		'payment-details.title': 'Detaily platby',
		'payment-details.label.status': 'Postavení',
		'payment-details.label.timestamp': 'Datum',
		'payment-details.label.amount': 'Částka',
		'payment-details.back': 'Zpět',

		'payment-request.crypto-amount.field-missing': 'Nelze konvertovat na částku kryptoměny bez "{{field}}"',
		'payment-request.crypto-amount.unknown-method': 'Nelze konvertovat na částku kryptoměny, protože způsob platby neexistuje',
		'payment-request.data.invalid': '"data" je neplatný',
		'payment-request.status.invalid': '"status" je neplatný',

		'payment-status.unconfirmed.message': 'Díky!',
		'payment-status.unconfirmed.done': 'Hotovo',
		'payment-status.timed-out.message': 'Čas vypršel',
		'payment-status.timed-out.done': 'OK',

		'payment-replaceable.accept': 'Přijmout',
		'payment-replaceable.reject': 'odmítnout',
		'payment-replaceable.message': 'Pozor!',
		'payment-replaceable.info': 'Tuto transakci lze nahradit vyššími poplatky, chcete ji přijmout?',

		'sample-addresses.label': 'Vzorové adresy:',
		'enter-pin.cancel': 'Zrušit',
		'enter-pin.submit': 'Vstoupit',
		'pin-required.title': 'Kód je vyžadován',
		'pin-required.instructions': 'Pokud chcete pokračovat, zadejte kód',
		'pin-required.incorrect': 'Kód byl nesprávný',
		'device.camera.not-available': 'Kamera zařízení není k dispozici',

		'more-menu.about': 'O této aplikaci',
		'more-menu.recommended-mobile-wallets': 'Doporučené mobilní aplikace',

		'ct-api.missing-exchange-rates': 'Žádné směnné kurzy',
		'recommended-mobile-wallets.title': 'Doporučené Mobilní Aplikace',
		'recommended-mobile-wallets.description': 'Tady je seznam mobilních peněženek, které doporučujeme našim zákazníkům.',
		'recommended-mobile-wallets.instructions': 'Načtěte QR kód na otevření stránky aplikace',
		'recommended-mobile-wallets.section-title.android': 'Android zařízení',
		'recommended-mobile-wallets.section-title.ios': 'iOS zařízení',

		'screen-saver.instructions': '(klepněte pro aktivaci)',
	};

})();
