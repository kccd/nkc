const maxmind = require('maxmind');
const SettingModel = require('../../dataModels/SettingModel');
const IPModel = require('../../dataModels/IPModel');
const path = require('path');

class IPFinderService {
  cityLookup = null;
  localAddr = '未同步';

  // 获取详细地址信息
  getIpInfo = async (ip) => {
    if (this.cityLookup === null) {
      this.cityLookup = await maxmind.open(
        path.resolve(__dirname, '../../geo/GeoLite2-City.mmdb'),
      );
    }
    const geo = ip ? this.cityLookup.get(ip) : null;
    let country = '';
    let region = '';
    let city = '';
    let googleMapUrl = '';
    let gaodeMapUrl = '';
    let ip138Url = '';
    if (geo) {
      if (geo.country && geo.country.names) {
        country = geo.country.names['zh-CN'] || geo.country.names.en || country;
      }
      if (
        geo.subdivisions &&
        geo.subdivisions.length > 0 &&
        geo.subdivisions[0].names
      ) {
        region =
          geo.subdivisions[0].names['zh-CN'] ||
          geo.subdivisions[0].names.en ||
          region;
      }
      if (geo.city && geo.city.names) {
        city = geo.city.names['zh-CN'] || geo.city.names.en || city;
      }
      if (geo.location && geo.location.latitude && geo.location.longitude) {
        googleMapUrl = `https://www.google.com/maps?q=${geo.location.latitude},${geo.location.longitude}`;
        gaodeMapUrl = `https://uri.amap.com/marker?position=${geo.location.longitude},${geo.location.latitude}`;
        ip138Url = `https://site.ip138.com/${ip}`;
      }
    }
    return {
      ip,
      country,
      region,
      city,
      googleMapUrl,
      gaodeMapUrl,
      ip138Url,
    };
  };

  // 获取简略地址信息
  // 中国大陆返回省份，其他国家返回国家名
  getIpAddressAbbr = async (ip) => {
    const { country, region, city } = await this.getIpInfo(ip);
    if (country === '中国') {
      return `${region || city || country}`;
    } else if (!country) {
      return this.localAddr;
    } else {
      return `${country}`;
    }
  };

  // 保存ip并返回token
  saveIpAndGetToken = async (ip) => {
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
