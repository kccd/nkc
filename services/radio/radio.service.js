const SettingModel = require('../../dataModels/SettingModel');
const { ThrowCommonError } = require('../../nkcModules/error');
const UsersPersonalModel = require('../../dataModels/UsersPersonalModel');
const { settingIds } = require('../../settings/serverSettings');
const { ipFinderService } = require('../ip/ipFinder.service');

class RadioService {
  getRadioStations = async () => {
    const { serviceUrl } = await SettingModel.getSettings(settingIds.radio);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10 * 1000);

    try {
      const res = await fetch(`${serviceUrl}/sdr-link-api/list`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        const errText = contentType.includes('application/json')
          ? JSON.stringify(await res.json())
          : await res.text();
        throw new Error(
          `getRadioStations 请求失败 ${res.status} ${res.statusText} - ${errText}`,
        );
      }

      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`getRadioStations 返回非JSON: ${text}`);
      }

      const resJson = await res.json();
      if (resJson.code !== 200) {
        throw new Error(resJson.msg);
      }
      const originStations = resJson.data;
      return originStations.map((s) => ({
        id: s.id,
        connection: s.conn,
        onlineUsers: s.user_cut,
        clientType: s.client, // openwebrx
        name: s.name,
        disabled: s.disabled,
        maxUsers: s.max_user,
        url: `/radio/${s.client}/${s.id}/`,
      }));
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('getRadioStations 请求超时');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  updateRadioStations = async (stations) => {
    const { serviceUrl } = await SettingModel.getSettings(settingIds.radio);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10 * 1000);
    const payload = (Array.isArray(stations) ? stations : []).map(
      (station) => ({
        id: station.id,
        name: station.name,
        client: station.clientType,
        conn: station.connection,
        disabled: !!station.disabled,
        max_user: station.maxUsers,
      }),
    );

    try {
      const res = await fetch(`${serviceUrl}/sdr-link-api/add/conn`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok) {
        const errText = contentType.includes('application/json')
          ? JSON.stringify(await res.json())
          : await res.text();
        throw new Error(
          `updateRadioStations 请求失败 ${res.status} ${res.statusText} - ${errText}`,
        );
      }

      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`updateRadioStations 返回非JSON: ${text}`);
      }

      const resJson = await res.json();
      if (resJson.code !== 200) {
        throw new Error(resJson.msg);
      }
      return resJson;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('updateRadioStations 请求超时');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // 获取用户的电台访问权限
  /* 
  type IRadioPermission = {
    accessable: boolean; // 是否允许访问
    reasonType: 
      "adminAllowed" |
      "userAllowed" |
      "radioHasBeenDisabled" |
      "visitorNotAllowed" |
      "authLevelNotEnough" |
      "onlyAllowChineseMobile" |
      "onlyAllowChineseIP"; // 不允许访问时的原因类型
    reasonMessage: string; // 不允许访问时的原因描述  
  }
  */
  getUserRadioPermission = async (props) => {
    const { uid, ip } = props;
    const radioSettings = await SettingModel.getSettings(settingIds.radio);
    // 检测电台功能是否被关闭
    if (!radioSettings.enabled) {
      return {
        accessable: false,
        reasonType: 'radioHasBeenDisabled',
        reasonMessage: '电台功能已关闭',
      };
    }
    // 检测用户是否为管理员
    if (radioSettings.admin.includes(props.uid)) {
      return {
        accessable: true,
        reasonType: 'adminAllowed',
        reasonMessage: '允许管理员访问',
      };
    }
    // 检测是否限制游客访问
    if (!uid && !radioSettings.permission.allowVisitor) {
      return {
        accessable: false,
        reasonType: 'visitorNotAllowed',
        reasonMessage: '不允许游客访问',
      };
    }
    // 检测最小身份认证等级
    const usersPersonal = await UsersPersonalModel.findOne({ uid });
    if (!usersPersonal) {
      ThrowCommonError(500, `用户${uid}不存在`);
    }
    const authLevel = await usersPersonal.getAuthLevel();
    if (authLevel < radioSettings.permission.getAuthLevel) {
      return {
        accessable: false,
        reasonType: 'authLevelNotEnough',
        reasonMessage: `身份认证等级不足，请最少完成身份认证${radioSettings.permission.getAuthLevel}`,
      };
    }
    // 检测是否仅允许中国大陆手机号访问
    if (
      radioSettings.permission.authLevel > 0 &&
      radioSettings.permission.onlyAllowChineseMobile &&
      usersPersonal.nationCode !== '86'
    ) {
      return {
        accessable: false,
        reasonType: 'onlyAllowChineseMobile',
        reasonMessage: '仅允许中国大陆手机号认证的用户访问',
      };
    }
    // 检测是否仅允许国内IP访问
    if (radioSettings.permission.onlyAllowChineseIP) {
      const isPrivateIP = await ipFinderService.isPrivateIP(ip);
      if (!isPrivateIP) {
        // 排除内网IP
        const ipInfo = await ipFinderService.getIpInfo(ip);
        if (ipInfo.country !== '中国') {
          return {
            accessable: false,
            reasonType: 'onlyAllowChineseIP',
            reasonMessage: '仅允许国内IP访问',
          };
        }
      }
    }

    // 放行
    return {
      accessable: true,
      reasonType: 'userAllowed',
      reasonMessage: '允许用户访问',
      uid,
    };
  };
}

module.exports = {
  radioService: new RadioService(),
};
