if(NKC.configs.platform === 'apiCloud') {
  $(() => {
    window.ready()
      .then(() => {
        const logoutButton = $(".nav-logout");
        const backButton = $(".nav-back");
        logoutButton.on("click", () => {
          nkcAPI("/logout", "GET")
            .then(() => {
              emitEvent("logout");
            })
            .catch(data => {
              screenTopWarning(data);
            })
        });
        backButton.on("click", closeWin);
        newEvent("swipeleft", closeWin);
        newEvent("userChanged", (data) => {
          const {user} = data;
          if(!user) return;
          $("#username").text(user.username);
          $("#userDescription").text(user.description || "未填写个人简介");
          $("#userAvatar").attr("src", `/avatar/${user.avatar}`);
          $("#userBanner").css("background-image", `url(/banner/${user.banner})`);
        });
      });
  });
} else if(NKC.configs.platform === 'reactNative'){
  window.closeWin = closeWin;
}


function closeWin() {
  if(NKC.configs.platform === 'apiCloud') {
    api.closeWin();
  } else if(NKC.configs.platform === 'reactNative') {
    NKC.methods.rn.emit('closeWebView');
  }

}
