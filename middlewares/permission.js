const { defaultCerts } = require('../settings/userCerts');
const { ThrowForbiddenResponseTypeError } = require('../nkcModules/error');
const { ResponseTypes } = require('../settings/response');
const { FixedOperations } = require('../settings/operations.js');

const permissionRef = [];

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
  const f = async (ctx, next) => {
    if (ctx.state.uid) {
      ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN_BECAUSE_LOGGED);
    }
    await next();
  };
  permissionRef.push(f);
  return f;
}

function OnlyUser() {
  const f = async (ctx, next) => {
    if (!ctx.state.uid) {
      ThrowForbiddenResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_UN_LOGGED,
      );
    }
    await next();
  };
  permissionRef.push(f);
  return f;
}

function OnlyCert(roleId) {
  const f = async (ctx, next) => {
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
  permissionRef.push(f);
  return f;
}

function OnlyUnbannedUser() {
  const f = async (ctx, next) => {
    if (!ctx.state.uid) {
      ThrowForbiddenResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_UN_LOGGED,
      );
    }
    if (ctx.data.user.certs.includes(defaultCerts.banned)) {
      ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN_BECAUSE_BANNED);
    }
    await next();
  };
  permissionRef.push(f);
  return f;
}

function OnlyBannedUser() {
  const f = async (ctx, next) => {
    if (!ctx.data.user.certs.includes(defaultCerts.banned)) {
      ThrowForbiddenResponseTypeError(
        ResponseTypes.FORBIDDEN_BECAUSE_UN_BANNED,
      );
    }
    await next();
  };
  permissionRef.push(f);
  return f;
}

/*function OnlyCurrentOperation() {
  return async (ctx, next) => {
    const operationId = ctx.data.operationId;
    if (!ctx.data.userOperationsId.includes(operationId)) {
      ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
    }
    await next();
  };
}*/

function OnlyOperation(operation) {
  const f = OnlyOperationsAnd([operation]);
  permissionRef.push(f);
  return f;
}

function OnlyOperationsOr(operations) {
  const f = async (ctx, next) => {
    for (const operation of operations) {
      if (ctx.data.userOperationsId.includes(operation)) {
        return await next();
      }
    }
    ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
  };
  permissionRef.push(f);
  return f;
}

function OnlyOperationsAnd(operations) {
  const f = async (ctx, next) => {
    for (const operation of operations) {
      if (!ctx.data.userOperationsId.includes(operation)) {
        ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
      }
    }
    await next();
  };
  permissionRef.push(f);
  return f;
}

function Public() {
  const f = async (ctx, next) => {
    await next();
  };
  permissionRef.push(f);
  return f;
}

function OnlyApp() {
  const f = async (ctx, next) => {
    if (!ctx.state.isApp) {
      ThrowForbiddenResponseTypeError(ResponseTypes.FORBIDDEN);
    }
    await next();
  };
  permissionRef.push(f);
  return f;
}

module.exports = {
  permission,
  OnlyVisitor,
  OnlyUser,
  OnlyBannedUser,
  OnlyCert,
  OnlyUnbannedUser,
  OnlyOperation,
  OnlyOperationsAnd,
  OnlyOperationsOr,
  Public,
  OnlyApp,
  permissionRef,
};
