const request = require('request');
const auth = require('./helpers/auth-other-user.js');
const Request = require('request-promise');


const twitter = {};

/**
 * Sends a Twitter Direct message with POST direct_messages/events/new
 * @param  messageEvent  valid Direct Message event json
 * @param  callback  function to pass response to
 */
twitter.send_direct_message = (messageEvent, callback) => {
	console.log('sending message:', messageEvent.event.message_create.message_data);

	const requestOptions = {
		url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
		oauth: auth.getAuth(messageEvent.event.message_create.target.sender_id).twitter_oauth,
		json: true,
		headers: {
			'content-type': 'application/json',
		},
		body: messageEvent,
	};

	// POST request to send Direct Message
	request.post(requestOptions, (error, response, body) => {
		if (callback) {
			callback(error, response, body);
		}
	});
};

// sends one standard direct message
twitter.sendOneText = async (data, message) => {
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
						// quick_reply: {
						// 	type: 'options',
						// 	options: [
						// 		{
						// 			label: 'Azul',
						// 			metadata: 'pollOption1',
						// 		},
						// 		{
						// 			label: 'Vermelho',
						// 			metadata: 'pollOption2',
						// 		},
						// 		{
						// 			label: 'Vermelho',
						// 			metadata: 'pollOption2',
						// 		},
						// 	],
						// },
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

module.exports = twitter;
