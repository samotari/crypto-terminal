'use strict';

var expect = require('chai').expect;
var manager = require('../manager');

var helpers = module.exports = {
	'#pay': {
		pressNumberPadKey: function(key) {
			var selector;
			if (key === 'backspace') {
				selector = '.number-pad .button.backspace';
			} else if (key === 'decimal') {
				selector = '.number-pad .button.decimal';
			} else {
				selector = '.number-pad .button[data-key="' + key + '"]';
			}
			return manager.page.click(selector);
		},
		checkValue: function(expectedValue) {
			return new Promise(function(resolve, reject) {
				manager.page.$eval('.amount-value', function(el) {
					return el.textContent;
				}).then(function(value) {
					try {
						expect(value).to.equal(expectedValue);
					} catch (error) {
						return reject(error);
					}
					resolve();
				}).catch(reject);
			});
		},
	},
	'#choose-payment-method': {
		selectPaymentMethod: function(name) {
			var selector = '.view.choose-payment-method .button.payment-method.' + name;
			return manager.page.click(selector);
		},
	},
	'#display-payment-address': {
	},
};
