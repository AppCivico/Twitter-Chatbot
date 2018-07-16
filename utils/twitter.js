const Request = require('request-promise');
const auth = require('../helpers/auth-other-user.js');

const twitter = {};

/**
 * Sends a Twitter Direct message
 * @param  data  object with userID(recipient) and politicianID(sender)
 * @param  message  the text message
 */
twitter.sendTextDM = async (data, message) => {
	await Request.post({
		url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
		oauth: auth.getAuth(data).twitter_oauth,
		headers: {
			'Content-type': 'application/json',
		},
		json: {
			event: {
				type: 'message_create',
				message_create: {
					target: {
						recipient_id: data.userID,
					},
					message_data: {
						text: message,
					},
				},
			},
		},
	}).then((body) => {
		console.log(`Sent message successfully to ${data.userName} => `, body.event.id);
	}).catch(async (body) => {
		console.log(`Couldn't send message to ${data.userName} => `, `${body}`);
	});
};

/**
 * Sends a Twitter Direct text message + quick_replies
 * @param  data  object with userID(recipient) and politicianID(sender)
 * @param  message  the text message
 * @param  quickReplies  quick_reply options array
 */
twitter.sendQuickReplyDM = async (data, message, quickReplies) => {
	await Request.post({
		url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
		oauth: auth.getAuth(data).twitter_oauth,
		headers: {
			'Content-type': 'application/json',
		},
		json: {
			event: {
				type: 'message_create',
				message_create: {
					target: {
						recipient_id: data.userID,
					},
					message_data: {
						text: message,
						quick_reply: {
							type: 'options',
							options: quickReplies,
						},
					},
				},
			},
		},
	}).then((body) => {
		console.log(`Sent message with quick_replies successfully to ${data.userName} => `, body.event.id);
	}).catch((body) => {
		console.log(`Couldn't send message to ${data.userName} => `, `${body}`);
	});
};

/**
 * Sends a Twitter Direct text message + quick_reply + button
 * @param  data  object with userID(recipient) and politicianID(sender)
 * @param  message  the text message
 * @param  quickReplies  quick_reply options array
 * @param  buttons  buttons array
 */
twitter.sendButton = async (data, message, quickReplies, buttons) => {
	await Request.post({
		url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
		oauth: auth.getAuth(data).twitter_oauth,
		headers: {
			'Content-type': 'application/json',
		},
		json: {
			event: {
				type: 'message_create',
				message_create: {
					target: {
						recipient_id: data.userID,
					},
					message_data: {
						text: message,
						ctas: buttons,
						quick_reply: {
							type: 'options',
							options: quickReplies,
						},
					},
				},
			},
		},
	}).then((body) => {
		console.log(`Sent message with quick_replies successfully to ${data.userName} => `, body.event.id);
	}).catch((body) => {
		console.log(`Couldn't send message to ${data.userName} => `, `${body}`);
	});
};


module.exports = twitter;
