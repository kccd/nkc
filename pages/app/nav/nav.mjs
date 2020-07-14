window.closeWin = function() {
  if(NKC.configs.platform === 'apiCloud') {
    api.closeWin();
  } else if(NKC.configs.platform === 'reactNative') {
    NKC.methods.rn.emit('closeWebView', {drawer: true});
  }
};
window.logout = function() {
  nkcAPI("/logout", "GET")
    .then(() => {
      if(NKC.configs.platform === 'apiCloud') {
        emitEvent("logout");
      } else if(NKC.configs.platform === 'reactNative') {
        NKC.methods.rn.emit('logout');
      }
    })
    .catch(data => {
      screenTopWarning(data);
    })
};
