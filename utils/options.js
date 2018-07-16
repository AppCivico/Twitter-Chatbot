module.exports = {
	// quick_reply
	aboutPolitician: {
		label: 'Sobre o Candidato',
		description: 'Saiba mais sobre o Candidato',
		metadata: 'aboutPolitician', // default value, should be replaced
	},
	aboutTrajectory: {
		label: 'Trajetória',
		description: 'Veja como o Candidato chegou até aqui',
		metadata: 'aboutTrajectory',
	},
	answerPoll: {
		label: 'Dê sua opinião',
		description: 'Responda nossa pergunta',
		metadata: 'answerPoll',
	},
	contact: {
		label: 'Contato',
		description: 'Entre em contato com o Candidato',
		metadata: 'contact',
	},
	participate: {
		label: 'Participar',
		description: 'Participe de nossa campanha',
		metadata: 'participate',
	},
	news: {
		label: 'Novidades',
		description: 'Veja nossas novidades',
		metadata: 'news',
	},
	donate: {
		label: 'Quero doar',
		description: 'Doe utilizando a plataforma VotoLegal',
		metadata: 'donate',
	},
	divulgate: {
		label: 'Quero divulgar',
		description: 'Mostre o seu apoio para o mundo',
		metadata: 'divulgate',
	},
	goBack: {
		label: 'Voltar',
		description: 'Sem pressão',
		metadata: 'goBack',
	},
	letsGo: {
		label: 'Vamos lá!',
		// description: undefined,
		metadata: 'recipientData',
	},
	notNow: {
		label: 'Agora não',
		// description: undefined,
		metadata: 'goBack',
	},
	// button
	// undefined -> will be filled later with dynamic values
	donateButton: {
		type: 'web_url',
		label: 'Vamos lá!',
		url: undefined, // https://votolegal.com.br
	},
	divulgateTweet: {
		type: 'web_url',
		label: 'Tweetando',
		url: undefined, // 'https://twitter.com/intent/tweet?in_reply_to=463440424141459456&lang=pt'
	},
	divulgateRetweet: {
		type: 'web_url',
		label: 'Retweetando',
		url: undefined, // 'https://twitter.com/intent/retweet?tweet_id=463440424141459456&lang=pt'
	},
	divulgateLike: {
		type: 'web_url',
		label: 'Curtindo',
		url: undefined, // 'https://twitter.com/intent/like?tweet_id=463440424141459456&lang=pt'
	},
};
