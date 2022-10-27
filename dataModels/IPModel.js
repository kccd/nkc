const mongoose = require('../settings/database');
const localAddr = '未同步';
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: String,
  ip: {
    type: String,
    index: 1,
    default: ''
  },
  // 省份
  province: {
    type: String,
    default: ''
  },
  // 城市
  city: {
    type: String,
    default: ''
  },
  // 城市编码
  adCode: {
    type: String,
    default: ''
  },
  // 定位
  rectangle: {
    type: String,
    default: ''
  },
  // 更新时间
  tlm: {
    type: Date,
    default: Date.now,
    index: 1
  }
}, {
  collection: 'ips'
});

schema.statics.saveIpAndGetIpData = async (ip = '') => {
  const SettingModel = mongoose.model('settings');
  const IPModel = mongoose.model('ips');
  ip = ip.trim();
  let oldData = await IPModel.findOne({ip});
  if(!oldData) {
    const _id = await SettingModel.newObjectId();
    oldData = IPModel({
      _id,
      ip,
    });
    await oldData.save();
  }
  return oldData;
}
schema.statics.saveIPAndGetToken = async (ip) => {
  const IPModel = mongoose.model('ips');
  const ipData = await IPModel.saveIpAndGetIpData(ip);
  return ipData._id;
}

schema.statics.getIPByToken = async (token) => {
  const IPModel = mongoose.model('ips');
  const data = await IPModel.findOne({_id: token.trim()});
  return data?data.ip:'';
}

schema.statics.getTokenByIP = async (ip) => {
  const IPModel = mongoose.model('ips');
  const data = await IPModel.findOne({ip: ip.trim()});
  return data?data._id: '';
};

schema.statics.getIPByTokens = async (tokens) => {
  const IPModel = mongoose.model('ips');
  const ips = await IPModel.find({_id: {$in: tokens}});
  const result = {};
  for(const t of tokens) {
    result[t] = t;
  }
  for(const i of ips) {
    result[i._id] = i.ip;
  }
  return result;
};

/*
* 通过ipToken获取ip信息
* @param {String} type 类型 ip，token
* @param {String} value type对应的值
* @return {Object}
*   @param {String} ip
*   @param {String} token
*   @param {String} location 位置信息
* @author pengxiguaa 2020-12-25
* */
schema.statics.getIPInfo = async (type, value) => {
  const IPModel = mongoose.model('ips');
  if(!['ip', '_id'].includes(type)) throwErr(500, `getIPInfo type类型错误`);
  const match = {};
  match[type] = value;
  let ipData = await IPModel.findOne(match);
  if(!ipData) {
    if(type === '_id') throwErr(400, `未找到${value}对应的IP地址`);
    ipData = await IPModel.saveIpAndGetIpData(value);
  }
  // 存在城市编码且时间未超过半年则无需调用ip信息查询接口
  if(ipData.adCode && ipData.tlm && ipData.tlm > (Date.now() - 180 * 24 * 60 * 60 * 1000)) {
    return {
      ip: ipData.ip,
      token: ipData._id,
      location: `${ipData.province} ${ipData.city}`
    };
  }
  const apiFunction = require('../nkcModules/apiFunction');
  let {
    province, city, adcode, rectangle
  } = await apiFunction.getIpAddress(ipData.ip);
  if(typeof adcode !== 'string') {
    province = '';
    city = '';
    adcode = '';
    rectangle = '';
  }
  await ipData.updateOne({
    province,
    city,
    adCode: adcode,
    rectangle,
    tlm: Date.now()
  });
  return {
    ip: ipData.ip,
    token: ipData._id,
    location: (province && city)?`${province} ${city}`: '未知'
  };
};
schema.statics.getIPInfoByToken = async (token) => {
  const IPModel = mongoose.model('ips');
  return await IPModel.getIPInfo('_id', token);
};
/*
*
* */
schema.statics.getIPInfoByIP= async (ip) => {
  const IPModel = mongoose.model('ips');
  return await IPModel.getIPInfo('ip', ip);
};
/*
* 从本地ip库（ip2region）获取ip所在位置
* @param {String} ip
* @param {Boolean} showServiceProvider 是否显示服务商
* @return {Object}
*   @param {String} ip
*   @param {String} location
* @author pengxiguaa 2020-12-25
* */
schema.statics.getIPInfoFromLocal = async (ip, hideServiceProvider = false) => {
  ip = ip || '0.0.0.0';
  const apiFunction = require('../nkcModules/apiFunction');
  let location = '';
  try{
    const {country, province, city, isp} = await apiFunction.getIpInfoFromLocalModule(ip);
    const region = [country, province, city];
    if(!hideServiceProvider) {
      region.push(isp)
    }
    location = region.join(' ');
  } catch(err) {
    location = `${err.message || err.stack || err}`;
  }

  return {
    ip,
    location,
  };
};

