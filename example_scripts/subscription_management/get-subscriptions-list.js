const request = require('request-promise');
const auth = require('../../helpers/auth.js');
const args = require('../args.js');


auth.get_twitter_bearer_token().then((bearerToken) => {
	// request options
	const requestOptions = {
		url: `https://api.twitter.com/1.1/account_activity/all/${args.environment}/subscriptions/list.json`,
		auth: {
			bearer: bearerToken,
		},
	};
	console.log(requestOptions);
	request.get(requestOptions).then((body) => {
		console.log(body);
	});
});
