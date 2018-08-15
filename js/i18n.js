var app = app || {};

app.i18n = (function() {

	'use strict';

	_.each(app.paymentMethods, function(paymentMethod, name) {
		_.each(paymentMethod.lang, function(object, locale) {
			_.each(object, function(text, key) {
				app.lang[locale][name + '.' + key] = text;
			});
		});
	});

	return {
		// Returns a localized language string for the given language string key.
		// `data` object is optional and allows find-and-replace in the language string.
		t: function(key, data) {
			var locale = this.getCurrentLocale();
			var defaultLocale = this.getDefaultLocale();
			var text;
			if (!!app.lang[locale] && app.lang[locale][key]) {
				// Try the configured language first.
				text = app.lang[locale][key];
			} else if (!!app.lang[defaultLocale] && !!app.lang[defaultLocale][key]) {
				// Try the default locale if missing the preferred language.
				text = app.lang[defaultLocale][key];
			} else {
				// Fallback to the language string key.
				text = key;
			}
			// Prepare the language text as a handlebars template.
			var template = Handlebars.compile(text);
			// Parse the template with the given data object.
			return template(data);
		},
		getCurrentLocale: function() {
			// Get the current locale from the settings.
			// Fallback to locale from the browser.
			return (app.settings && app.settings.get('locale')) || this.getLocaleFromBrowser() || null;
		},
		getLocaleFromBrowser: function() {
			if (!navigator.language) return null;
			if (navigator.language.indexOf('-') === -1) return navigator.language || null;
			return navigator.language.split('-')[0];
		},
		getDefaultLocale: function() {
			return app.config.defaultLocale;
		},
		getMissingTranslationsAll: function() {
			var locales = _.keys(app.lang);
			var defaultLocale = this.getDefaultLocale();
			var nonDefaultLocales = _.filter(locales, function(locale) {
				return locale !== defaultLocale;
			});
			return _.chain(nonDefaultLocales).map(function(locale) {
				return [locale, this.getMissingTranslations(locale)];
			}, this).object().value();
		},
		getMissingTranslations: function(locale) {
			var defaultLocale = this.getDefaultLocale();
			var keys = _.keys(app.lang[defaultLocale]);
			return _.chain(keys).filter(function(key) {
				return !app.lang[locale][key];
			}).map(function(key) {
				return [key, app.lang[defaultLocale][key]];
			}).object().value();
		},
	};

})();
