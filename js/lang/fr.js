var app = app || {};

app.lang = app.lang || {};

app.lang['fr'] = (function() {
	return {
		'language.cs': 'Czech',
		'language.en': 'English',
		'language.es': 'Spanish',
		'language.fr': 'Français',
		'main.message.status.0': 'Erreur: il n\'y a pas de réseau',
		'menu.new-payment': 'Nouveau Paiement',
		'menu.settings': 'Parametres',
		'menu.payment-history': 'Histoire des paiements',
		'settings.title': 'Paramètres titre',
		'settings.general.label': 'Parametres Générales',
		'settings.display-currency.label': 'Montrer le Monnaie',
		'settings.date-format.label': 'Forme de Date ',
		'settings.accept-crypto-currencies.label': 'Quel type de monnaie vous voulez?',
		'settings.at-least-one-crypto-currency-required': 'Veuillez configurez un monnaie crypto',
		'settings.field-required': '{{label}} est requis',
		'form.save-success': 'Enregistrement réussi!',
		'form.save': 'Enregistrer',
		'pay-enter-amount.description': 'Entrez le montant à payer',
		'pay-enter-amount.continue': 'Continuer',
		'pay-enter-amount.valid-number': 'Le montant doit être un numero valide',
		'pay-enter-amount.greater-than-zero': 'Le montant doit être superieur a zero.',
		'pay-choose-method.description': 'Choisissez votre method de paiement',
		'pay-choose-method.cancel': 'Annuler',
		'pay-address.description': 'Scanner le QR code pour payer',
		'pay-address.timeout': 'Paiement n\'a pas reussi',
		'pay-address.missing-payment-id': 'Le numero de paiement manque',
		'pay-address.cancel': 'Annuler',
		'pay-address.back': 'Change Le methode de paiement',
		'payment-history.title': 'L\'histoire des paiement effetcue',
		'payment-history.failed-to-get-payment-data': 'Téléchargement des données de paiement a échoué',
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
