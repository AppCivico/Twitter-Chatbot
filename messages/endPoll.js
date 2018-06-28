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
					text: 'Agradecemos sua participação. \nComo posso te ajudar?',
					quick_reply: {
						type: 'options',
						options: [
							{
								label: 'Trajetória',
								description: 'Veja como ele chegou até aqui',
								metadata: 'aboutTrajectory',
							},
							{
								label: 'Contato',
								description: 'Entre em contato conosco',
								metadata: 'contact',
							},
							{
								label: 'Participar',
								description: 'Participe de nossa campanha',
								metadata: 'participate',
							},
						],
					},
				},
			},
		},
	},
};

