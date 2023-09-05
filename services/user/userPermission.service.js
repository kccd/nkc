const UserModel = require('../../dataModels/UserModel');
class UserPermissionService {
  async isUserOwnsCert(uid, roleId) {
    if (!uid) {
      return false;
    }
    const user = await UserModel.findOnly(
      { uid },
      {
        uid: 1,
        certs: 1,
        xsf: 1,
      },
    );
    const certs = await UserModel.getUserCertsByXSF(user.certs, user.xsf);
    return certs.includes(roleId);
  }

  async isUserOwnsOperation(uid, operationId) {
    if (!uid) {
      return false;
    }
    const user = await UserModel.findOnly({ uid });
    const roles = await user.extendRoles();
    const operationsId = await UserModel.getOperationsIdByRoles(roles);
    return operationsId.includes(operationId);
  }
}

module.exports = {
  userPermissionService: new UserPermissionService(),
};
