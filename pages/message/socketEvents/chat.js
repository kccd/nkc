export function removeChat(data) {
  const {type, uid} = data;
  this.$refs[this.pageId.PageList].removeChat(type, uid);
}

export function updateChatList(data) {
  const {chatList} = data;
  this.$refs[this.pageId.PageList].updateChatList(chatList);
}