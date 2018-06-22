const request = require('request-promise');
const queryString = require('query-string');
const prompt = require('prompt-promise');
const auth = require('../../helpers/auth.js');
const args = require('../args.js');


// request options to start PIN-based Twitter sign-in process
const requestTokenResponseOptions = {
	url: 'https://api.twitter.com/oauth/request_token?oauth_callback=oob',
	oauth: auth.twitter_oauth,
};

let requestTokenResponse;

// generates URL for login and prompts for PIN
request.get(requestTokenResponseOptions).then((body) => {
	requestTokenResponse = queryString.parse(body);

	console.log('Open this URL in a browser and sign-in with the Twitter account you wish to subscribe to:');
	console.log(`https://api.twitter.com/oauth/authorize?oauth_token=${requestTokenResponse.oauth_token}&force_login=true`);

	return prompt('Enter the generated PIN:');
})

// validates PIN and generates access tokens
	.then((promptReponse) => {
		prompt.end();

		const accessTokenRequestOptions = {
			url: `https://api.twitter.com/oauth/access_token?oauth_verifier=${promptReponse}`,
			oauth: {
				consumer_key: auth.twitter_oauth.consumer_key,
				consumer_secret: auth.twitter_oauth.consumer_secret,
				token: requestTokenResponse.oauth_token,
				token_secret: requestTokenResponse.oauth_token_secret,
			},
		};

		return request.get(accessTokenRequestOptions);
	})

// adds subscription for user
	.then((body) => {
		const accessTokens = queryString.parse(body);

		const subscriptionRequestOptions = {
			url: `https://api.twitter.com/1.1/account_activity/all/${args.environment}/subscriptions.json`,
			oauth: {
				consumer_key: auth.twitter_oauth.consumer_key,
				consumer_secret: auth.twitter_oauth.consumer_secret,
				token: accessTokens.oauth_token,
				token_secret: accessTokens.oauth_token_secret,
			},
			resolveWithFullResponse: true,
		};

		return request.post(subscriptionRequestOptions);
	})

// add subscription success
	.then((response) => {
		console.log('HTTP response code:', response.statusCode);

		if (response.statusCode === 204) {
			console.log('Subscription added.');
		}
	})

// add subscrition error
	.catch((response) => {
		console.log('Subscription was not able to be added.');
		console.log('- Verify environment name.');
		console.log('- Verify correct PIN was used.');
		console.log('- Verify "Read, Write and Access direct messages" is enabled on apps.twitter.com.');
		console.log('Full error message below:');
		console.log(response);
	});
