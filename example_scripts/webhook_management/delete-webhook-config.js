const request = require('request-promise');
const auth = require('../../helpers/auth.js');
const args = require('../args.js');


// request options
let requestOptions = {
	url: `https://api.twitter.com/1.1/account_activity/all/${args.environment}/webhooks.json`,
	oauth: auth.twitter_oauth,
};


// GET request to retreive webhook config
request.get(requestOptions).then((body) => {
	// parse webhook ID
	const webhookId = JSON.parse(body)[0].id;

	console.log('Deleting webhook config:', webhookId);

	// update request options for delete endpoint
	requestOptions = {
		url: `https://api.twitter.com/1.1/account_activity/all/${args.environment}/webhooks/${webhookId}.json`,
		oauth: auth.twitter_oauth,
		resolveWithFullResponse: true,
	};

	// DELETE request to delete webhook config
	return request.delete(requestOptions);
}).then((response) => {
	console.log('HTTP response code:', response.statusCode);

	if (response.statusCode === 204) {
		console.log('Webhook config deleted.');
	}
}).catch((response) => {
	console.log('HTTP response code:', response.statusCode);
	console.log('Error deleting webhook config.');
});
