export function closePage(app) {
  app.$emit('event', 'closePage');
}

export function openPage(app, pageId, data) {
  setTimeout(() => {
    app.$emit('event', 'openPage', {
      pageId,
      data
    })
  })
}

export function openChatPage(app, type, uid) {
  openPage(app, 'PageChat', {type, uid});
}

export function openUserPage(app, type, uid) {
  if(type !== 'UTU') {
    openChatPage(app, type, uid);
  } else {
    openPage(app, 'PageUser', {type, uid});
  }
}

export function openCategoryPage(app, id) {
  openPage(app, 'PageCategory', id);
}

export function openSearchPage(app) {
  openPage(app, 'PageSearch');
}

export function openSettingPage(app) {
  openPage(app, 'PageSetting');
}