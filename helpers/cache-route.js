const mcache = require('memory-cache');


/**
 * Express.js middleware to cache route
 * responses in memory.
 */
module.exports = duration => (request, response, next) => {
	const key = `__express__${request.originalUrl}` || request.url;
	const cachedResponse = mcache.get(key);
	if (cachedResponse) {
		response.send(cachedResponse);
		return;
	}
	response.sendResponse = response.send;
	response.send = (body) => {
		mcache.put(key, body, duration);
		response.sendResponse(body);
	};
	next();
};
