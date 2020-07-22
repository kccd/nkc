const permission = {};
const operationObj = require('../settings/operations');
const methods = ['GET', 'POST', 'PUT', 'DELETE'];

permission.getOperationsId = () => {
	const fn = (obj, arr) => {
		for(let key in obj) {
			if(!obj.hasOwnProperty(key)) continue;
			if(methods.includes(key)) {
				arr.push(obj[key]);
			} else {
				if(typeof obj[key] === 'object') {
					fn(obj[key], arr)
				}
			}
		}
	};
	const operations = operationObj.defaultOperations.concat([]);
	fn(operationObj.operationTree, operations);
	return [...new Set(operations)];
};

permission.getOperationId = (url, method) => {
	let urlArr = [];
	url = url.replace(/\?.*/, '');
	if(url === '/') {
		urlArr = ['home'];
	} else {
		urlArr = url.split('/');
		urlArr[0] = 'home';
	}
	const fn = (obj, dKey) => {
		for(let key in obj) {
			if(!obj.hasOwnProperty(key)) continue;
			if(key === 'PARAMETER') {
				return obj['PARAMETER'];
			} else if(dKey === key) {
				return obj[key];
			}
		}
	};
	let obj = Object.assign({}, operationObj.operationTree);
	for(let i = 0 ; i < urlArr.length ; i++) {
		const key = urlArr[i];
		obj = fn(obj, key);
	}
	if(obj && typeof obj === 'object' && obj[method]) {
		return obj[method];
	} else {
		const error = new Error('not found');
		error.status = 404;
		throw error;
	}
};


module.exports = permission;