/*
* @return {
*   [key: string]: {
*     country: string;
*     province: string;
*     city: string;
*     isp: string;
*   }
* }
* */
schema.statics.getIPInfoObjectById = async (ids) => {
  const IPModel = mongoose.model('ips');
  const apiFunction = require('../nkcModules/apiFunction');
  const ips = await IPModel.find({_id: {$in: ids}}, {
    ip: 1,
    _id: 1,
  });
  const ipsInfo = {};
  for(let i = 0; i < ips.length; i ++) {
    const ip = ips[i];
    const info = await apiFunction.getIpInfoFromLocalModule(ip.ip);
    ipsInfo[ip._id] = {
      ip: ip.ip,
      ...info
    }
  }
  return ipsInfo;
}

schema.statics.getLocalAddr = () => {
  return localAddr;
}

schema.statics.getIpsAddrInfoById = async (ids) => {
  const IPModel = mongoose.model('ips');
  const ipsData = await IPModel.find({_id: {$in: ids}}, {
    ip: 1,
    _id: 1,
  });
  const ipsDataObj = {};
  const ips = [];
  for(const ipData of ipsData) {
    ipData.ip = ipData.ip || '0.0.0.0';
    ipsDataObj[ipData._id] = ipData;
    ips.push(ipData.ip);
  }
  const ipsAddr = await IPModel.getIpsAddrInfo(ips);
  const result = {};
  for(const id of ids) {
    const ipData = ipsDataObj[id];
    let addr = '';
    let ip = '';
    if(ipData) {
      ip = ipData.ip;
      addr = ipsAddr[ip].addr;
    }
    result[id] = {
      ip: ip || '0.0.0.0',
      addr: addr || localAddr
    };
  }
  return result;
}

schema.statics.getIpsAddrInfo = async (ips) => {
  const apiFunction = require('../nkcModules/apiFunction');
  const result = {};
  for(let ip of ips) {
    ip = ip || '0.0.0.0';
    let addr = '';
    try{
      const {
        country,
        province,
      } = await apiFunction.getIpInfoFromLocalModule(ip);
      if(country) {
        if(country === '中国' && !!province) {
          addr = province.replace('省', '');
        } else {
          addr = country;
        }
      }
    } catch(err) {
      //
    }
    addr = addr || localAddr;
    result[ip] = {ip, addr};
  }
  return result;
}

schema.statics.getIpAddr = async (ip) => {
  ip = ip || '0.0.0.0';
  const IPModel = mongoose.model('ips');
  const info = await IPModel.getIpsAddrInfo([ip]);
  return info[ip].addr;
}

schema.statics.getIpByIpId = async (id) => {
  const IPModel = mongoose.model('ips');
  const ipInfo = await IPModel.findOne({_id: id}, {_id: 1, ip: 1});
  return ipInfo? ipInfo.ip: '0.0.0.0';
}


module.exports = mongoose.model('ips', schema);
