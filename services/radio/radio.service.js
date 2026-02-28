const SettingModel = require('../../dataModels/SettingModel');
const { settingIds } = require('../../settings/serverSettings');

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
        url: `/radio/${s.client}/${s.id}`,
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
        name: station.name,
        client: station.clientType,
        conn: station.connection,
        disabled: !!station.disabled,
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
}

module.exports = {
  radioService: new RadioService(),
};
