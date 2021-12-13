import {
  RNInitClientEvent,
  RNInitLongPressEventToDownloadImage,
  RNSyncPageInfo
} from '../lib/js/reactNative';

import {getState} from '../lib/js/state';
const {uid} = getState();
// 同步页面信息
RNSyncPageInfo({uid});
// 初始化链接点击事件
RNInitClientEvent();
// 初始化图片长按事件
RNInitLongPressEventToDownloadImage();