require('dotenv').config();
const request = require('request-promise');
const commandLineArgs = require('command-line-args');
const auth = require('../../helpers/auth-other-user.js');
const quickReply = require('../../utils/options');
const maApi = require('../../utils/mandatoaberto_api');
const Articles = require('../../utils/articles');
const opt = require('../../utils/options');

let theList;
let requestOptions;

// This a helper cli script, pass the -t twitterUserID argument to change the welcome-message
// You can find the welcome_message settings to edit down below;
// What we are doing here:
// getting every welcome_message the user has and deleting them all
// getting the current rule and also deleting it
// then we can create a new welcome_message and a new rule using the last created welcome_message.id

// Sets up command line arguments for this helper script
const optionDefinitions = [
	{ name: 'twitterUserID', alias: 't', type: String },
];

const args = commandLineArgs(optionDefinitions);
const { twitterUserID } = args;

if (!twitterUserID) {
	console.log('You\'re missing the twitter UserID argument. Use -t <userID>'
		+ '\nYou can use http://gettwitterid.com/ to find out the id.');
	process.exit(-1);
}

let politicianData;
let trajectory;
let introduction;
// let pollData;
let greeting;
const data = {};

function checkMenu(opt2) { // eslint-disable-line no-inner-declarations
	let dialogs = opt2;
	if (!introduction) { dialogs = dialogs.filter(obj => obj.metadata !== 'aboutPolitician'); }
	if (!trajectory) { dialogs = dialogs.filter(obj => obj.metadata !== 'aboutTrajectory'); }
	// if (!pollData) { dialogs = dialogs.filter(obj => obj.metadata !== 'answerPoll'); }
	if (!politicianData.contact) { dialogs = dialogs.filter(obj => obj.metadata !== 'contact'); }
	// if (!politicianData.votolegal_integration.votolegal_username)
	// { dialogs = dialogs.filter(obj => obj.metadata !== 'participate'); }
	if (!politicianData.votolegal_integration) { dialogs = dialogs.filter(obj => obj.metadata !== 'participate'); }
	dialogs = dialogs.filter(obj => obj.metadata !== 'news');
	dialogs = dialogs.filter(obj => obj.metadata !== 'divulgate');
	dialogs.filter(obj => obj.metadata !== 'answerPoll');
	return dialogs;
}

async function loadData() {
	politicianData = await maApi.getPoliticianData('twitter', twitterUserID);
	data.oauthToken = politicianData.twitter_oauth_token;
	data.tokenSecret = politicianData.twitter_token_secret;
	let articles;
	if (politicianData.gender === 'F') { articles = Articles.feminine; } else { articles = Articles.masculine; }
	trajectory = await maApi.getAnswer(politicianData.user_id, 'trajectory');
	introduction = await maApi.getAnswer(politicianData.user_id, 'introduction');
	// pollData = await maApi.getPollData(pageID);

	if (politicianData.office.name === 'Outros' || politicianData.office.name === 'Candidato' || politicianData.office.name === 'Candidata') {
		opt.aboutPolitician.label = `Sobre ${articles.defined} líder`;
	} else {
		// unlike facebook, twitter allows for more than 20 chars at 'label'
		opt.aboutPolitician.label = `Sobre ${articles.defined} ${politicianData.office.name}`;
	}

	greeting = await politicianData.greeting.replace('${user.office.name}', politicianData.office.name); // eslint-disable-line no-template-curly-in-string
	greeting = await greeting.replace('${user.name}', politicianData.name); // eslint-disable-line no-template-curly-in-string
}

async function deleteMessages(list) { // eslint-disable-line no-unused-vars
	await list.forEach(async (message) => {
		console.log('Deleting => ', message.id);
		const options = {
			url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/destroy.json',
			oauth: auth.getAuth(data).twitter_oauth,
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
		oauth: auth.getAuth(data).twitter_oauth,
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
		oauth: auth.getAuth(data).twitter_oauth,
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
	await loadData();
	// Getting welcome_messages list --------------------------------------------
	requestOptions = {
		url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/list.json',
		oauth: auth.getAuth(data).twitter_oauth,
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
		oauth: auth.getAuth(data).twitter_oauth,
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

	const welcomeData = {
		text: `${greeting}\nUtilize os botões abaixo para interagir:`,
		quick_reply: {
			type: 'options',
			options: checkMenu([
				quickReply.aboutPolitician,
				quickReply.aboutTrajectory,
				quickReply.participate,
				quickReply.news,
			]),
		},
	};
	// creating a new welcome message --------------------------------------------
	requestOptions = {
		url: 'https://api.twitter.com/1.1/direct_messages/welcome_messages/new.json',
		oauth: auth.getAuth(data).twitter_oauth,
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
