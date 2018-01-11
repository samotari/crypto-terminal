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
			// Get the current locale from the settings.
			var locale = app.settings.get('locale');
			var defaultLocale = app.config.defaultLocale;
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
		getMissingAll: function() {
			var locales = _.keys(app.lang);
			var nonDefaultLocales = _.filter(locales, function(locale) {
				return locale !== app.config.defaultLocale;
			});
			return _.object(_.map(nonDefaultLocales, function(locale) {
				var missingKeys = _.filter(_.keys(app.lang[app.config.defaultLocale]), function(key) {
					return !app.lang[locale][key];
				});
				return [locale, missingKeys];
			}));
		}
	};

})();
