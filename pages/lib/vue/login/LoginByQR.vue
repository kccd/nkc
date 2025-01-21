<template lang="pug">
  div(:class="$style.qrContainer")
    div(:class="$style.qrMask" v-if="showQRMask")
      div(v-if="status === statusList.waitingAgree") 已扫码，等待确认
      div(v-else-if="status === statusList.timeout") 二维码已失效
      div(v-else-if="status === statusList.agreed") 已确认
      button.btn.btn-xs.btn-default(@click="resetQR") 重置
    div(:class="$style.loadingMask" v-else-if="showLoadingMask")
      i(class="fa fa-spinner fa-spin")
      //<loading-four :class="$style.iconLoading" theme="outline" size="24" fill="#333" :spin="true" />
    qr(:class="$style.qr" :data-hidden="(!pageUrl).toString()" :text="pageUrl" :width="160")
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
import { LoadingFour } from '@icon-park/vue';
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
    exit: false,
  }),
  components: {
    qr: QR,
    'loading-four': LoadingFour,
  },
  beforeDestroy() {
    this.clearTimer();
    this.exit = true;
  },
  mounted() {
    this.resetQR();
  },
  computed: {
    showQRMask() {
      return [
        this.statusList.waitingAgree,
        this.statusList.timeout,
        this.statusList.agreed,
      ].includes(this.status);
    },
    showLoadingMask() {
      return !this.pageUrl;
    },
  },
  methods: {
    getUrl,
    clearTimer() {
      clearTimeout(this.timer);
    },
    resetQR() {
      this.pageUrl = '';
      this.clearTimer();
      nkcAPI(`/login/qr`, 'GET')
        .then((res) => {
          this.pageUrl = window.location.origin + res.data.url;
          this.qrRecordId = res.data.qrRecordId;
          this.status = this.statusList.waitingScan;
          this.tryLogin();
          logger.debug(`QR LOGIN: ${this.pageUrl}`);
        })
        .catch(sweetError);
    },
    tryLogin() {
      if (this.exit) return;
      this.clearTimer();
      this.timer = setTimeout(() => {
        if (this.qrRecordId) {
          nkcAPI(`/login/qr/${this.qrRecordId}/try`, 'GET', {})
            .then((res) => {
              this.status = res.data.status;
              if (
                [
                  this.statusList.waitingScan,
                  this.statusList.waitingAgree,
                ].includes(this.status)
              ) {
                this.tryLogin();
              } else if (this.status === this.statusList.agreed) {
                this.$emit('logged');
              } else {
                //
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
.loadingMask {
  position: absolute;
  height: 100%;
  font-size: 1.7rem;
  width: 100%;
  background-color: rgba(255, 255, 255, 0);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #555;
}
.qr {
  height: 160px;
  width: 160px;
  &[data-hidden='true'] {
    visibility: hidden;
  }
}
.qrDesc {
  margin-bottom: 1rem;
  font-size: 1rem;
}
</style>
