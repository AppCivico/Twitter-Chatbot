const request = require('request-promise');
const auth = require('../helpers/auth.js');


module.exports = (req, response) => {
	let savedBearerToken;
	let jsonResponse;

	// get list of subs
	auth.get_twitter_bearer_token().then((bearerToken) => {
		savedBearerToken = bearerToken;
		const requestOptions = {
			url: `https://api.twitter.com/1.1/account_activity/all/${auth.twitter_webhook_environment}/subscriptions/list.json`,
			auth: {
				bearer: savedBearerToken,
			},
		};

		return request.get(requestOptions);
	})

		// hydrate user objects from IDs
		.then((body) => {
			jsonResponse = JSON.parse(body);
			const jsonBody = jsonResponse;

			// if no subs, render as is and skip user hydration
			if (!jsonBody.subscriptions.length) {
				response.render('subscriptions', jsonBody);
				return Promise.resolve();
			}

			// construct comma delimited list of user IDs for user hydration
			let userId;
			jsonBody.subscriptions.forEach((sub) => {
				if (userId) {
					userId = `${userId},${sub.user_id}`;
				} else {
					userId = sub.user_id;
				}
			});

			const requestOptions = {
				url: `https://api.twitter.com/1.1/users/lookup.json?user_id=${userId}`,
				auth: {
					bearer: savedBearerToken,
				},
			};

			return request.get(requestOptions);
		})

		// replace the subscriptions list with list of user objects
		// and render list
		.then((body) => {
			// only render if we didn't skip user hydration
			if (body) {
				jsonResponse.subscriptions = JSON.parse(body);
				response.render('subscriptions', jsonResponse);
			}
		})

		.catch((body) => {
			console.log(body);

			const jsonResponse2 = {
				title: 'Error',
				message: 'Subscriptions could not be retrieved.',
				button: {
					title: 'Ok',
					url: '/',
				},
			};

			resp.status(500); // eslint-disable-line no-undef
			resp.render('status', jsonResponse2); // eslint-disable-line no-undef
		});
};
