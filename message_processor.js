const twitter = require('./twitter');
const messages = require('./messages/messages');
// const Request = require('request-promise');


const mp = {};


// check if message came from a text or quick_reply
mp.checkType = (payload, users) => {
	const data = { // event data
		politicianID: payload.target.recipient_id,
		userID: payload.sender_id,
	};
	data.politicianName = users[data.politicianID].name;
	data.userName = users[data.userID].name;

	const msgText = payload.message_data.text;
	let metadata;
	// let message = `Você me disse: ${msgText}\nAcertei?`;
	if (payload.message_data.quick_reply_response) { // user sent quick_reply?
		metadata = payload.message_data.quick_reply_response.metadata; // eslint-disable-line
		console.log(`O botão ${metadata} foi pressionado`);
		// message = `Você clicou no botão "${msgText}". Acertei?`;
	} else { // user sent text?
		metadata = 'default_message';
		// twitter.sendDM(data, `Você me disse: ${msgText}\nAcertei?`);
	}

	console.log('------------------------');
	console.log(`${data.politicianID} recebeu uma mensagem de ${data.userID}`);
	console.log(`${data.politicianName} recebeu uma mensagem de ${data.userName}`);
	console.log(`A mensagem foi: ${msgText}`);
	const messageToSend = messages.get(metadata, data.userID, data.politicianID);
	mp.send_message(messageToSend);
};

/**
 * sends Direct Message with Twitter API
 * @param  msg  a valid message event to sent using POST direct_messages/events/new
 */
mp.send_message = (msg) => {
	twitter.send_direct_message(msg, (error, res, body) => { // eslint-disable-line no-unused-vars
		// console.log('Sent message successfully => ', body.event.id);
		console.dir(body);
		// console.log(`body => ${(body)}`);
		// console.log(`response => ${res}`);
		// console.log(`error => ${error}`);
	});
};


module.exports = mp;

// removing links from text message
// 	const msgText = payload.message_data.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
// removing emojis from message text
// .replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|
// \uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');

