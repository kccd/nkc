export function updateUserStatus(data) {
  const {uid, status} = data;
  this.$refs[this.pageId.PageList].updateUserStatus('UTU', uid, status);
}

export function updateUserList(data) {
  const {userList} = data;
  this.$refs[this.pageId.PageList].updateUserList(userList);
}
export function removeFriend(data) {
  const {type, uid} = data;
  this.$refs[this.pageId.PageList].removeFriend(type, uid);
}