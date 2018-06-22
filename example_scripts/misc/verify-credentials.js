const request = require('request-promise');
const auth = require('../../helpers/auth.js');


// request options
const request_options = {
	url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
	oauth: auth.twitter_oauth,
};

// get current user info
request.get(request_options, (error, response, body) => {
	if (error) {
		console.log('Error retrieving user data.');
		console.log(error);
		return;
	}

	console.log(body);
});
