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

    removeRadioStation(index) {
      sweetQuestion('确定移除当前节点吗？').then(() => {
        this.radioSettings.stations.splice(index, 1);
      });
    },

    addRadioStation() {
      this.radioSettings.stations.push({
        id: createUniqueId(this.radioSettings.stations),
        name: '',
        clientType: 'openwebrx',
        connection: '',
        disabled: false,
        maxUsers: 10,
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
        if (!station.name || !station.connection) {
          sweetError('请确保所有节点的名称和连接地址都已填写');
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
