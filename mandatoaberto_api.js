const request = require('requisition');
const queryString = require('query-string');

const securityToken = process.env.SECURITY_TOKEN;
const apiUri = process.env.MANDATOABERTO_API_URL;

module.exports = {
	async getPoliticianData(pageId) {
		const res = await request(`${apiUri}/api/chatbot/politician?fb_page_id=${pageId}&security_token=${securityToken}`);
		const politicianData = await res.json();
		return politicianData;
	},

	async getPollData(pageId) {
		const res = await request(`${apiUri}/api/chatbot/poll?fb_page_id=${pageId}&security_token=${securityToken}`);
		const pollData = await res.json();
		return pollData;
	},

	async postRecipient(userId, recipient) {
		const recipientDataQs = queryString.stringify(recipient);
		const res = await request.post(`${apiUri}/api/chatbot/recipient?${recipientDataQs}&security_token=${securityToken}&`).query({ politicianId: userId });
		const recipientData = await res.json();
		return recipientData;
	},

	async postPollAnswer(fbId, pollQuestionOptionId, origin) {
		const res = await request.post(`${apiUri}/api/chatbot/poll-result?fbId=${fbId}&pollQuestionOptionId=${pollQuestionOptionId}&origin=${origin}&security_token=${securityToken}`);
		const pollAnswer = await res.json();
		return pollAnswer;
	},

	async getPollAnswer(fbId, pollId) {
		const res = await request(`${apiUri}/api/chatbot/poll-result?fbId=${fbId}&pollId=${pollId}&security_token=${securityToken}`);
		const pollAnswer = await res.json();
		return pollAnswer;
	},

	async getDialog(politicianId, dialogName) {
		const res = await request(`${apiUri}/api/chatbot/dialog?politician_id=${politicianId}&dialogName=${dialogName}&security_token=${securityToken}`);
		const dialog = await res.json();
		return dialog;
	},

	async getAnswer(politicianId, questionName) {
		const res = await request(`${apiUri}/api/chatbot/answer?politician_id=${politicianId}&questionName=${questionName}&security_token=${securityToken}`);
		const question = await res.json();
		return question;
	},

	async postIssue(politicianId, fbId, message) {
		const messageURI = encodeURI(message);
		const res = await request.post(`${apiUri}/api/chatbot/issue?politician_id=${politicianId}&fbId=${fbId}&message=${messageURI}&security_token=${securityToken}`);
		const issue = await res.json();
		return issue;
	},
};
