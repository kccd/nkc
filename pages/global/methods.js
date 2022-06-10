
/*
* 打开用户名片悬浮面板
* @param {String} uid
* @param {Dom} dom
* */
export function openUserFloatPanel(uid, dom) {
  window.RootApp.$refs.userFloatPanel.showFloatUserPanel(uid, dom);
}

/*
* 关闭用户名片悬浮面板
* */
export function closeUserFloatPanel() {
  window.RootApp.$refs.userFloatPanel.initMouseleaveEvent();
}

/*
* 打开专业名片悬浮面板
* @param {String} fid
* @param {Dom} dom
* */
export function openForumFloatPanel(fid, dom) {
  window.RootApp.$refs.forumFloatPanel.showForumPanel(dom, fid);
}

/*
* 关闭专业名片悬浮面板
* */
export function closeForumFloatPanel() {
  window.RootApp.$refs.forumFloatPanel.hideForumPanel();
}

export function openStickerPanel(id, management = false) {
  window.RootApp.$refs.stickerPanel.open(id, management);
}

export function closeStickerPanel() {

}

export function openShareFloatPanel(type, id) {
  window.RootApp.$refs.shareFloatPanel.open(type, id);
}
