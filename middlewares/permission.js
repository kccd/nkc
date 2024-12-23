const { defaultCerts } = require('../settings/userCerts');
const { ThrowForbiddenResponseTypeError } = require('../nkcModules/error');
const { ResponseTypes } = require('../settings/response');
const { FixedOperations } = require('../settings/operations.js');

async function permission(ctx, next) {
  const { data } = ctx;
  const isFixedOperation = Object.values(FixedOperations).includes(
    data.operationId,
  );
  // 这里首先判断了当前操作是否为固定操作，固定操作无需进行权限判断
  if (!isFixedOperation && !data.userOperationsId.includes(data.operationId)) {
    ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
  }
  await next();
}

function OnlyVisitor() {
  return async (ctx, next) => {
    if (ctx.state.uid) {
      ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN_BECAUSE_LOGGED);
    }
    await next();
  };
}

function OnlyUser() {
  return async (ctx, next) => {
    if (!ctx.state.uid) {
      ThrowForbiddenResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_UN_LOGGED,
      );
    }
    await next();
  };
}

function OnlyCert(roleId) {
  return async (ctx, next) => {
    const userRoles = ctx.data.userRoles;
    let exists = false;
    for (const role of userRoles) {
      if (role._id === roleId) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      const role = await ctx.db.RoleModel.extendRole(roleId);
      ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN_BECAUSE_NO_CERT, [
        role.displayName,
      ]);
    }
    await next();
  };
}

function OnlyUnbannedUser() {
  return async (ctx, next) => {
    if (ctx.data.user.certs.includes(defaultCerts.banned)) {
      ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN_BECAUSE_BANNED);
    }
    await next();
  };
}

function OnlyBannedUser() {
  return async (ctx, next) => {
    if (!ctx.data.user.certs.includes(defaultCerts.banned)) {
      ThrowForbiddenResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_UN_BANNED,
      );
    }
    await next();
  };
}

/*function OnlyCurrentPermission() {
  return async (ctx, next) => {
    const operationId = ctx.data.operationId;
    if (!ctx.data.userOperationsId.includes(operationId)) {
      ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
    }
    await next();
  };
}*/

function OnlyPermission(operation) {
  return OnlyPermissionsAnd([operation]);
}

function OnlyPermissionsOr(operations) {
  return async (ctx, next) => {
    for (const operation of operations) {
      if (ctx.data.userOperationsId.includes(operation)) {
        return await next();
      }
    }
    ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
  };
}

function OnlyPermissionsAnd(operations) {
  return async (ctx, next) => {
    for (const operation of operations) {
      if (!ctx.data.userOperationsId.includes(operation)) {
        ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
      }
    }
    await next();
  };
}

function Public() {
  return async (ctx, next) => {
    await next();
  };
}

module.exports = {
  permission,
  OnlyVisitor,
  OnlyUser,
  OnlyBannedUser,
  OnlyCert,
  OnlyUnbannedUser,
  OnlyPermission,
  OnlyPermissionsAnd,
  OnlyPermissionsOr,
  Public,
};
