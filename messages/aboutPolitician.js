const options = require('./options');

module.exports = {
	metadata_trigger: 'aboutPolitician',
	message_event: {
		event: {
			type: 'message_create',
			message_create: {
				target: {
					recipient_id: undefined,
				},
				message_data: {
					text: 'O que mais deseja saber sobre o pré-candidato?',
					quick_reply: {
						type: 'options',
						options: [
							options.aboutTrajectory,
							options.contact,
							options.answerPoll,
							options.participate,
						],
					},
				},
			},
		},
	},
};

