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
							{
								label: 'Trajetória',
								description: 'Veja como ele chegou até aqui',
								metadata: 'aboutTrajectory',
							},
							{
								label: 'Dê sua opinião',
								description: 'Responda nossa pergunta',
								metadata: 'answerPoll',
							},
						],
					},
				},
			},
		},
	},
};

