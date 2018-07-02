require('dotenv').config();

const request = require('request-promise');
const auth = require('../../helpers/auth-other-user.js');
const quickReply = require('../../utils/options');
const maApi = require('../../mandatoaberto_api');

const pageID = process.env.PAGE_1_ID;

let theList;
let requestOptions;

// This one isn't a helper cli script but rather a file you run after changing the settings
// You can find the welcome_message settings to edit down below;
// What we are doing here:
// getting every welcome_message the user has and deleting them all
// getting the current rule and also deleting it
// then we can create a new welcome_message and a new rule using the last created welcome_message.id


const ourUsers = process.env.OUR_USERS.split(',');

// change the position value here manually => ourUsers[0], ourUsers[1] etc
const oauth = auth.getAuth(ourUsers[1]).twitter_oauth;

async function deleteMessages(list) { // eslint-disable-line no-unused-vars
	await list.forEach(async (message) => {
		console.log('Deleting => ', message.id);
		const options = {
			url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/destroy.json',
			oauth,
			qs: {
				id: message.id,
			},
		};

		await request.delete(options).then(() => {
			console.log('Success! => ', message.id);
		}).catch((response) => {
			console.log(`Error. Couldn't delete! ${message.id} => `, response.message);
		});
	});
}
async function deleteRules(list) {
	// request options
	console.log('Deleting => ', list.welcome_message_rules[0].id);
	const options = {
		url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/rules/destroy.json',
		oauth,
		qs: {
			id: list.welcome_message_rules[0].id,
		},
	};


	await request.delete(options).then(() => {
		console.log('Success! => ', list.welcome_message_rules[0].id);
	}).catch((response) => {
		console.log(`Error. Couldn't delete! ${list.welcome_message_rules[0].id} => `, response.message);
	});
}

async function createRule(id) {
	const options = {
		url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/rules/new.json',
		oauth,
		headers: {
			'Content-type': 'application/json',
		},
		json: {
			welcome_message_rule: {
				welcome_message_id: id,
			},
		},
	};

	request.post(options).then(() => {
		console.log('We created a new rule! This last created message is the new active message');
	}).catch((response) => {
		console.log("Error. Couldn't create new rule! Try again! =>", response.message);
	});
}


async function createMessage() {
	// Getting welcome_messages list --------------------------------------------
	requestOptions = {
		url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/list.json',
		oauth,
		headers: {
			'Content-type': 'application/json',
		},
	};
	await request.get(requestOptions).then((response) => {
		// console.log('HTTP response code:', response);
		theList = JSON.parse(response);
		if (theList.welcome_messages) {
			console.log('We got the messages list =>');
			console.log(theList);
			console.log("Let's delete it");
			// Deleting every welcome message!
			deleteMessages(theList.welcome_messages);
		} else {
			console.log('There are no messages to delete!');
		}
	}).catch((response) => {
		console.log("Couldn't get message list =>", response.message);
	});

	// Getting rules list --------------------------------------------
	requestOptions = {
		url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/rules/list.json',
		oauth,
		headers: {
			'Content-type': 'application/json',
		},
	};


	await request.get(requestOptions).then((response) => {
		// console.log('HTTP response code:', response);
		theList = JSON.parse(response);
		console.log('We got the rules list =>', theList);
		if (theList.welcome_message_rules) {
			console.log("Let's delete it");
			deleteRules(theList);
		}
	}).catch((response) => {
		console.log("Couldn't get rules list =>", response.message);
	});


	const politicianData = await maApi.getPoliticianData(pageID);
	let greeting = await politicianData.greeting.replace('${user.office.name}', politicianData.office.name); // eslint-disable-line no-template-curly-in-string
	greeting = await greeting.replace('${user.name}', politicianData.name); // eslint-disable-line no-template-curly-in-string

	const welcomeData = {
		text: greeting,
		quick_reply: {
			type: 'options',
			options: [
				quickReply.aboutPolitician,
				quickReply.aboutTrajectory,
				quickReply.participate,
				quickReply.news,
			],
		},
	};
	// creating a new welcome message --------------------------------------------
	requestOptions = {
		url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/new.json',
		oauth,
		headers: {
			'Content-type': 'application/json',
		},
		json: {
			welcome_message: { // edit here to change welcome_message settings
				name: 'Nova Mensagem',
				message_data: welcomeData,
			},
		},
	};


	request.post(requestOptions).then((response) => {
		console.log('\nWe created a new message => ', response.welcome_message.id);
		createRule(response.welcome_message.id);
	}).catch((response) => {
		console.log("Couldn't create new message => ", response.message);
	});
}

createMessage();
