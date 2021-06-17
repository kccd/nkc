export function receiveMessage(data) {
  const {localId, message, chat} = data;
  const PageChat = this.$refs[this.pageId.PageChat];
  if(PageChat && PageChat.onReceiveMessage) {
    PageChat.onReceiveMessage(localId, message);
  }
  this.$refs[this.pageId.PageList].updateChat(chat);
}

export function markAsRead(data) {
  const {type, uid} = data;
  this.$refs[this.pageId.PageList].markAsRead(type, uid);
}

export function withdrawn(data) {
  const {messageId} = data;
  const PageChat = this.$refs[this.pageId.PageChat];
  if(PageChat && PageChat.onWithdrawn) {
    PageChat.onWithdrawn(messageId);
  }
}