import moment from 'moment';

/*
* 获取凌晨时刻的时间
* @param {Date} time 默认为当前时间
* @return {Date}
* */
export function earlyMorning(time) {
  time = time || new Date();
  const str = moment(time).format(`YYYY-MM-DD 00:00:00`);
  return new Date(str);
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
  const yesterdayEarlyMorning = earlyMorning(now.getTime() - 24 * 60 * 60 * 1000);
  if(time.getTime() >= yesterdayEarlyMorning.getTime()) {
    if(time.getDate() !== now.getDate()) {
      return '昨天';
    } else {
      return moment(time).format(`HH:mm`);
    }
  } else if(timeYear !== nowYear) {
    return moment(time).format(`YYYY-M-D`);
  } else {
    return moment(time).format(`M-D`);
  }
}

/*
* 输出详细的时间
* @param {Date} time 默认为当前时间
* @return {String}
* */
export function detailedTime(time) {
  time = time || new Date();
  return moment(time).format(`YYYY-MM-DD HH:mm:ss`);
}

/*
* 输出详细的时间
* @param {String} format 时间格式
* @param {Date} time 默认为当前时间
* @return {String}
* */
export function timeFormat(format, time) {
  time = time || new Date();
  return moment(time).format(format);
}