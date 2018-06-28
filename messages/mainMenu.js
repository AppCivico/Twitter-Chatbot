const options = require('./options');


module.exports = {
	metadata_trigger: 'mainMenu',
	message_event: {
		event: {
			type: 'message_create',
			message_create: {
				target: {
					recipient_id: undefined,
				},
				message_data: {
					text: 'Como posso te ajudar?',
					quick_reply: {
						type: 'options',
						options: [
							options.aboutPolitician,
							options.aboutTrajectory,
							options.answerPoll,
							options.participate,
						],
					},
				},
			},
		},
	},
};

