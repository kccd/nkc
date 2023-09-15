import UAParser from 'ua-parser-js';
import { visitUrl } from '../lib/js/pageSwitch';

function checkBrowserCompatibility(userAgent, requiredVersions) {
  const parser = new UAParser();
  const result = parser.setUA(userAgent).getResult();

  // 限制IE
  if (result.browser.name === 'IE') {
    return false;
  }

  for (var browserName in requiredVersions) {
    if (result.browser.name === browserName) {
      const requiredVersion = requiredVersions[browserName];
      const currentVersion = parseFloat(result.browser.version);
      if (currentVersion < requiredVersion) {
        return false; // 浏览器版本不符合要求
      }
    }
  }

  return true; // 浏览器版本符合要求
}

const userAgent = navigator.userAgent;
const requiredVersions = {
  Chrome: 70,
  Firefox: 65,
  Safari: 12,
};

const isCompatible = checkBrowserCompatibility(userAgent, requiredVersions);
if (!isCompatible) {
  // visitUrl('/browser');
}
