const config = require('./config.js');

const messageEvents = [];
const messages = {};

/**
 * Adds a message
 * @param  msg  the message json object with metadata_trigger and message_event properties
 */
messages.add = (msg) => {
	if (messageEvents[msg.metadata_trigger]) {
		console.log('Message already added for trigger:');
		throw msg.metadata_trigger;
	}

	messageEvents[msg.metadata_trigger] = msg.message_event;
};

/**
 * Retrieves a message and sets the recipient_id
 * @param  metadataTrigger  the metadata string attached to a message the will trigger the message
 * @param  userID  the user ID the message will be sent to
 * @param  userID  the politician ID the message will be sent from
 * @return json
 */
messages.get = (metadataTrigger, userID, politicianID) => {
	let msg = config.default_message;
	if (messageEvents[metadataTrigger]) {
		msg = messageEvents[metadataTrigger];
	}
	msg.event.message_create.target.recipient_id = userID;
	msg.event.message_create.target.sender_id = politicianID;
	return msg;
};

// Add all message files
config.messages_files.forEach((fileName) => {
	messages.add(require(`./${fileName}.js`)); //eslint-disable-line 
});

//  Add default message
messages.add({
	metadata_trigge: 'default_message',
	message_event: config.default_message,
});


module.exports = messages;
