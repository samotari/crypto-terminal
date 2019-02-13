var app = app || {};

app.lang = app.lang || {};

app.lang['es'] = (function() {

	return {
		'self.label': 'Español',
		'main.message.status.0': 'Error: No hay conexión de red',

		'about.version': 'Versión',
		'about.repo-url': 'Código fuente y seguimiento de incidencias',
		'about.support-email': 'Email de soporte',

		'admin.general-settings.label': 'Configuración general',
		'admin.payment-history.label': 'Historia de Pagos',
		'admin.pin.label': 'PIN de administración',
		'admin.pin.description': 'Evita el acceso no autorizado a las áreas administrativas',
		'admin.pin.set-pin.title': 'Establecer PIN',
		'admin.pin.change-pin.title': 'Cambiar PIN',
		'admin.pin.set': 'Establecer PIN',
		'admin.pin.change': 'Cambiar',
		'admin.pin.remove': 'Eliminar',
		'admin.pin.min-length': 'El código debe tener al menos {{minLength}} dígito(s)',

		'getting-started.buttons.back': 'Volver',
		'getting-started.buttons.continue': 'Seguir',
		'getting-started.welcome.title': '¡Hola!',
		'getting-started.welcome.instructions': 'CryptoTerminal está diseñada para que sea usada con su monedero de criptomonedas. De esta manera es posible recibir pagos al tiempo que sus claves privadas quedan almacenadas de forma segura offline o en su monedero hardware. Recomendamos el uso de alguno de los siguientes monederos hardware:',
		'getting-started.welcome.start': 'Comenzar',
		'getting-started.welcome.skip': 'Saltar la configuración guiada',
		'getting-started.choose-payment-methods.title': 'Seleccione métodos de pago',
		'getting-started.choose-payment-methods.instructions': '¿Qué métodos de pago le gustaría aceptar?',
		'getting-started.done.title': '¡Completado!',
		'getting-started.done.app-is-ready': 'Su CryptoTerminal esta preparada para ser usada.',
		'getting-started.done.contact-below': 'Si encuentra dificultades o quire hacer alguna sugerencia, puede contactarnos directamente al email mostrado abajo.',
		'getting-started.done.ok': 'Vale',
		'getting-started.general-settings.title': 'Configuración general',

		'settings.display-currency.label': 'Moneda de cambio',
		'settings.date-format.label': 'Formato de fecha',
		'settings.in-app-audio.label': 'Sonido',
		'settings.in-app-audio.description': 'Active/Desactive todos los sonidos de la aplicación',
		'settings.accept-crypto-currencies.label': '¿Qué monedas quiere aceptar?',
		'settings.field-required': '{{label}} es requerido',

		'pay-enter-amount.description': 'Introduzca la cantidad a pagar',
		'pay-enter-amount.continue': 'Continuar',
		'pay-enter-amount.valid-number': 'La cantidad debe ser un número valido',
		'pay-enter-amount.greater-than-zero': 'La cantidad debe ser mayor que cero',

		'pay-choose-method.description': 'Seleccione un método de pago',
		'pay-choose-method.cancel': 'Cancelar',

		'pay-address.description': 'Escanee el código QR',
		'pay-address.cancel': 'Cancelar',
		'pay-address.back': 'Volver',

		'display-payment-address.message.warning': '¡Advertencia!',
		'display-payment-address.message.offline': 'Sin conexión a internet.',
		'display-payment-address.message.cannot-verify-payment': 'No se puede verificar el pago.',

		'payment.status.pending': 'Pendiente',
		'payment.status.canceled': 'Cancelado',
		'payment.status.unconfirmed': 'Aceptado',
		'payment.status.confirmed': 'Confirmado',
		'payment.status.timed-out': 'Caducado',
		'payment-history.failed-to-get-payment-data': 'Fallo cargando el pago',
		'payment-history.empty': 'Sin pagos',
		'payment-details.title': 'Detalles de pago',
		'payment-details.label.status': 'Estado',
		'payment-details.label.timestamp': 'Fecha',
		'payment-details.label.amount': 'Cantidad',
		'payment-details.back': 'Volver',
	
		'payment-request.crypto-amount.field-missing': 'No se puede convertir a la cantidad de criptomoneda sin "{{field}}"',
		'payment-request.crypto-amount.unknown-method': 'No se puede convertir a la cantidad de criptomoneda debido a que el método de pago no existe',
		'payment-request.data.invalid': 'Campo "data" es incorrecto',
		'payment-request.status.invalid': 'Campo "status" es incorrecto',

		'payment-status.unconfirmed.message': '¡Gracias!',
		'payment-status.unconfirmed.done': 'Hecho',
		'payment-status.timed-out.message': 'Expirado',
		'payment-status.timed-out.done': 'Vale',

		'payment-replaceable.accept': 'Aceptar',
		'payment-replaceable.reject': 'Rechazar',
		'payment-replaceable.message': '¡Advertencia!',
		'payment-replaceable.info': 'Esta transacción puede ser reemplazable con una tasa más alta, ¿Quiere aceptarla?',

		'sample-addresses.label': 'Direcciones de muestra:',
		'enter-pin.cancel': 'Cancelar',
		'enter-pin.submit': 'Aceptar',
		'pin-required.title': 'Se requiere código PIN',
		'pin-required.instructions': 'Introduzca el código PIN para continuar',
		'pin-required.incorrect': 'Código PIN incorrecto',
		'device.camera.not-available': 'Cámara del dispositivo no disponible',

		'more-menu.about': 'Acerca de esta aplicación',
		'more-menu.recommended-mobile-wallets': 'Monederos móviles recomendados',

		'ct-api.missing-exchange-rates': 'Faltan tasas de cambio',
		'recommended-mobile-wallets.title': 'Monederos móviles recomendados',
		'recommended-mobile-wallets.description': 'A continuación puede ver las aplicaciones de monederos móviles que recomendamos a nuestros clientes',
		'recommended-mobile-wallets.instructions': 'Escanee el código QR con su móvil para navegar a las applicaciones recomendadas',
		'recommended-mobile-wallets.section-title.android': 'Para dispositivos Android',
		'recommended-mobile-wallets.section-title.ios': 'Para dispositivos iOS',

		'screen-saver.instructions': '(Toque en cualquier lugar para activar)',
	};

})();
