const nconf = require('nconf');
const request = require('request');
const queryString = require('query-string');
const passport = require('passport');
const TwitterStrategy = require('passport-twitter');
const httpAuth = require('http-auth');

// this is used only for autheticating the app owner
// load config
nconf.file({ file: 'config.json' }).env();

const auth = {};

function getAuth(userID) {
// twitter info

	if (userID === nconf.get('OTHER_USER1_ID')) {
		auth.twitter_oauth = {
			consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
			consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
			token: nconf.get('OTHER_USER1_TOKEN'),
			token_secret: nconf.get('OTHER_USER1_SECRET'),
		};
	} else {
		auth.twitter_oauth = {
			consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
			consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
			token: nconf.get('TWITTER_ACCESS_TOKEN'),
			token_secret: nconf.get('TWITTER_ACCESS_TOKEN_SECRET'),
		};
	}
	auth.twitter_webhook_environment = nconf.get('TWITTER_WEBHOOK_ENV');

	// basic auth middleware for express
	auth.basic = httpAuth.connect(httpAuth.basic({
		realm: 'admin-dashboard',
	}, (username, password, callback) => {
		callback(username === nconf.get('BASIC_AUTH_USER') && password === nconf.get('BASIC_AUTH_PASSWORD'));
	}));

	// csrf protection middleware for express
	// auth.csrf = require('csurf')();


	// Configure the Twitter strategy for use by Passport.
	passport.use(new TwitterStrategy(
		{
			consumerKey: auth.twitter_oauth.consumer_key,
			consumerSecret: auth.twitter_oauth.consumer_secret,
			// we want force login, so we set the URL with the force_login=true
			userAuthorizationURL: 'https://api.twitter.com/oauth/authenticate?force_login=true',
		},
		// stores profile and tokens in the sesion user object
		// this may not be the best solution for your application
		((token, tokenSecret, profile, cb) => cb(null, {
			profile,
			access_token: token,
			access_token_secret: tokenSecret,
		})),
	));

	// Configure Passport authenticated session persistence.
	passport.serializeUser((user, cb) => {
		cb(null, user);
	});

	passport.deserializeUser((obj, cb) => {
		cb(null, obj);
	});

	/**
 * Retrieves a Twitter Sign-in auth URL for OAuth1.0a
 */
	auth.get_twitter_auth_url = (host, callbackction) => {
	// construct request to retrieve authorization token
		const requestOptions = {
			url: 'https://api.twitter.com/oauth/request_token',
			method: 'POST',
			oauth: {
				callback: `https://${host}/callbacks/twitter/${callbackction}`,
				consumer_key: auth.twitter_oauth.consumer_key,
				consumer_secret: auth.twitter_oauth.consumer_secret,
			},
		};

		return new Promise(((resolve, reject) => {
			request(requestOptions, (error, response) => {
				if (error) {
					reject(error);
				} else {
				// construct sign-in URL from returned authorization token
					const responseParams = queryString.parse(response.body);
					console.log(responseParams);
					const twitterAuthUrl = `https://api.twitter.com/oauth/authenticate?force_login=true&oauth_token=${responseParams.oauth_token}`;

					resolve({
						responseParams,
						twitterAuthUrl,
					});
				}
			});
		}));
	};

	/**
 * Retrieves a bearer token for OAuth2
 */
	auth.get_twitter_bearer_token = () => {
	// just return the bearer token if we already have one
		if (auth.twitter_bearer_token) {
		// return new Promise(((resolve, reject) => {
			return new Promise(((resolve) => {
				resolve(auth.twitter_bearer_token);
			}));
		}

		// construct request for bearer token
		const requestOptions = {
			url: 'https://api.twitter.com/oauth2/token',
			method: 'POST',
			auth: {
				user: auth.twitter_oauth.consumer_key,
				pass: auth.twitter_oauth.consumer_secret,
			},
			form: {
				grant_type: 'client_credentials',
			},
		};

		return new Promise(((resolve, reject) => {
			request(requestOptions, (error, response) => {
				if (error) {
					reject(error);
				} else {
					const jsonBody = JSON.parse(response.body);
					console.log('Bearer Token:', jsonBody.access_token);
					auth.twitter_bearer_token = jsonBody.access_token;
					resolve(auth.twitter_bearer_token);
				}
			});
		}));
	};

	return auth;
}
module.exports.getAuth = getAuth;
