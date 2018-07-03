const request = require('request-promise');
const auth = require('../../helpers/auth.js');
const args = require('../args.js');


// request options
const requestOptions = {
	url: `https://api.twitter.com/1.1/account_activity/all/${args.environment}/webhooks.json`,
	oauth: auth.twitter_oauth,
};


// GET request to retreive webhook config
request.get(requestOptions, (error, response, body) => {
	console.log(body);
});
