export function subForum(fid, sub, cid) {
  let method;
  if(sub) {
    method = "POST";
  } else {
    method = "DELETE";
  }
  return nkcAPI('/f/' + fid + '/subscribe', method, {cid: cid || []})
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

//收藏社区文章
export function collectionThread(id, collection, cid) {
  return nkcAPI('/t/' + id + '/collection', 'POST', {
    type: !!collection,
    cid: cid || []
  })
}

//关注社区文章
export function subscribeThread(id, cid) {
  return nkcAPI('/t/' + id + '/subscribe', 'POST', {
    cid: cid || []
  })
}

//取关文章
export function unSubscribeThread(id) {
  return nkcAPI('/t/' + id + '/subscribe', 'DELETE', )
}

//收藏独立文章
export function collectionArticle(id, collection, cid) {
  return nkcAPI(`/article/${id}/collection`, "POST", {type: !!collection, cid: cid || []});
}

/*
* 将用户从黑名单中移除
* @param {String} tUid 需要移除用户的ID
* */
export function removeUserFromBlacklist(tUid) {
    return Promise.resolve()
        .then(function() {
            return nkcAPI('/blacklist?tUid=' + tUid, 'GET')
        })
        .then(function(data) {
            if(!data.bl) throw '对方未在黑名单中';
            return nkcAPI('/blacklist?tUid=' + tUid, 'DELETE');
        })
        .then(function(data) {
            sweetSuccess('操作成功');
            return data;
        })
        .catch(sweetError);
}

