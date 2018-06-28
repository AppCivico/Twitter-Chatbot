const options = require('./options');

module.exports = {
	metadata_trigger: 'aboutTrajectory',
	message_event: {
		event: {
			type: 'message_create',
			message_create: {
				target: {
					recipient_id: undefined,
				},
				message_data: {
					text: 'Quer saber mais?',
					quick_reply: {
						type: 'options',
						options: [
							options.contact,
							options.answerPoll,
							options.participate,
							options.news,
						],
					},
				},
			},
		},
	},
};

