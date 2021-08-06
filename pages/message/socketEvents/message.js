import {updateChat} from './chat.js';
export function receiveMessage(data) {
  const {localId, message, chat} = data;
  const PageChat = this.$refs[this.pageId.PageChat];
  if(PageChat && PageChat.onReceiveMessage) {
    PageChat.onReceiveMessage(localId, message);
  }
  updateChat.bind(this)({chat});
}

export function markAsRead(data) {
  const {type, uid} = data;
  const PageList = this.$refs[this.pageId.PageList];
  if(PageList && PageList.markAsRead) {
    PageList.markAsRead(type, uid);
  }
}

export function withdrawn(data) {
  const {messageId, reEdit} = data;
  const PageChat = this.$refs[this.pageId.PageChat];
  if(PageChat && PageChat.onWithdrawn) {
    PageChat.onWithdrawn(messageId, reEdit);
  }
}