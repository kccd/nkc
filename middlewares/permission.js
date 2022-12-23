const {defaultCerts} = require('../settings/userCerts');

async function permission(ctx, next){
  const {data, state} = ctx;
	if(!data.userOperationsId.includes(data.operationId)) {
		ctx.throw(403, `${state.operation.errInfo || "权限不足"}`);
	}
	await next();
}

function OnlyVisitor() {
	return async (ctx, next) => {
		if(ctx.state.uid) {
			ctx.throw(403, "权限不足，当前资源仅允许游客访问");
		}
		await next();
	};
}

function OnlyUser() {
	return async (ctx, next) => {
		if(!ctx.static.uid) {
			ctx.throw(403, "权限不足，当前资源仅允许登录用户访问");
		}
		await next();
	};
}

function OnlyUnbannedUser() {
	return async (ctx, next) => {
		if(ctx.data.user.certs.includes(defaultCerts.banned)) {
			ctx.throw(403, "权限不足，当前资源仅允许正常用户访问");
		}
		await next();
	}
}

function OnlyBannedUser() {
	return async (ctx, next) => {
		if(!ctx.data.user.certs.includes(defaultCerts.banned)) {
			ctx.throw(403, "权限不足，当前资源仅允许被开除学籍的用户访问");
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
	}
}

function OnlyPermissionsAnd(operations) {
	return async (ctx, next) => {
		for(const operation of operations) {
			if(!ctx.data.userOperations.includes(operation)) {
				ctx.throw(403, "权限不足");
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
