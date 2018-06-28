const options = require('./options');

module.exports = {

	// this message is used if the bot can't find a response
	default_message: {
		event: {
			type: 'message_create',
			message_create: {
				target: {
					recipient_id: undefined,
				},
				message_data: {
					text: 'Perdão. Não entendo texto ainda, clique nos botões abaixo para interagir comigo.',
					// ctas: [
					// 	{
					// 		type: 'web_url',
					// 		label: 'Open a link',
					// 		url: 'www.google.com',
					// 	},
					// ],
					quick_reply: {
						type: 'options',
						options: [
							options.aboutPolitician,
							options.aboutTrajectory,
							options.participate,
						],
					},
				},
			},
		},
	},

	// all message responses
	// Usage: Just keep adding the files in folder and their names here
	messages_files: [
		'endPoll',
		'aboutPolitician',
		'aboutTrajectory',
		'answerPoll',
		'contact',
		'mainMenu',
	],
};

