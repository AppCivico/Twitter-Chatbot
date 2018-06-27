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
					text: 'Nosso governador veio de origens humildes e agora é a pessoa mais rica do Brasil.',
					quick_reply: {
						type: 'options',
						options: [
							{
								label: 'Dê sua opnião',
								description: 'Responda nossa pergunta',
								metadata: 'answerPoll',
							},
							{
								label: 'Contato',
								description: 'Entre em contato com ele',
								metadata: 'contact',
							},
						],
					},
				},
			},
		},
	},
};

