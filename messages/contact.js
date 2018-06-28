const options = require('./options');


module.exports = {
	metadata_trigger: 'contact',
	message_event: {
		event: {
			type: 'message_create',
			message_create: {
				target: {
					recipient_id: undefined,
				},
				message_data: {
					text: 'Telefone: 13123123\nE-mail: exemplo@exemplo.com',
					quick_reply: {
						type: 'options',
						options: [
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

