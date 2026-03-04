import { nkcAPI } from '../lib/js/netAPI';
import { sweetError } from '../lib/js/sweetAlert';
import { getDataById } from '../lib/js/dataConversion';
const data = getDataById('data');

const app = new window.Vue({
  el: '#app',
  data: {
    radioStations: [],
    radioName: data.radioName,
    radioDescription: data.radioDescription,

    loading: true,
  },
  mounted() {
    this.startAuthUpdate();
  },
  methods: {
    startAuthUpdate() {
      this.getRadioStations().then(() => {
        setTimeout(() => {
          this.startAuthUpdate();
        }, 10 * 1000);
      });
    },
    getRadioStations() {
      return nkcAPI(`/receivers/stations`, 'GET')
        .then((res) => {
          this.radioStations = res.data.radioStations;
        })
        .catch((err) => {
          console.error(err);
        });
    },
  },
});
