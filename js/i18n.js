var app = app || {};

app.i18n = (function() {

	'use strict';

	return {
		// Returns a localized language string for the given language string key.
		// `data` object is optional and allows find-and-replace in the language string.
		t: function(key, data) {
			// Get the current locale from the settings.
			var locale = app.settings.get('locale');
			var text;
			if (!!app.lang[locale] && app.lang[locale][key]) {
				// Try the configured language first.
				text = app.lang[locale][key];
			} else if (!!app.lang['en'] && !!app.lang['en'][key]) {
				// Try english if missing the preferred language.
				text = app.lang['en'][key];
			} else {
				// Fallback to the language string key.
				text = key;
			}
			// Prepare the language text as a handlebars template.
			var template = Handlebars.compile(text);
			// Parse the template with the given data object.
			return template(data);
		}
	};

})();
