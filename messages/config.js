module.exports = {

	// this message is used if the bot can't find a response
	default_message: {
		event: {
			type: 'message_create',
			message_create: {
				target: {
					recipient_id: undefined,
				},
				message_data: {
					text: 'Perdão. Não entendo texto ainda, utilize os botões para interagir comigo',
					// quick_reply: require('./fragment_demo_features_options'),
				},
			},
		},
	},

	// all message responses
	// Usage: Just keep adding the files in folder and their names here
	messages_files: [
		// 'feature_quick_reply_input',
		// 'feature_quick_reply_input_response',
		// 'feature_quick_reply_options',
		// 'feature_quick_reply_options_response',
		// 'feature_buttons',
		// 'feature_location_sharing',
		// 'feature_location_sharing_response',
	],
};


// module.exports = {
// 	"type": "options",
// 	"options": [
// 		{
// 			"label": "Quick Reply: Options",
// 			"description": "Prompt a user to select from list of predefined options.",
// 			"metadata": "feature_quick_reply_options"
// 		},
// 		{
// 			"label": "Quick Reply: Text Input",
// 			"description": "Prompt a user with hint text and a restricted keyboard.",
// 			"metadata": "feature_quick_reply_input"
// 		},
// 		{
// 			"label": "Location Sharing",
// 			"description": "Prompt a user to share their location with an interactive map.",
// 			"metadata": "feature_location_sharing"
// 		},
// 		{
// 			"label": "Buttons",
// 			"description": "Prompt a user with buttons linked to URLs.",
// 			"metadata": "feature_buttons"
// 		}
// 	]
// }
