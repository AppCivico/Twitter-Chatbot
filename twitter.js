const auth = require('./helpers/auth-other-user.js');
const Request = require('request-promise');


const twitter = {};

// const request = require('request');
// /**
//  * Sends a Twitter Direct message with POST direct_messages/events/new
//  * @param  messageEvent  valid Direct Message event json
//  * @param  callback  function to pass response to
//  */
// twitter.send_direct_message = (messageEvent, callback) => {
// 	console.log('sending message:', messageEvent.event.message_create.message_data);

// 	const requestOptions = {
// 		url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
// 		oauth: auth.getAuth(messageEvent.event.message_create.target.sender_id).twitter_oauth,
// 		json: true,
// 		headers: {
// 			'content-type': 'application/json',
// 		},
// 		body: messageEvent,
// 	};

// 	// POST request to send Direct Message
// 	request.post(requestOptions, (error, response, body) => {
// 		if (callback) {
// 			callback(error, response, body);
// 		}
// 	});
// };

/**
 * Sends a Twitter Direct message without relying on messages.js
 * @param  data  object with userID(recipient) and politicianID(sender)
 * @param  message  the text message
 */
twitter.sendTextDM = async (data, message) => {
	await Request.post({
		url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
		oauth: auth.getAuth(data.politicianID).twitter_oauth,
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
	}).catch((body) => {
		console.log(`Couldn't send message to ${data.userName} => `, `${body}`);
	});
};

/**
 * Sends a Twitter Direct message without relying on messages.js
 * @param  data  object with userID(recipient) and politicianID(sender)
 * @param  message  the text message
 * @param  options  quick_reply options array
 */
twitter.sendQuickReplyDM = async (data, message, options) => {
	await Request.post({
		url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
		oauth: auth.getAuth(data.politicianID).twitter_oauth,
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
							options,
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
