import {nkcAPI} from "./netAPI";
import {sweetQuestion, sweetError, sweetSuccess} from "./sweetAlert";

/*
* @param {String} uid
* @param {String} type 可选：avatar、banner、description、username
* */
export function clearUserPublicProfile(uid, type) {
  sweetQuestion(`此操作不可撤销，是否继续？`)
    .then(() => {
      return nkcAPI("/u/" + uid + "/clear", "POST", {
        type: type
      })
    })
    .then(function() {
      sweetSuccess("删除成功");
    })
    .catch(function(data) {
      sweetError(data);
    })
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
