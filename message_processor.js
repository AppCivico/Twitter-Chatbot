const fs = require('fs-extra');
const twitter = require('./utils/twitter');
const opt = require('./utils/options');
const maApi = require('./utils/mandatoaberto_api');
const VotoLegalAPI = require('./utils/votolegal_api');
const Articles = require('./utils/articles');
const format = require('./utils/format');

const mp = {};

/**
 * Checks if event is text or quick_reply and answer appropriately
 * @param  payload  object with message data => direct_message_events[0].message_create object
 * @param  users  object with users data =>
 */
mp.checkType = async (payload, users) => {
	const data = { // event data
		politicianID: payload.target.recipient_id,
		userID: payload.sender_id,
	};
	data.politicianName = users[data.politicianID].name;
	data.userName = users[data.userID].name;

	const path = `./.sessions/${data.politicianID}-${data.userID}.json`;

	if (!(await fs.pathExists(path))) {
		await fs.outputJson(path,
			{
				politicianName: data.politicianName,
				politicianID: data.politicianID,
				userName: data.userName,
				userID: data.userID,
				state: undefined, // user still doesn't have a state worth saving
				eMail: undefined, // nor an e-mail
				phoneNumber: undefined, // nor a phone number
				createdAt: Date.now(),
				modifiedAt: Date.now(),
			});
	}


	const politicianData = await maApi.getPoliticianData('twitter', data.politicianID);
	data.oauthToken = politicianData.twitter_oauth_token;
	data.tokenSecret = politicianData.twitter_token_secret;
	console.log(politicianData);
	let articles;
	if (politicianData.gender === 'F') { articles = Articles.feminine; } else { articles = Articles.masculine; }
	const trajectory = await maApi.getAnswer(politicianData.user_id, 'trajectory');
	const introduction = await maApi.getAnswer(politicianData.user_id, 'introduction');
	const pollData = await maApi.getPollData(data.politicianID);

	if (politicianData.office.name === 'Outros' || politicianData.office.name === 'Candidato' || politicianData.office.name === 'Candidata') {
		opt.aboutPolitician.label = `Sobre ${articles.defined} líder`;
	} else {
		// unlike facebook, twitter allows for more than 20 chars at 'label'
		opt.aboutPolitician.label = `Sobre ${articles.defined} ${politicianData.office.name}`;
	}

	function checkMenu(opt2) { // eslint-disable-line no-inner-declarations
		let dialogs = opt2;
		if (!introduction) { dialogs = dialogs.filter(obj => obj.metadata !== 'aboutPolitician'); }
		if (!trajectory) { dialogs = dialogs.filter(obj => obj.metadata !== 'aboutTrajectory'); }
		if (!pollData) { dialogs = dialogs.filter(obj => obj.metadata !== 'answerPoll'); }
		if (!politicianData.contact) { dialogs = dialogs.filter(obj => obj.metadata !== 'contact'); }
		// if (!politicianData.votolegal_integration.votolegal_username)
		// { dialogs = dialogs.filter(obj => obj.metadata !== 'participate'); }
		if (!politicianData.votolegal_integration) { dialogs = dialogs.filter(obj => obj.metadata !== 'participate'); }
		dialogs = dialogs.filter(obj => obj.metadata !== 'news');
		dialogs = dialogs.filter(obj => obj.metadata !== 'divulgate');
		// dialogs = dialogs.filter(obj => obj.metadata !== 'answerPoll');
		return dialogs;
	}

	if (payload.message_data.quick_reply_response) { // user sent quick_reply?
		// checks which quick_reply was activated (metadata)
		switch (payload.message_data.quick_reply_response.metadata) {
		case 'contact': {
			if (politicianData.contact.cellphone) {
				politicianData.contact.cellphone = politicianData.contact.cellphone.replace(/(?:\+55)+/g, '');
				politicianData.contact.cellphone = politicianData.contact.cellphone.replace(/^(\d{2})/g, '($1)');
			}
			await twitter.sendTextDM(data, `Você pode entrar em contato com ${articles.defined} ${politicianData.office.name}
			${politicianData.name} pelos seguintes canais:`);
			if (politicianData.contact.email) { await twitter.sendTextDM(data, `- Através do e-mail: ${politicianData.contact.email}`); }
			if (politicianData.contact.cellphone) { await twitter.sendTextDM(data, `- Através do WhatsApp: ${politicianData.contact.cellphone}`); }
			if (politicianData.contact.url) {
				await twitter.sendTextDM(data, '- Através do site:');
				await twitter.sendTextDM(data, politicianData.contact.url);
			}
			await twitter.sendQuickReplyDM(data, 'Quer saber mais?', await checkMenu([opt.aboutTrajectory, opt.answerPoll, opt.participate, opt.news]));
			break;
		}
		case 'aboutTrajectory':
			await twitter.sendTextDM(data, trajectory.content);
			await twitter.sendQuickReplyDM(data, 'Quer saber mais?', await checkMenu([opt.contact, opt.answerPoll, opt.participate, opt.news]));
			break;
		case 'aboutPolitician':
			await twitter.sendTextDM(data, introduction.content);
			await twitter.sendQuickReplyDM(data, `O que mais deseja saber sobre ${articles.defined} pré-candidato?`, await checkMenu([
				opt.aboutTrajectory, opt.contact, opt.answerPoll, opt.participate]));
			break;
		case 'news':
			await twitter.sendTextDM(data, 'Não há nada de novo no front.');
			await twitter.sendTextDM(data, 'Tudo está bem com o mundo.');
			await twitter.sendQuickReplyDM(data, 'Como posso te ajudar?', await checkMenu([opt.contact, opt.aboutTrajectory, opt.answerPoll, opt.participate]));
			break;
		case 'answerPoll': { // no-case-declarations
			const recipientAnswer = await maApi.getPollAnswer(data.userID, pollData.id);
			if (recipientAnswer.recipient_answered >= 1) {
				await twitter.sendTextDM(data, 'Ah, que pena! Você já respondeu essa pergunta.');
				await twitter.sendQuickReplyDM(data, 'Se quiser, eu posso te ajudar com outra coisa.',
					await checkMenu([
						opt.participate, opt.aboutPolitician, opt.aboutTrajectory, opt.contact]));
			} else {
				await twitter.sendTextDM(data, 'Quero conhecer você melhor. Deixe sua resposta '
			+ 'e participe deste debate.');
				await twitter.sendQuickReplyDM(data, `Pergunta: ${pollData.questions[0].content}`, [
					{ label: pollData.questions[0].options[0].content,	metadata: 'pollOption0'	},
					{ label: pollData.questions[0].options[1].content,	metadata: 'pollOption1'	}]);
			}
			break;	}
		case 'pollOption0':
			// falls through
		case 'pollOption1': {
			// is pollAnswer the same as pollData.questions[0].options[N].id?
			const pollAnswer = payload.message_data.quick_reply_response.metadata.slice(-1);
			await maApi.postPollAnswer(data.userID, pollAnswer, 'twitter'); // could not find recipient with that fb_id
			// await twitter.sendTextDM(data, 'Obrigado pela sua resposta.');
			// await twitter.sendQuickReplyDM(data, 'E agora, como posso te ajudar?', await checkMenu([
			// 	opt.participate, opt.aboutPolitician, opt.aboutTrajectory, opt.contact]));
			await twitter.sendQuickReplyDM(data, 'Muito obrigado por sua resposta.Você gostaria de deixar seu e-mail e telefone para nossa equipe?',
				[opt.letsGo, opt.notNow]);
			break;
		}
		case 'participate':
			await twitter.sendQuickReplyDM(data, 'Ficamos felizes com seu apoio! Como deseja participar?', await checkMenu([
				opt.donate, opt.divulgate, opt.goBack]));
			break;
		case 'donate': {
			const valueLegal = await VotoLegalAPI.getVotoLegalValues(politicianData.votolegal_integration.votolegal_username); // eslint-disable-line max-len
			opt.donateButton.url = politicianData.votolegal_integration.votolegal_url;
			await twitter.sendTextDM(data, 'Seu apoio é fundamental para nossa pré-campanha! Por isso, cuidamos da segurança de todos os doadores. Saiba mais em: www.votolegal.com.br');
			await twitter.sendTextDM(data, `Já consegui R$${(format.formatReal(valueLegal.candidate.total_donated))} da `
					+ `minha meta de R$${format.format(valueLegal.candidate.raising_goal)}.`);
			await twitter.sendButton(data, 'Você deseja doar agora?', await checkMenu([opt.divulgate, opt.goBack]), [opt.donateButton]);
			break;
		}
		case 'divulgate': {
			const tweetID = '463440424141459456';
			const tweetText = encodeURIComponent('Eu apoio o dito cujo #candidato');
			opt.divulgateTweet.url = `https://twitter.com/intent/tweet?text=${tweetText}&lang=pt`;
			// opt.divulgateTweet.url = `https://twitter.com/intent/tweet?in_reply_to=${tweetID}&lang=pt`;
			opt.divulgateRetweet.url = `https://twitter.com/intent/retweet?tweet_id=${tweetID}&lang=pt`;
			opt.divulgateLike.url = `https://twitter.com/intent/like?tweet_id=${tweetID}&lang=pt`;
			await twitter.sendButton(data, 'Que legal! Seu apoio é muito importante para nós!\nComo quer colaborar?', await checkMenu([
				opt.donate, opt.goBack]), [opt.divulgateTweet, opt.divulgateRetweet, opt.divulgateLike]);
			break;
		}
		case 'goBack':
			await twitter.sendQuickReplyDM(data, 'Como posso te ajudar?', await checkMenu([
				opt.contact, opt.aboutTrajectory, opt.answerPoll, opt.participate]));
			break;
		default:
			await twitter.sendQuickReplyDM(data, 'Perdão. Parece que ocorreu um erro. Clique em um dos botões ou me mande uma mensagem.\n'
					+ 'Se o problema persistir, apague a conversa e me mande uma nova mensagem.', await checkMenu([
				opt.aboutPolitician, opt.aboutTrajectory, opt.answerPoll, opt.participate]));
			break;
		}
	} else { // user sent text?
		// const msgText = payload.message_data.text;
		await twitter.sendQuickReplyDM(data, 'Perdão. Não entendo texto ainda, clique nos botões abaixo para interagir comigo.', await checkMenu([
			opt.aboutPolitician, opt.aboutTrajectory, opt.answerPoll, opt.participate]));
	}

	// console.log('------------------------');
	// console.log(`${data.politicianID} recebeu uma mensagem de ${data.userID}`);
	// console.log(`${data.politicianName} recebeu uma mensagem de ${data.userName}`);
	// console.log(`A mensagem foi: ${msgText}`);
};

module.exports = mp;
