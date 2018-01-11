var app = app || {};

app.lang = app.lang || {};

app.lang['cs'] = (function() {

	return {
		'language.cs': 'Čeština',
		'language.en': 'Angličtina',
		'language.es': 'Španělština',
		'main.message.status.0': 'Chyba: Síťové spojení bylo zřejmě přerušeno',
		'menu.settings': 'Nastavení',
		'menu.payment-history': 'Historie plateb',
		'settings.title': 'Nastavení',
		'settings.general.label': 'Obecná nastavení',
		'settings.display-currency.label': 'Zobrazovaná měna',
		'settings.accept-crypto-currencies.label': 'Které měny chcete přijímat?',
		'settings.at-least-one-crypto-currency-required': 'Nastavte prosím alespoň jednu kryptoměnu',
		'settings.field-required': '{{label}} je vyžadován',
		'settings.save-success': 'Uloženo!',
		'settings.save': 'Uložit',
		'pay-enter-amount.description': 'Zadejte placenou částku',
		'pay-enter-amount.continue': 'Pokračovat',
		'pay-enter-amount.valid-number': 'Částka musí být platné číslo',
		'pay-enter-amount.greater-than-zero': 'Částka musí být větší než nula',
		'pay-choose-method.description': 'Vyberte metodu platby',
		'pay-choose-method.cancel': 'Zrušit',
		'pay-address.description': 'Pro zaplacení načtěte QR kód',
		'pay-address.timeout': 'Vypršel čas pro provedení platby',
		'pay-address.missing-payment-id': 'Chybí ID platby',
		'pay-address.cancel': 'Zrušit',
		'payment-history.title': 'Historie plateb',
		'payment-history.failed-to-get-payment-data': 'Nepodařilo se načíst data o platbách',
		'payment-details.title': 'Detaily platby',
		'payment-details.confirmed': 'Potvrzeno',
		'payment-details.unconfirmed': 'Nepotvrzeno',
		'payment-details.date': 'Datum',
		'payment-details.amount': 'Částka',
		'payment-request.data.must-be-object': '"data" musí být objekt',
	};

})();
