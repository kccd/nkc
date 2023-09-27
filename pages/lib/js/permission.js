import { HttpMethods, nkcAPI } from './netAPI';
import { sweetError } from './sweetAlert';

const operationRelationType = {
  and: 'and',
  or: 'or',
};

function checkAccountPermissionCore(type, operations) {
  return nkcAPI(
    `/api/v1/account/permission?type=${type}&operations=${operations.join(
      ',',
    )}`,
    HttpMethods.GET,
  )
    .then((res) => {
      return res.data.permission;
    })
    .catch(sweetError);
}

export function checkAccountPermission(operation) {
  return checkAccountPermissionAnd([operation]);
}

export function checkAccountPermissionAnd(operations) {
  return checkAccountPermissionCore(operationRelationType.and, operations);
}

export function checkAccountPermissionOr(operations) {
  return checkAccountPermissionCore(operationRelationType.or, operations);
}
