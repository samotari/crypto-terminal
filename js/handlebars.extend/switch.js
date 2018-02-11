(function() {

	'use strict';

	Handlebars.registerHelper('switch', function(value, options) {
		this._switch_value_ = value;
		this._switch_break_ = false;
		var html = options.fn(this);
		delete this._switch_break_;
		delete this._switch_value_;
		return html;
	});

	Handlebars.registerHelper('case', function(value, options) {
		var args = Array.prototype.slice.call(arguments);
		options	= args.pop();
		var caseValues = args;
		if (this._switch_break_ || caseValues.indexOf(this._switch_value_) === -1) {
			return '';
		}
		if (options.hash.break === true) {
			this._switch_break_ = true;
		}
		return options.fn(this);
	});

	Handlebars.registerHelper('default', function(options) {
		if (!this._switch_break_) {
			return options.fn(this);
		}
	});

})();
