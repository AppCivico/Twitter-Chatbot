require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
// const TwitterStrategy = require('passport-twitter');
const uuid = require('uuid/v4');
const security = require('./helpers/security');
const auth = require('./helpers/auth');
const cacheRoute = require('./helpers/cache-route');
const socket = require('./helpers/socket');
const Request = require('request-promise');

// const config = require('./config');
// const Twit = require('twit');

// const T = new Twit(config.credencials);


const app = express();

app.set('port', (process.env.PORT || 5000));
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
}));

// start server
const server = app.listen(app.get('port'), () => {
	console.log('Node app is running on port', app.get('port'));
});

// initialize socket.io
socket.init(server);

// form parser middleware
const parseForm = bodyParser.urlencoded({ extended: false });


/**
 * Receives challenge response check (CRC)
 * */
app.get('/webhook/twitter', (request, response) => {
	const crcToken = request.query.crc_token;
	console.log('Vamos imprimir o:', crcToken);
	if (crcToken) {
		const hash = security.get_challenge_response(crcToken, auth.twitter_oauth.consumer_secret);

		response.status(200);
		response.send({
			response_token: `sha256=${hash}`,
		});
	} else {
		response.status(400);
		response.send('Error: crcToken missing from request.');
	}
});


/* *
 * Receives Account Acitivity events
 * */
app.post('/webhook/twitter', (request, response) => {
	if (request.body.direct_message_indicate_typing_events) {
		// console.log('Um usuário externo está digitando');
		// console.log(request.body);
	} else if (request.body.direct_message_events) {
		const recipientId = request.body.direct_message_events[0].message_create.target.recipient_id;
		const senderId = request.body.direct_message_events[0].message_create.sender_id;
		// filtering out events with less than two users
		if (Object.keys(request.body.users).length >= 2) {
			console.log('------------------------');
			console.log(`${recipientId} recebeu uma mensagem de ${senderId}`);

			const ourName = request.body.users[recipientId].name;
			const theirName = request.body.users[senderId].name;
			console.log(`${ourName} recebeu uma mensagem de ${theirName}`);

			const msgText = request.body.direct_message_events[0].message_create.message_data.text;
			// removing emojis from message text
			// .replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|
			// \uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');
			// msgText = msgText.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
			console.log(`A mensagem foi: ${msgText}`);

			// request options
			const requestOptions = {
				url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
				oauth: auth.twitter_oauth,
				headers: {
					'Content-type': 'application/json',
				},
				json: {
					event: {
						type: 'message_create',
						message_create: {
							target: {
								recipient_id: senderId,
							},
							message_data: {
								text: `Você me disse: ${msgText}`,
							},
						},
					},
				},
			};

			// POST request to create webhook config
			Request.post(requestOptions).then((body) => {
				console.log(body);
			}).catch((body) => {
				console.log(body);
			});
		}
		// console.log('\n\nNós recebemos isso:');
		// console.log(request.body);

		socket.io.emit(socket.activity_event, {
			internal_id: uuid(),
			event: request.body,
		});

		response.send('200 OK');
	}
});


/* *
 * Serves the home page
 * */
app.get('/', (request, response) => {
	response.render('index');
});

/**
 * Subscription management
 * */
app.get('/subscriptions', auth.basic, cacheRoute(1000), require('./routes/subscriptions'));

/**
 * Starts Twitter sign-in process for adding a user subscription
 * */
app.get('/subscriptions/add', passport.authenticate('twitter', {
	callbackURL: '/callbacks/addsub',
}));

/**
 * Starts Twitter sign-in process for removing a user subscription
 * */
app.get('/subscriptions/remove', passport.authenticate('twitter', {
	callbackURL: '/callbacks/removesub',
}));

/**
 * Webhook management routes
 * */
const webhookView = require('./routes/webhook');

app.get('/webhook', auth.basic, auth.csrf, webhookView.get_config);
app.post('/webhook/update', parseForm, auth.csrf, webhookView.update_config);
app.post('/webhook/validate', parseForm, auth.csrf, webhookView.validate_config);
app.post('/webhook/delete', parseForm, auth.csrf, webhookView.delete_config);

/**
 * Activity view
 * */
app.get('/activity', auth.basic, require('./routes/activity'));

/**
 * Handles Twitter sign-in OAuth1.0a callbacks
 * */
app.get(
	'/callbacks/:action', passport.authenticate('twitter', { failureRedirect: '/' }),
	require('./routes/sub-callbacks'),
);

