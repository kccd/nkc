import { getState } from './state';
import { RNToChat } from './reactNative';
const { isApp } = getState();
export function toChat(uid, name, type) {
  if (isApp) {
    RNToChat({
      uid: uid,
      name: name,
      type: type || 'UTU',
    });
  } else {
    RootApp.openChatPanel(uid);
  }
}

export function openMessageCenter(uid) {
  const defaultWidth = Number(localStorage.getItem('windowWidth')) || 600;
  const defaultHeight = Number(localStorage.getItem('windowHeight')) || 500;
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
