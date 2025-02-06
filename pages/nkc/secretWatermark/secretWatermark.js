import { nkcAPI } from '../../lib/js/netAPI';
import { sweetError } from '../../lib/js/sweetAlert';

new window.Vue({
  el: '#app',
  data: {
    targetId: '',
    text: '',
    uid: '',
    username: '',
    userHomeUrl: '',
    decoding: false,
  },
  computed: {
    disableButton() {
      return !this.targetId || !this.text;
    },
  },
  methods: {
    decode() {
      if (!this.text || !this.targetId) {
        return;
      }
      this.decoding = true;
      nkcAPI(
        `/wm/secret/decode?text=${encodeURIComponent(
          this.text,
        )}&id=${encodeURIComponent(this.targetId)}`,
        'GET',
      )
        .then((res) => {
          if (res.data.targetUser) {
            const { uid, username, homeUrl } = res.data.targetUser;
            this.uid = uid;
            this.username = username;
            this.userHomeUrl = homeUrl;
          } else {
            this.uid = '';
            this.username = '';
            this.userHomeUrl = '';
          }
        })
        .catch(sweetError)
        .finally(() => {
          this.decoding = false;
        });
    },
  },
});
