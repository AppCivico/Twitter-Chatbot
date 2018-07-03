const request = require('request-promise');
const auth = require('../helpers/auth.js');


const webhook = {};

/**
 * Helper function that deletes the webhook config.
 * Returns a promise.
 */
function deleteWebhook(webhookId) {
	return new Promise(((resolve, reject) => {
		// if no webhook id provided, assume there is none to delete
		if (!webhookId) {
			resolve();
			return;
		}

		// construct request to delete webhook config
		const requestOptions = {
			url: `https://api.twitter.com/1.1/account_activity/all/${auth.twitter_webhook_environment}/webhooks/${webhookId}.json`,
			oauth: auth.twitter_oauth,
			resolveWithFullResponse: true,
		};

		request.delete(requestOptions).then(() => {
			resolve();
		}).catch(() => {
			reject();
		});
	}));
}

/**
 * Retrieves existing webhook config and renders
 */
webhook.get_config = (req, resp) => {
	// construct request to retrieve webhook config
	const requestOptions = {
		url: `https://api.twitter.com/1.1/account_activity/all/${auth.twitter_webhook_environment}/webhooks.json`,
		oauth: auth.twitter_oauth,
	};

	request.get(requestOptions)

	// success
		.then((body) => {
			const jsonResponse = {
				configs: JSON.parse(body),
				csrf_token: req.csrfToken(),
				update_webhook_url: `https://${req.headers.host}/webhook/twitter`,
			};

			if (jsonResponse.configs.length) {
				jsonResponse.update_webhook_url = jsonResponse.configs[0].url;
			}

			console.log(jsonResponse);
			resp.render('webhook', jsonResponse);
		})

	// failure
		.catch((body) => {
			if (body) {
				console.log(body);
			}
			const jsonResponse = {
				title: 'Error',
				message: 'Webhook config unable to be retrieved',
				button: {
					title: 'Ok',
					url: '/webhook',
				},
			};

			resp.status(500);
			resp.render('status', jsonResponse);
		});
};


/**
 * Triggers challenge response check
 */
webhook.validate_config = (req, resp) => {
	// get bearer token
	auth.get_twitter_bearer_token()

	// validate webhook config
		.then((bearerToken) => {
			// request options
			const requestOptions = {
				url: `https://api.twitter.com/1.1/account_activity/all/${auth.twitter_webhook_environment}/webhooks/${req.body.webhook_id}.json`,
				resolveWithFullResponse: true,
				auth: {
					bearer: bearerToken,
				},
			};

			// PUT request to retreive webhook config
			request.put(requestOptions)

			// success
				.then(() => { // response
					const jsonResponse = {
						title: 'Success',
						message: 'Challenge request successful and webhook status set to valid.',
						button: {
							title: 'Ok',
							url: '/webhook',
						},
					};

					resp.render('status', jsonResponse);
				})

			// failure
				.catch((response) => {
					const jsonResponse = {
						title: 'Error',
						message: response.error,
						button: {
							title: 'Ok',
							url: '/webhook',
						},
					};

					resp.render('status', jsonResponse);
				});
		});
};


/**
 * Deletes exiting webhook config
 * then creates new webhook config
 */
webhook.update_config = (req, resp) => {
	// delete webhook config
	deleteWebhook(req.body.webhook_id)

	// create new webhook config
		.then(() => {
			const requestOptions = {
				url: `https://api.twitter.com/1.1/account_activity/all/${auth.twitter_webhook_environment}/webhooks.json`,
				oauth: auth.twitter_oauth,
				headers: {
					'Content-type': 'application/x-www-form-urlencoded',
				},
				form: {
					url: req.body.url,
				},
			};

			return request.post(requestOptions);
		})

	// render success response
		.then(() => { // body
			const jsonResponse = {
				title: 'Success',
				message: 'Webhook successfully updated.',
				button: {
					title: 'Ok',
					url: '/webhook',
				},
			};

			resp.render('status', jsonResponse);
		})

	// render error response
		.catch((body) => {
			const jsonResponse = {
				title: 'Error',
				message: 'Webhook not updated.',
				button: {
					title: 'Ok',
					url: '/webhook',
				},
			};
			console.log(body);
			// Look for detailed error
			if (body.error) {
				jsonResponse.message = JSON.parse(body.error).errors[0].message;
			}

			resp.render('status', jsonResponse);
		});
};


/**
 * Deletes existing webhook config
 */
webhook.delete_config = (req, resp) => {
	// delete webhook config
	deleteWebhook(req.body.webhook_id)

	// render success response
		.then(() => { // body
			const jsonResponse = {
				title: 'Success',
				message: 'Webhook successfully deleted.',
				button: {
					title: 'Ok',
					url: '/webhook',
				},
			};

			resp.render('status', jsonResponse);
		})

	// render error response
		.catch(() => {
			const jsonResponse = {
				title: 'Error',
				message: 'Webhook was not deleted.',
				button: {
					title: 'Ok',
					url: '/webhook',
				},
			};

			resp.render('status', jsonResponse);
		});
};


module.exports = webhook;
