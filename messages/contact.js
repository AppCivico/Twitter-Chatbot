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
							{
								label: 'Participar',
								description: 'Participe de nossa campanha',
								metadata: 'answerPoll',
							},
						],
					},
				},
			},
		},
	},
};

