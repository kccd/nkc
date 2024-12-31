<template lang="pug">
  div(:class="$style.qrContainer")
    div(:class="$style.qrMask" v-if="showMask")
      div(v-if="status === statusList.waitingAgree") 已扫码，等待确认
      div(v-else-if="status === statusList.timeout") 二维码已失效
      div(v-else-if="status === statusList.agreed") 已确认
      button.btn.btn-xs.btn-default(@click="resetQR") 刷新
    qr(:class="$style.qr" :text="pageUrl" :width="160")
    div(:class="$style.qrDesc")
      | 用&nbsp;
      a(:href="getUrl('appHome')" target="_blank") 科创APP
      | &nbsp;扫描二维码登录
</template>

<script>
import QR from '../qr.vue';
import { getUrl } from '../../js/tools';
import { nkcAPI } from '../../js/netAPI';
import { sweetError } from '../../js/sweetAlert';
import { logger } from '../../js/logger';
export default {
  data: () => ({
    pageUrl: '',
    qrRecordId: '',
    timer: 0,
    status: 'waitingScan',
    statusList: {
      waitingScan: 'waitingScan',
      waitingAgree: 'waitingAgree',
      timeout: 'timeout',
      agreed: 'agreed',
    },
  }),
  components: {
    qr: QR,
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  },
  mounted() {
    this.resetQR();
    this.tryLogin();
  },
  computed: {
    showMask() {
      return [
        this.statusList.waitingAgree,
        this.statusList.timeout,
        this.statusList.agreed,
      ].includes(this.status);
    },
  },
  methods: {
    getUrl,
    resetQR() {
      nkcAPI(`/login/qr`, 'GET')
        .then((res) => {
          this.pageUrl = window.location.origin + res.data.url;
          this.qrRecordId = res.data.qrRecordId;
          this.status = this.statusList.waitingScan;
          logger.debug(`QR LOGIN: ${this.pageUrl}`);
        })
        .catch(sweetError);
    },
    tryLogin() {
      this.timer = setTimeout(() => {
        if (this.qrRecordId) {
          nkcAPI(`/login/qr/${this.qrRecordId}/try`, 'GET', {})
            .then((res) => {
              console.log(res.data);
              this.status = res.data.status;
              if (this.status === this.statusList.agreed) {
                this.$emit('logged');
              } else {
                this.tryLogin();
              }
            })
            .catch((err) => {
              logger.error(err);
              this.tryLogin();
            });
        } else {
          this.tryLogin();
        }
      }, 1000);
    },
  },
};
</script>
<style lang="less" scoped module>
.qrContainer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px solid #cfcfcf;
  border-radius: 3px;
  width: 100%;
  margin: auto auto 1.5rem auto;
  background-color: #f8f8f8;
  position: relative;
}
.qrMask {
  position: absolute;
  height: 100%;
  font-size: 1.4rem;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  button {
    margin-top: 0.5rem;
  }
}
.qr {
  //border: 1px solid #c9c9c9;
}
.qrDesc {
  margin-bottom: 1rem;
  font-size: 1rem;
}
</style>
