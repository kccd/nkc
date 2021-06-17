export function updateUserStatus(data) {
  const {uid, status} = data;
  const PageList = this.$refs[this.pageId.PageList];
  if(PageList && PageList.updateUserStatus) {
    PageList.updateUserStatus('UTU', uid, status);
  }
}

export function updateUserList(data) {
  const {userList} = data;
  const PageList = this.$refs[this.pageId.PageList];
  if(PageList && PageList.updateUserList) {
    PageList.updateUserList(userList);
  }
}
export function removeFriend(data) {
  const {type, uid} = data;
  const PageList = this.$refs[this.pageId.PageList];
  if(PageList && PageList.removeFriend) {
    PageList.removeFriend(type, uid);
  }
}