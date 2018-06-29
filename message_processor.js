const twitter = require('./twitter');
const opt = require('./utils/options');
const maApi = require('./mandatoaberto_api');
const Articles = require('./utils/articles');

const mp = {};
// facebook pageID that we use to get politician data
const pageID = process.env.PAGE_1_ID;

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
	if (payload.message_data.quick_reply_response) { // user sent quick_reply?
		const politicianData = await maApi.getPoliticianData(pageID);
		let articles;
		if (politicianData.gender === 'F') { articles = Articles.feminine; } else {	articles = Articles.masculine; }
		const trajectory = await maApi.getAnswer(politicianData.user_id, 'trajectory');
		const introduction = await maApi.getAnswer(politicianData.user_id, 'introduction');
		console.log(introduction);


		// checks which quick_reply was activated (metadata)
		switch (payload.message_data.quick_reply_response.metadata) {
		case 'contact':
			if (politicianData.contact.cellphone) {
				politicianData.contact.cellphone = politicianData.contact.cellphone.replace(/(?:\+55)+/g, '');
				politicianData.contact.cellphone = politicianData.contact.cellphone.replace(/^(\d{2})/g, '($1)');
			}
			await twitter.sendTextDM(data, `Você pode entrar em contato com ${articles.defined} ${politicianData.office.name}
			${politicianData.name} pelos seguintes canais:`);
			if (politicianData.contact.email) {	await twitter.sendTextDM(data, `- Através do e-mail: ${politicianData.contact.email}`); }
			if (politicianData.contact.cellphone) {	await twitter.sendTextDM(data, `- Através do WhatsApp: ${politicianData.contact.cellphone}`); }
			if (politicianData.contact.url) { await twitter.sendTextDM(data, `- Através do site: ${politicianData.contact.url}`);	}
			// if (politicianData.contact.twitter)
			//  { await twitter.sendTextDM(`- Através do Twitter: ${politicianData.contact.twitter}`);}
			await twitter.sendQuickReplyDM(data, 'Quer saber mais?', [opt.aboutTrajectory, opt.answerPoll, opt.participate, opt.news]);
			break;
		case 'aboutTrajectory':
		// an idea: when the text is empty it means we restarted the bot and the user lost the values
		// StatusCodeError: 400 - {"errors":[{"code":214,"message":
		// "event.message_create.message_data: Neither text nor attachment defined on message_data"}]}
		// we can create a catch for this error after failing to send the message
		// (and warn the user there was an update)
			await twitter.sendTextDM(data, trajectory.content);
			await twitter.sendQuickReplyDM(data, 'Quer saber mais?', [opt.contact, opt.answerPoll, opt.participate, opt.news]);
			break;
		case 'aboutPolitician':
			await twitter.sendTextDM(data, introduction.content);
			// await twitter.sendTextDM(data, 'Nosso governador já fez muito por São Paulo e pretende continuar lutando.');
			await twitter.sendQuickReplyDM(data, `O que mais deseja saber sobre ${articles.defined} pré-candidato?`, [
				opt.aboutTrajectory, opt.contact, opt.answerPoll, opt.participate]);
			break;
		case 'news':
			await twitter.sendTextDM(data, 'Não há nada de novo no front.');
			await twitter.sendTextDM(data, 'Tudo está bem com o mundo.');
			await twitter.sendQuickReplyDM(data, 'Como posso te ajudar?', [opt.contact, opt.aboutTrajectory, opt.answerPoll, opt.participate]);
			break;
		case 'answerPoll':
			await twitter.sendTextDM(data, 'Quero conhecer você melhor. Deixe sua resposta e participe deste debate.');
			await twitter.sendQuickReplyDM(data, 'Pergunta: Azul ou Vermelho??', [
				{ label: 'Azul',	metadata: 'pollOption1'	},
				{ label: 'Vermelho',	metadata: 'pollOption2'	}]);
			break;
		case 'pollOption1':
			// falls through
		case 'pollOption2':
			await twitter.sendTextDM(data, 'Obrigado pela sua resposta.');
			await twitter.sendQuickReplyDM(data, 'E agora, como posso te ajudar?', [opt.participate, opt.aboutPolitician, opt.aboutTrajectory, opt.contact]);
			break;
		case 'participate':
			await twitter.sendQuickReplyDM(data, 'Ficamos felizes com seu apoio! Como deseja participar?', [
				opt.donate, opt.divulgate, opt.goBack]);
			break;
		case 'donate':
			opt.donateButton.url = 'https://votolegal.com.br/?red';
			await twitter.sendTextDM(data, 'Seu apoio é fundamental para nossa pré-campanha! Por isso, cuidamos da segurança de todos os doadores. Saiba mais em: www.votolegal.com.br');
			await twitter.sendTextDM(data, 'Já consegui R$0 da minha meta de R$100.000,00.');
			await twitter.sendButton(data, 'Você deseja doar agora?', [
				opt.divulgate, opt.goBack], [opt.donateButton]);
			break;
		case 'divulgate': { // no-case-declarations
			const tweetID = '463440424141459456';
			const tweetText = encodeURIComponent('Eu apoio o dito cujo #candidato');
			opt.divulgateTweet.url = `https://twitter.com/intent/tweet?text=${tweetText}&lang=pt`;
			// opt.divulgateTweet.url = `https://twitter.com/intent/tweet?in_reply_to=${tweetID}&lang=pt`;
			opt.divulgateRetweet.url = `https://twitter.com/intent/retweet?tweet_id=${tweetID}&lang=pt`;
			opt.divulgateLike.url = `https://twitter.com/intent/like?tweet_id=${tweetID}&lang=pt`;
			await twitter.sendButton(data, 'Que legal! Seu apoio é muito importante para nós!\nComo quer colaborar?', [
				opt.donate, opt.goBack], [opt.divulgateTweet, opt.divulgateRetweet, opt.divulgateLike]);
			break; }
		case 'goBack':
			await twitter.sendQuickReplyDM(data, 'Como posso te ajudar?', [opt.contact, opt.aboutTrajectory, opt.answerPoll, opt.participate]);
			break;
		default:
			await twitter.sendQuickReplyDM(data, 'Perdão. Parece que ocorreu um erro. Clique em um dos botões ou me mande uma mensagem.\n' +
			'Se o problema persistir, apague a conversa e me mande uma nova mensagem.', [
				opt.aboutPolitician, opt.aboutTrajectory, opt.answerPoll, opt.participate]);
			break;
		}
	} else { // user sent text?
		// const msgText = payload.message_data.text;
		await twitter.sendQuickReplyDM(data, 'Perdão. Não entendo texto ainda, clique nos botões abaixo para interagir comigo.', [
			opt.aboutPolitician, opt.aboutTrajectory, opt.answerPoll, opt.participate]);
	}

	// console.log('------------------------');
	// console.log(`${data.politicianID} recebeu uma mensagem de ${data.userID}`);
	// console.log(`${data.politicianName} recebeu uma mensagem de ${data.userName}`);
	// console.log(`A mensagem foi: ${msgText}`);
};

module.exports = mp;

// const messages = require('./messages/messages');

// /**
//  * sends Direct Message with Twitter API
//  * @param  msg  a valid message event to sent using POST direct_messages/events/new
//  */
// mp.send_message = (msg) => {
// 	twitter.send_direct_message(msg, (error, res, body) => { // eslint-disable-line no-unused-vars
// 		// console.log('Sent message successfully => ', body.event.id);
// 		console.dir(body);
// 		// console.log(`body => ${(body)}`);
// 		// console.log(`response => ${res}`);
// 		// console.log(`error => ${error}`);
// 	});
// };
// const messageToSend = messages.get(metadata, data.userID, data.politicianID);
// mp.send_message(messageToSend);


// removing links from text message
// 	const msgText = payload.message_data.text.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
// removing emojis from message text
// .replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|
// \uD83D[\uDC00-\uDFFF]|[\u2694-\u2697]|\uD83E[\uDD10-\uDD5D])/g, '');

