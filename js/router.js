var app = app || {};

app.Router = (function() {

	return Backbone.Router.extend({

		routes: {
			'': 'init',
			'admin': 'admin'
		},

		init: function() {

			console.log('router.init');
		},

		admin: function() {

			console.log('router.admin');
		}

	});

})();
