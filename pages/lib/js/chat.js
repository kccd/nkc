import {getState} from './state';
import {RNToChat} from "./reactNative";
const {isApp} = getState();
export function toChat(uid, name, type) {
  if(isApp) {
    RNToChat({
      uid: uid,
      name: name,
      type: type || 'UTU'
    });
  } else {
    messageApp.toChat(uid);
  }
}