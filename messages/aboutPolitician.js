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
					text: 'Nosso governador já fez muito por São Paulo e pretende continuar lutando.',
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

