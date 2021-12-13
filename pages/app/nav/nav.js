import {
  RNCloseWebview,
  RNLogout,
  RNCheckAndUpdateApp,
} from "../../lib/js/reactNative";
import {sweetError} from "../../lib/js/sweetAlert";

window.closeWin = function() {
  RNCloseWebview('closeWebView', {drawer: true});
};
window.logout = function() {
  nkcAPI("/logout", "GET")
    .then(() => {
      RNLogout();
    })
    .catch(data => {
      sweetError(data);
    })
};

window.updateApp = function() {
  RNCheckAndUpdateApp();
}
