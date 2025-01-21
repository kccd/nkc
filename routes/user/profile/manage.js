module.exports = async (ctx, next) => {
  const {data, db, permission, state, params} = ctx;
  const {user, targetUser} = data;
  const {uid} = params;
  const permissions = {
    visitUserTransaction: null,
    violationRecord: null,
    getUserOtherAccount: null,
    viewUserCode: null,
  };
  if(user) {
    if(permission('visitUserTransaction')) {
      permissions.visitUserTransaction = true;
    }
    if(permission('violationRecord')) {
      permissions.violationRecord = true;
    }
    if(permission('getUserOtherAccount')) {
      permissions.getUserOtherAccount = true;
    }
    if(permission('viewUserCode')) {
      permissions.viewUserCode = true;
    }
    }
  data.permissions = permissions;
  await next();
};
