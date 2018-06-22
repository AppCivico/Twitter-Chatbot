const request = require('request-promise');
const auth = require('../../helpers/auth.js');


auth.get_twitter_bearer_token().then((bearerToken) => {
	// request options
	const requestOptions = {
		url: 'https://api.twitter.com/1.1/account_activity/all/count.json',
		auth: {
			bearer: bearerToken,
		},
	};

	request.get(requestOptions).then((body) => {
		console.log(body);
	});
});

