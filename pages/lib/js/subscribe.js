export function subForum(id, sub, cid) {
  let method;
  if(sub) {
    method = "POST";
  } else {
    method = "DELETE";
  }
  return nkcAPI('/f/' + id + '/subscribe', method, {cid: cid || []})
};

/*
 * 关注用户
 * @param {String} id 用户ID
 * @param {Boolean} sub 是否关注 false: 取消关注, true: 关注
 * @author
 * */
// 返回promise
export function subUsers(id, sub, cid) {
    let method = sub? "POST": "DELETE";
    return nkcAPI("/u/" + id + "/subscribe", method, {cid: cid || []});
}

/*
 * 关注用户分类变化
 * @param {Array} typesId 分类id
 * @param {Array} subsId 关注用户id
 * @author
 * */
// 返回promise
export function subTypesChange(typesId,subsId) {
    return nkcAPI("/account/subscribes", "PUT", {
        type: "modifyType",
        typesId: typesId,
        subscribesId: subsId
    })
}

/*
 * 关注专栏取关
 * @param {String} id 用户ID
 * @param {Boolean} sub 是否关注 false: 取消关注, true: 关注
 * @author
 * */
// 返回promise
export function subColumn(id, sub, cid) {
    return nkcAPI("/m/" + id + "/subscribe", "POST", {
        type: sub? "subscribe":"",
        cid: cid || []
    });
}

