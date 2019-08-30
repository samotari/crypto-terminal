'use strict';

var expect = require('chai').expect;
var manager = require('../manager');

module.exports = {
	'#pay': {
		setAmount: function(amount, done) {
			manager.evaluateInPageContext(function(amount) {
				app.mainView.currentView.view.setAmount(amount);
			}, [amount], done);
		},
		continue: function(done) {
			manager.page.click('.button.continue').then(function() {
				done();
			}).catch(done);
		},
		pressNumberPadKey: function(key) {
			var selector;
			if (key === 'backspace') {
				selector = '.number-pad .button.backspace';
			} else if (key === 'decimal') {
				selector = '.number-pad .button.decimal';
			} else {
				selector = '.number-pad .button[data-key="' + key + '"]';
			}
			return manager.page.waitFor(selector).then(function() {
				return manager.page.click(selector);
			});
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
};
