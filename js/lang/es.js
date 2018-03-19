var app = app || {};

app.lang = app.lang || {};

app.lang['es'] = (function() {

	return {
		'language.cs': 'Checo',
		'language.en': 'Inglés',
		'language.es': 'Español',
		'language.fr': 'Francais',
		'main.message.status.0': 'Error: No hay conexión de red',
		'admin.title': 'Administración',
		'admin.general-settings.label': 'Configuración general',
		'admin.payment-history.label': 'Historia de Pagos',
		'settings.display-currency.label': 'Moneda de cambio',
		'settings.accept-crypto-currencies.label': '¿Qué monedas quiere aceptar?',
		'settings.at-least-one-crypto-currency-required': 'Por favor configure al menos una criptomoneda',
		'settings.field-required': '{{label}} es requerido',
		'pay-enter-amount.description': 'Introduzca la cantidad a pagar',
		'pay-enter-amount.continue': 'Continuar',
		'pay-enter-amount.valid-number': 'La cantidad debe ser un número valido',
		'pay-enter-amount.greater-than-zero': 'La cantidad debe ser mayor que cero',
		'pay-choose-method.description': 'Seleccione un método de pago',
		'pay-choose-method.cancel': 'Cancelar',
		'pay-address.description': 'Escanee el código QR',
		'pay-address.timeout': 'Desconexión esperando el pago',
		'pay-address.missing-payment-id': 'Falta código de pago',
		'pay-address.cancel': 'Cancelar',
		'pay-address.back': 'Regresa',
		'payment-history.title': 'Historia de pago',
		'payment-history.failed-to-get-payment-data': 'Fallo cargando el pago',
		'payment-details.title': 'Detalles de pago',
		'payment-details.confirmed': 'Confirmado',
		'payment-details.unconfirmed': 'Sin confirmar',
		'payment-details.date': 'Fecha',
		'payment-details.amount': 'Cantidad',
		'payment-request.data.must-be-object': '"data" tiene que ser un objeto.',
		'payment-confirmation.done': 'Hecho'
	};

})();
