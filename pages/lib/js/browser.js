import { getState } from './state';
const { isApp: isAppBrowser } = getState();

const reg = /(iPhone|iPad|iPod|iOS|Android)/i;

const isMobileBrowser = !isAppBrowser && reg.test(window.navigator.userAgent);
const isDesktopBrowser = !isAppBrowser && !isMobileBrowser;

export function IsFirefox() {
  return navigator.userAgent.indexOf('Firefox') !== -1;
}
const browserType = isAppBrowser
  ? 'app'
  : isMobileBrowser
  ? 'mobile'
  : 'desktop';

export { isAppBrowser, isMobileBrowser, isDesktopBrowser, browserType };
