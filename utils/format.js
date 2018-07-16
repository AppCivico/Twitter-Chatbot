// a class with two helper functions to format numbers to Real

function getMoney(str) { return parseInt(str.replace(/[\D]+/g, ''), 10); }

function formatReal(int) {
	let tmp = `${int}`;
	tmp = tmp.replace(/([0-9]{2})$/g, ',$1');
	if (tmp.length > 6) {
		tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, '.$1,$2');
	}
	return tmp;
}

module.exports.formatReal = formatReal;
module.exports.format = str => formatReal(getMoney(str));
