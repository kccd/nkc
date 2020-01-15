
function logout() {
  nkcAPI("/logout", "GET").then(function () {
    emitEvent("logout");
  })["catch"](function (data) {
    screenTopWarning(data);
  });
}