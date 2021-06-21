export function removeChat(data) {
  const {type, uid} = data;
  const PageList = this.$refs[this.pageId.PageList];
  if(PageList && PageList.removeChat) {
    PageList.removeChat(type, uid);
  }
}

export function updateChatList(data) {
  const {chatList} = data;
  const PageList = this.$refs[this.pageId.PageList];
  if(PageList && PageList.updateChatList) {
    PageList.updateChatList(chatList);
  }
}

export function updateChat(data) {
  const {chat} = data;
  const PageList = this.$refs[this.pageId.PageList];
  if(PageList && PageList.updateChat) {
    PageList.updateChat(chat);
  }
}