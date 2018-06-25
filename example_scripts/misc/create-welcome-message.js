require('dotenv').config();

const request = require('request-promise');
const auth = require('../../helpers/auth-other-user.js');

let theList;
let requestOptions;

// This one isn't a helper cli script but rather a file you run
// It's easier to edit the quick_reply data like this
const ourUsers = process.env.OUR_USERS.split(',');

const oauth = auth.getAuth(ourUsers[0]).twitter_oauth; // change the position value here manually


async function deleteMessages(list) { // eslint-disable-line no-unused-vars
	await list.welcome_messages.forEach(async (message) => {
		console.log('Deleting => ', message.id);
		const options = {
			url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/destroy.json',
			oauth,
			json: {
				id: message.id,
			},
		};

		await request.delete(options).then((response) => {
			console.log('Success! =>', response.statusCode);
		}).catch((response) => {
			console.log("Error. Couldn't delete! => ", response.message);
		});
	});
}
async function deleteRules(list) {
	// request options
	console.log('Deleting => ', list.welcome_message_rules[0].id);
	const options = {
		url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/rules/destroy.json',
		oauth,
		json: {
			id: list.welcome_message_rules[0].id,
		},
	};


	await request.delete(options).then((response) => {
		console.log('Success! =>', response.statusCode);
	}).catch((response) => {
		console.log("Error. Couldn't delete! => ", response.message);
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
		console.log('We created a new rule!');
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
		console.log('We got the messages list =>');
		// console.log(theList);
		if (theList.welcome_messages) {
			console.log("Let's delete it");
			// Deleting every welcome message!
			deleteMessages(theList);
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


	// creating a new welcome message --------------------------------------------
	requestOptions = {
		url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/new.json',
		oauth,
		headers: {
			'Content-type': 'application/json',
		},
		json: {
			welcome_message: {
				name: 'Nova Mensagem',
				message_data: {
					text: 'Olá! Bem vindo ao bot assistente do Senador Jordan2! O que acha?',
					quick_reply: {
						type: 'options',
						options: [
							{
								label: 'Legal',
								metadata: 'external_id_1',
							},
							{
								label: 'Muito Legal',
								metadata: 'external_id_2',
							},
						],
					},
				},
			},
		},
	};


	request.post(requestOptions).then((response) => {
		console.log('HTTP response code:', response.message);
		console.log('\nWe created a new message => ', response.welcome_message.id);
		createRule(response.welcome_message.id);
		if (response.statusCode === 204) {
			console.log('Subscription exists for user.');
		}
	}).catch((response) => {
		console.log("Couldn't create new message => ", response.message);
	});
}

createMessage();
