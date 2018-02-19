var app = app || {};

app.lang = app.lang || {};

app.lang['fr'] = (function() {

	return {
		'language.cs': 'Czech',
		'language.en': 'English',
		'language.es': 'Spanish',
    'language.fr': 'French',
		'main.message.status.0': 'Erreur: il n\'y a pas  de reseau',
		'menu.new-payment': 'Nouveau Paiement',
		'menu.settings': 'Parametres',
		'menu.payment-history': 'Histoire des paiements',
		'settings.title': 'Parametres titre',
		'settings.general.label': 'Parametres Generales',
		'settings.display-currency.label': 'Montrer le Monnaie',
		'settings.date-format.label': 'Forme de Date ',
		'settings.accept-crypto-currencies.label': 'Quel type de monnaie vous voulez?',
		'settings.at-least-one-crypto-currency-required': 'Veuillez configurez un monnaie crypto',
		'settings.field-required': '{{label}} est requis',
		'form.save-success': 'Enregistrement reussi!',
		'form.save': 'Enregistrer',
		'pay-enter-amount.description': 'Entrez le montant a payer',
		'pay-enter-amount.continue': 'Continuer',
		'pay-enter-amount.valid-number': 'Le montant doit etre un numero valid',
		'pay-enter-amount.greater-than-zero': 'Le montant doit etre superieur a zero.',
		'pay-choose-method.description': 'Choisissez votre method de paiement',
		'pay-choose-method.cancel': 'Annuler',
		'pay-address.description': 'Scanner le QR code pour payer',
		'pay-address.timeout': 'Paiement na pas reussi',
		'pay-address.missing-payment-id': 'Le numero de paiement manque',
		'pay-address.cancel': 'Annuler',
		'pay-address.back': 'Change Le methode de paiement',
		'payment-history.title': 'L\'histoire des paiement effetcue',
		'payment-history.failed-to-get-payment-data': 'Telechargement des donnees des paiement a echoue',
		'payment-details.title': 'Details de paiement',
		'payment-details.confirmed': 'Confirmer',
		'payment-details.unconfirmed': 'Non confirmer',
		'payment-details.date': 'Date',
		'payment-details.amount': 'Montant',
		'payment-request.data.must-be-object': '"data" doit etre un objet.',
		'payment-confirmation.done': 'Terminer',
		'sample-addresses.label': 'Exemple d\'addresse:',
	};
})();
