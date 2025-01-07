import { nkcAPI } from './netAPI';
import { isAppBrowser, isMobileBrowser } from './browser';

export const loginTypes = {
  sms: 'sms',
  qr: 'qr',
  passwd: 'passwd',
};

export function getDefaultLoginType() {
  return nkcAPI('/login', 'GET').then((res) => {
    let loginType;
    if (isAppBrowser) {
      loginType = res.defaultLoginType.app;
    } else if (isMobileBrowser) {
      loginType = res.defaultLoginType.mobile;
    } else {
      loginType = res.defaultLoginType.desktop;
    }
    return loginType;
  });
}
