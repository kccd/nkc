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

console.log(data);

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
    page: 'settings', // settings, stations
    radioStations: data.radioStations || [],

    radioStationsLoading: false,
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
      // 检测服务是否正常
    },

    switchPage(page) {
      if (page === 'stations') {
        this.getRadioStations();
      }
      this.page = page;
    },

    getRadioStations() {
      this.radioStationsLoading = true;
      nkcAPI(`/e/settings/radio`, 'GET')
        .then((res) => {
          this.radioStations = res.radioStations;
          console.log(this.radioStations);
        })
        .catch((err) => {
          sweetError(`获取节点列表失败: ${err.message}`);
        })
        .finally(() => {
          this.radioStationsLoading = false;
        });
    },

    removeRadioStation(index) {
      sweetQuestion('确定移除当前节点吗？').then(() => {
        this.radioStations.splice(index, 1);
      });
    },

    addRadioStation() {
      this.radioStations.push({
        name: '',
        clientType: 'openwebrx',
        connection: '',
        disabled: false,
      });
    },

    moveRadioStationUp(index) {
      if (index <= 0) {
        return;
      }
      const prev = this.radioStations[index - 1];
      this.$set(this.radioStations, index - 1, this.radioStations[index]);
      this.$set(this.radioStations, index, prev);
    },

    moveRadioStationDown(index) {
      if (index >= this.radioStations.length - 1) {
        return;
      }
      const next = this.radioStations[index + 1];
      this.$set(this.radioStations, index + 1, this.radioStations[index]);
      this.$set(this.radioStations, index, next);
    },

    saveRadioStations() {
      for (const station of this.radioStations) {
        if (!station.name || !station.connection) {
          sweetError('请确保所有节点的名称和连接地址都已填写');
          return;
        }
      }
      nkcAPI(`/e/settings/radio`, 'PUT', {
        type: 'stations',
        stations: this.radioStations,
      })
        .then(() => {
          sweetSuccess('保存成功');
        })
        .catch((err) => {
          sweetError(err.message);
        });
    },

    submit() {
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
