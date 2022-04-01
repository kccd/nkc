export function subForum(id, sub, cid) {
  let method;
  if(sub) {
    method = "POST";
  } else {
    method = "DELETE";
  }
  return nkcAPI('/f/' + id + '/subscribe', method, {cid: cid || []})
};
//取关和关注
export function subUsers(){

}

