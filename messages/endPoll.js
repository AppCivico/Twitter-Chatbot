const options = require('./options');

module.exports = {
	metadata_trigger: 'endPoll',
	message_event: {
		event: {
			type: 'message_create',
			message_create: {
				target: {
					recipient_id: undefined,
				},
				message_data: {
					text: 'E agora, como posso te ajudar?',
					quick_reply: {
						type: 'options',
						options: [
							options.aboutTrajectory,
							options.contact,
							options.participate,
						],
					},
				},
			},
		},
	},
};
