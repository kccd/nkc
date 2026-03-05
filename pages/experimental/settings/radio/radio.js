import { getDataById } from '../../../lib/js/dataConversion';
import {
  sweetSuccess,
  sweetError,
  sweetQuestion,
} from '../../../lib/js/sweetAlert';
import { nkcAPI } from '../../../lib/js/netAPI';
import UserSelector from '../../../lib/vue/UserSelector.vue';
import { getUrl } from '../../../lib/js/tools';
const data = getDataById('data');

const createId = () => {
  return `${Math.random().toString(16).slice(2)}`;
};

const createUniqueId = (list = []) => {
  const idSet = new Set(list.map((item) => item && item.id).filter(Boolean));
  let id = createId();
  let retry = 0;
  while (idSet.has(id)) {
    id = createId();
    retry += 1;
    if (retry > 1000) {
      throw new Error('无法生成唯一ID');
    }
  }
  return id;
};

/* 
type IRadioStation = {
  client: 'openwebrx';
  name: string;
  user_cut: number;
  
}
*/

const app = new window.Vue({
  el: '#app',
  components: {
    'user-selector': UserSelector,
  },
  data: {
    radioSettings: data.radioSettings,
    adminUsers: data.adminUsers,
    stationNameMax: 64,
    stationBriefMax: 140,
    stationDescriptionMax: 500,
    checkingService: false,
  },
  computed: {
    selectedUsersId() {
      return this.adminUsers.map((u) => u.uid);
    },
  },
  methods: {
    getUrl,
    addAdmin() {
      this.$refs.userSelector.open((res) => {
        for (const u of res.users) {
          if (!this.selectedUsersId.includes(u.uid)) {
            this.adminUsers.push({
              uid: u.uid,
              username: u.username,
              avatar: u.avatar,
            });
          }
        }
        this.$refs.userSelector.close();
      });
    },
    removeAdmin(uid) {
      const index = this.adminUsers.findIndex((u) => u.uid === uid);
      if (index > -1) {
        this.adminUsers.splice(index, 1);
      }
    },

    checkService() {
      const newServiceUrl = this.radioSettings.serviceUrl;
      if (this.checkingService || !newServiceUrl) {
        return;
      }
      this.checkingService = true;
      nkcAPI('/e/settings/radio/check-service', 'POST', {
        serviceUrl: newServiceUrl,
      })
        .then((res) => {
          const status = res && res.data && res.data.status;
          const message =
            (res && res.data && res.data.message) || '检测服务失败，请稍后再试';
          if (status === 'ok') {
            sweetSuccess('服务正常');
            return;
          }
          if (status === 'error') {
            sweetError(message);
            return;
          }
          sweetError('检测服务返回异常');
        })
        .catch((err) => {
          sweetError(err.message || err);
        })
        .finally(() => {
          this.checkingService = false;
        });
    },

    removeRadioStation(index) {
      sweetQuestion('确定移除当前站点吗？').then(() => {
        this.radioSettings.stations.splice(index, 1);
      });
    },

    addRadioStation() {
      this.radioSettings.stations.push({
        id: createUniqueId(this.radioSettings.stations),
        name: '',
        brief: '',
        description: '',
        clientType: 'openwebrx',
        connection: '',
        disabled: false,
        maxUsers: 10,
        userMaxConnection: 1,
      });
    },

    moveRadioStationUp(index) {
      if (index <= 0) {
        return;
      }
      const prev = this.radioSettings.stations[index - 1];
      this.$set(
        this.radioSettings.stations,
        index - 1,
        this.radioSettings.stations[index],
      );
      this.$set(this.radioSettings.stations, index, prev);
    },

    moveRadioStationDown(index) {
      if (index >= this.radioSettings.stations.length - 1) {
        return;
      }
      const next = this.radioSettings.stations[index + 1];
      this.$set(
        this.radioSettings.stations,
        index + 1,
        this.radioSettings.stations[index],
      );
      this.$set(this.radioSettings.stations, index, next);
    },

    submit() {
      for (const station of this.radioSettings.stations) {
        if (!station.name) {
          sweetError('站点名称不能为空');
          return;
        }
        if (station.name && station.name.length > this.stationNameMax) {
          sweetError(`站点名称不能超过 ${this.stationNameMax} 字`);
          return;
        }
        if (!station.connection) {
          sweetError('连接地址不能为空');
          return;
        }
        if (Number(station.maxUsers) < 0) {
          sweetError('最大连接数不能小于0');
          return;
        }
        if (Number(station.userMaxConnection) < 1) {
          sweetError('同一用户最大连接数不能小于1');
          return;
        }
        if (station.brief && station.brief.length > this.stationBriefMax) {
          sweetError(`站点简介不能超过 ${this.stationBriefMax} 字`);
          return;
        }
        if (
          station.description &&
          station.description.length > this.stationDescriptionMax
        ) {
          sweetError(`站点说明不能超过 ${this.stationDescriptionMax} 字`);
          return;
        }
      }
      const admin = this.selectedUsersId;
      nkcAPI(`/e/settings/radio`, 'PUT', {
        type: 'settings',
        radioSettings: {
          ...this.radioSettings,
          admin,
        },
      })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch((err) => {
          sweetError(err.message);
        });
    },
  },
});
