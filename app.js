require('dotenv').config();
// const TwitterStrategy = require('passport-twitter');
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const passport = require('passport');
const uuid = require('uuid/v4');
const security = require('./helpers/security');
const auth = require('./helpers/auth');
const cacheRoute = require('./helpers/cache-route');
const socket = require('./helpers/socket');

const app = express();
// let msgToIgnore;

const mp = require('./message_processor');

app.set('port', (process.env.PORT || 5000));
app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

const fileSessionOptions = {
	path: './.sessions',
};
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(session({
	secret: process.env.EXPRESS_SESSION_SECRET,
	resave: true,
	saveUninitialized: false,
	store: new FileStore(fileSessionOptions),
}));

// start server
const server = app.listen(app.get('port'), () => {
	console.log('Twitter App Owner =>', process.env.APP_OWNER);
	console.log('Node app is running on port => ', app.get('port'));
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
	console.log('crcToken:', crcToken);
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
app.post('/webhook/twitter', (req, response) => {
	if (req.session.age) {
		console.log(req.session.age);
	} else {
		req.session.age = 11;
	}
	// console.log(req.session);
	// console.log('\n\nNós recebemos isso:');
	// console.log(req.body);
	if (req.body.direct_message_indicate_typing_events) {
		// console.log('Um usuário externo está digitando');
	} else if (req.body.direct_message_events) {
		// const recipientId = req.body.direct_message_events[0].message_create.target.recipient_id;
		// const senderId = req.body.direct_message_events[0].message_create.sender_id;

		// if: event is not happening to the same user who started it
		if (req.body.direct_message_events[0].message_create.sender_id !== req.body.for_user_id) { // eslint-disable-line max-len
			mp.checkType(req.body.direct_message_events[0].message_create, req.body.users);
		}

		socket.io.emit(socket.activity_event, {
			internal_id: uuid(),
			event: req.body,
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
