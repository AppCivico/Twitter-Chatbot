const request = require('request-promise');
// const passport = require('passport');
const auth = require('../helpers/auth.js');

const subRequestOptions = {
	url: `https://api.twitter.com/1.1/account_activity/all/${auth.twitter_webhook_environment}/subscriptions.json`,
	oauth: auth.twitter_oauth,
	resolveWithFullResponse: true,
};

const actions = {};

actions.addsub = (user) => {
	subRequestOptions.oauth.token = user.access_token;
	subRequestOptions.oauth.token_secret = user.access_token_secret;

	return request.post(subRequestOptions);
};

actions.removesub = (user) => {
	subRequestOptions.oauth.token = user.access_token;
	subRequestOptions.oauth.token_secret = user.access_token_secret;

	return request.delete(subRequestOptions);
};


module.exports = (req, resp) => {
	if (actions[req.params.action]) {
		actions[req.params.action](req.user).then((response) => {
			console.log(response);
			const jsonResponse = {
				title: 'Success',
				message: 'Subscriptions successfully modified.',
				button: {
					title: 'Ok',
					url: '/subscriptions',
				},
			};
			resp.render('status', jsonResponse);
		}).catch((response) => {
			console.log(response);
			const jsonResponse = {
				title: 'Error',
				message: 'Subscriptions unable to be modified.',
				button: {
					title: 'Ok',
					url: '/subscriptions',
				},
			};
			if (response.error) {
				jsonResponse.message = JSON.parse(response.error).errors[0].message;
			}
			resp.status(500);
			resp.render('status', jsonResponse);
		});
	} else {
		const jsonResponse = {
			title: 'Error',
			message: `Action "${req.params.action}"" not defined.`,
			button: {
				title: 'Ok',
				url: '/subscriptions',
			},
		};
		resp.status(404);
		resp.render('status', jsonResponse);
	}
};
