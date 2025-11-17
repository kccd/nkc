// Replaced full moment import with lightweight dayjs to avoid bundling all locales.
// Only zh-cn locale is loaded; adjust if you need more.
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
dayjs.locale('zh-cn');

/*
 * 获取凌晨时刻的时间
 * @param {Date} time 默认为当前时间
 * @return {Date}
 * */
export function earlyMorning(time) {
  time = time || new Date();
  return dayjs(time).startOf('day').toDate();
}

/*
 * 获取简洁的时间 当天(时:分) 昨天(昨天) 大于一天(月:日)
 * @param {Date} time 默认为当前时间
 * @return {String}
 * */
export function briefTime(time) {
  const now = new Date();
  time = new Date(time);
  const timeYear = time.getFullYear();
  const nowYear = now.getFullYear();
  const yesterdayEarlyMorning = earlyMorning(
    now.getTime() - 24 * 60 * 60 * 1000,
  );
  if (time.getTime() >= yesterdayEarlyMorning.getTime()) {
    if (time.getDate() !== now.getDate()) {
      return '昨天';
    } else {
      return dayjs(time).format('HH:mm');
    }
  } else if (timeYear !== nowYear) {
    return dayjs(time).format('YYYY-M-D');
  } else {
    return dayjs(time).format('M-D');
  }
}

/*
 * 输出详细的时间
 * @param {Date} time 默认为当前时间
 * @return {String}
 * */
export function detailedTime(time) {
  time = time || new Date();
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
}

/*
 * 输出详细的时间
 * @param {String} format 时间格式
 * @param {Date} time 默认为当前时间
 * @return {String}
 * */
export function timeFormat(format, time) {
  time = time || new Date();
  return dayjs(time).format(format);
}

export function formatDuration(milliseconds) {
  if (milliseconds < 0) {
    return 'Invalid input';
  }

  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours}小时`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}分钟`);
  }
  if (secs > 0) {
    parts.push(`${secs}秒`);
  }

  return parts.length > 0 ? parts.join('') : '0秒';
}
