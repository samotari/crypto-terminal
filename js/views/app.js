var app = app || {};

app.MainView = (function() {

	'use strict';

	return Backbone.View.extend({

		el: '#app',

		events: {
			'click #menu-toggle': 'toggleMenu'
		},

		initialize: function() {

			this.$menu = this.$('#menu');
		},

		toggleMenu: function() {

			this.$menu.toggle();
		}

	});

})();
