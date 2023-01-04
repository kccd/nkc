const {defaultCerts} = require('../settings/userCerts');
const {ThrowForbiddenResponseTypeError} = require('../nkcModules/error');
const {ResponseTypes} = require('../settings/response');

async function permission(ctx, next){
  const {data, isAPIRoute} = ctx;
	// 这里判断了请求的是否为API路由
	// 如果是API路由则绕过全局的权限判断
	// API路由需要在路由中间件中进行权限判断
	if(!isAPIRoute && !data.userOperationsId.includes(data.operationId)) {
		ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
	}
	await next();
}

function OnlyVisitor() {
	return async (ctx, next) => {
		if(ctx.state.uid) {
			ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN_BECAUSE_LOGGED);
		}
		await next();
	};
}

function OnlyUser() {
	return async (ctx, next) => {
		if(!ctx.static.uid) {
			ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN_BECAUSE_UN_LOGGED);
		}
		await next();
	};
}

function OnlyUnbannedUser() {
	return async (ctx, next) => {
		if(ctx.data.user.certs.includes(defaultCerts.banned)) {
			ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN_BECAUSE_BANNED);
		}
		await next();
	}
}

function OnlyBannedUser() {
	return async (ctx, next) => {
		if(!ctx.data.user.certs.includes(defaultCerts.banned)) {
			ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN_BECAUSE_UN_BANNED);
		}
		await next();
	}
}

function OnlyCurrentPermission() {
	return async (ctx, next) => {
		const operationId = ctx.data.operationId;
		if(!ctx.data.userOperations.includes(operationId)) {
			ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
		}
		await next();
	}
}

function OnlyPermission(operation) {
	return OnlyPermissionsAnd([operation]);
}

function OnlyPermissionsOr(operations) {
	return async (ctx, next) => {
		for(const operation of operations) {
			if(ctx.data.userOperations.includes(operation)) {
				return await next();
			}
		}
		ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
	}
}

function OnlyPermissionsAnd(operations) {
	return async (ctx, next) => {
		for(const operation of operations) {
			if(!ctx.data.userOperations.includes(operation)) {
				ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
			}
		}
		await next();
	};
}

module.exports = {
	permission,
	OnlyVisitor,
	OnlyUser,
	OnlyBannedUser,
	OnlyUnbannedUser,
	OnlyPermission,
	OnlyPermissionsAnd,
	OnlyPermissionsOr,
};
