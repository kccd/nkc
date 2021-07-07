import {detailedTime} from "../../lib/js/time";

const data = NKC.methods.getDataById('data');
const app = new Vue({
  el: '#app',
  data: {
    usersCodeLogs: data.usersCodeLogs
  },
  methods: {
    detailedTime,
    getUrl: NKC.methods.tools.getUrl,
  }
})