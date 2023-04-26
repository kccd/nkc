import { nkcAPI } from './netAPI';
import {
  sweetQuestion,
  sweetError,
  sweetSuccess,
  sweetPrompt,
} from './sweetAlert';
import { screenTopWarning } from './topAlert';

/*
 * @param {String} uid
 * @param {String} type 可选：avatar、banner、description、username
 * */
export function clearUserPublicProfile(uid, type) {
  sweetQuestion(`此操作不可撤销，是否继续？`)
    .then(() => {
      return nkcAPI('/u/' + uid + '/clear', 'POST', {
        type: type,
      });
    })
    .then(function () {
      sweetSuccess('删除成功');
    })
    .catch(function (data) {
      sweetError(data);
    });
}

export function clearUserAvatar(uid) {
  return clearUserPublicProfile(uid, 'avatar');
}

export function clearUserBanner(uid) {
  return clearUserPublicProfile(uid, 'banner');
}

export function clearUserDescription(uid) {
  return clearUserPublicProfile(uid, 'description');
}

export function clearUsername(uid) {
  return clearUserPublicProfile(uid, 'username');
}

export function banUser(uid, isBan) {
  const title = '请输入原因';
  sweetPrompt(title)
    .then((reason) => {
      if (isBan) {
        return nkcAPI(`/u/${uid}/banned?reason=${reason}`, 'DELETE', {});
      } else {
        return nkcAPI('/u/' + uid + '/banned', 'PUT', {
          reason: reason,
        });
      }
    })
    .then(function () {
      sweetSuccess('执行成功');
    })
    .catch(sweetError);
}
