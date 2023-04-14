import { getState } from './state';
import { RNToChat } from './reactNative';
import { getFromLocalStorage } from './localStorage';
const { isApp } = getState();
export function toChat(uid, name, type) {
  if (isApp) {
    RNToChat({
      uid: uid,
      name: name,
      type: type || 'UTU',
    });
  } else {
    const defaultWidth =
      Number(getFromLocalStorage('messagePanelSize').width) || 500;
    const defaultHeight =
      Number(getFromLocalStorage('messagePanelSize').height) || 600;
    const left = (screen.width - defaultWidth) / 2;
    const top = (screen.height - defaultHeight) / 2;
    if (uid) {
      window.open(
        `/message?uid=${uid}`,
        'Message',
        `location=no,width=${defaultWidth},height=${defaultHeight},left=${left},top=${top}`,
      );
    } else {
      window.open(
        `/message`,
        'Message',
        `location=no,width=${defaultWidth},height=${defaultHeight},left=${left},top=${top}`,
      );
    }
  }
}
