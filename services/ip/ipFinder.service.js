const SettingModel = require('../../dataModels/SettingModel');
const IPModel = require('../../dataModels/IPModel');
const path = require('path');
const { IPv4, newWithFileOnly } = require('ip2region.js');
const { countryMap } = require('../../settings/countryMapping');

class IPFinderService {
  cityLookup = null;
  localAddr = '未同步';

  searcher = null;

  // 初始化
  tryToInitSearcher = async () => {
    if (this.searcher === null) {
      this.searcher = await newWithFileOnly(
        IPv4,
        path.resolve(__dirname, '../../geo/ip2region_v4.xdb'),
      );
    }
    return this.searcher;
  };

  // 判断IP是否为内网IP
  isPrivateIP = (ip) => {
    return (
      /^10\./.test(ip) ||
      /^192\.168\./.test(ip) ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
      /^127\./.test(ip) ||
      /^169\.254\./.test(ip)
    );
  };

  // 获取详细地址信息
  getIpInfo = async (ip) => {
    const searcher = await this.tryToInitSearcher();
    const geo = await searcher.search(ip);
    const [_c, region, city, _y, contryCode] = geo.split('|');
    const country = countryMap[contryCode] || contryCode || '';
    const ip138Url = `https://site.ip138.com/${ip}`;

    return {
      ip,
      country,
      region: region === '0' ? '' : region,
      city: city === '0' ? '' : city,
      googleMapUrl: '',
      gaodeMapUrl: '',
      ip138Url,
    };
  };

  // 获取简略地址信息
  // 中国大陆返回省份，其他国家返回国家名
  getIpAddressAbbr = async (ip = '') => {
    try {
      // 这里传入的ip后面可能包含了:port，所以需要先去掉端口部分
      ip = ip.split(':')[0];
      if (this.isPrivateIP(ip)) {
        return this.localAddr;
      }
      const { country, region, city } = await this.getIpInfo(ip);
      if (country === '中国') {
        return `${region || city || country}`;
      } else if (!country) {
        return this.localAddr;
      } else {
        return `${country}`;
      }
    } catch (e) {
      return '未知';
    }
  };

  // 保存ip并返回token
  saveIpAndGetToken = async (ip = '') => {
    let ipData = await IPModel.findOne({ ip }, { _id: 1 }).sort({ tlm: -1 });
    if (!ipData) {
      ipData = IPModel({
        _id: await SettingModel.newObjectId(),
        ip,
      });
      await ipData.save();
    }
    return ipData._id;
  };

  // 通过token获取ip
  getIPByToken = async (token) => {
    const ipData = await IPModel.findOne({ _id: token }, { ip: 1 });
    if (ipData) {
      return ipData.ip;
    } else {
      return '';
    }
  };

  // 同时获取多个token对应的ip
  getIPMapByTokens = async (tokens) => {
    const ips = await IPModel.find({ _id: { $in: tokens } });
    const ipMap = new Map();
    for (const ipData of ips) {
      ipMap.set(ipData._id, ipData.ip);
    }
    return ipMap;
  };

  // 同时获取多个ip对应的地址信息
  getIPInfoMapByIPs = async (ips) => {
    const ipMap = new Map();
    for (const ip of ips) {
      ipMap.set(ip, await this.getIpInfo(ip));
    }
    return ipMap;
  };

  // 通过ip获取token
  getTokenByIP = async (ip) => {
    const ipData = await IPModel.findOne({
      $or: [{ ip: ip.trim() }, { _id: ip.trim() }],
    });
    return ipData ? ipData._id : '';
  };
}

module.exports = {
  ipFinderService: new IPFinderService(),
};
