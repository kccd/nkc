import {getDataById} from "../../lib/js/dataConversion";
import {nkcAPI} from "../../lib/js/netAPI";
import {sweetError} from "../../lib/js/sweetAlert";
import {getSize} from "../../lib/js/tools";
import {screenTopAlert} from "../../lib/js/topAlert";

const {
  totalMemory,
  usedMemory,
  disks,
  cpuUsage,
} = getDataById('osData');
const app = new Vue({
  el: '#osApp',
  data: {
    loading: false,
    timer: null,
    totalMemory,
    usedMemory,
    disks,
    cpuUsage,
  },
  methods: {
    getSize,
    getOSInfo() {
      const self = this;
      this.loading = true;
      return nkcAPI('/nkc/os?t=data', 'GET')
        .then(data => {
          self.cpuUsage = data.cpuUsage;
          self.disks = data.disks;
          self.totalMemory = data.totalMemory;
          self.usedMemory = data.usedMemory;
        })
        .then(() => {
          screenTopAlert('刷新成功')
        })
        .catch(sweetError)
        .finally(() => {
          this.loading = false;
        })
    }
  },
  computed: {
    cpuBarStyle() {
      return `width: ${this.cpuUsage}%`
    },
    memoryBarStyle() {
      const width = Math.round((this.usedMemory / this.totalMemory) * 1000) / 10;
      return `width: ${width}%`;
    }
  }
})
