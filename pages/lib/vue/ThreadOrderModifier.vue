<template lang="pug">
  draggable(ref="draggable" :title="title" max-width="30rem")
    .p-a-1
      .text-center.p-t-3.p-b-3(v-if="loading") 加载中...
      .text-center.p-t-3.p-b-3(v-else-if="errorInfo")
        .text-danger {{errorInfo}}
        button.btn.btn-default.btn-sm(@click="getOrderTime") 重新加载

      .form(v-else)
        .form-group
          label 贴序时间
          input.form-control(v-model.trim="ttoc" type="string")
          .m-t-05
            .btn-group.m-r-1
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.ttoc, -365)") -
              button.btn.btn-default.btn-xs 年
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.ttoc, 365)") +
            .btn-group.m-r-1
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.ttoc, -30)") -
              button.btn.btn-default.btn-xs 月
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.ttoc, 30)") +
            .btn-group
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.ttoc, -1)") -
              button.btn.btn-default.btn-xs 日
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.ttoc, 1)") +
        .form-group
          label 复序时间
          input.form-control(v-model.trim="tlm" type="string")
          .m-t-05
            .btn-group.m-r-1
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.tlm, -365)") -
              button.btn.btn-default.btn-xs 年
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.tlm, 365)") +
            .btn-group.m-r-1
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.tlm, -30)") -
              button.btn.btn-default.btn-xs 月
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.tlm, 30)") +
            .btn-group
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.tlm, -1)") -
              button.btn.btn-default.btn-xs 日
              button.btn.btn-default.btn-xs(@click="setOrderTime(types.tlm, 1)") +
      .text-right
        .pull-left
          button.m-r-05.btn.btn-default.btn-sm(@click="resetOrderTime") 设为默认
        button.m-r-05.btn.btn-default.btn-sm(@click="close") 取消
        button.btn.btn-primary.btn-sm(@click="submit") 提交

</template>

<script>
import Draggable from './publicVue/draggable.vue';
import { HttpMethods, nkcAPI } from "../js/netAPI";
import {sweetError} from "../js/sweetAlert";
import {detailedTime} from '../js/time';

export default {
  components: {
    draggable: Draggable,
  },
  data: () => ({
    types: {
      ttoc: 'ttoc',
      tlm: 'tlm',
    },
    title: '修改排序',
    ttoc: '',
    tlm: '',
    ttocDefault: '',
    tlmDefault: '',
    tid: '',
    callback: null,
    loading: true,
    errorInfo: '',
  }),
  computed: {
    draggable() {
      return this.$refs.draggable;
    },
  },
  methods: {
    detailedTime,
    getOrderTime() {
      this.loading = true;
      nkcAPI(`/api/v1/thread/${this.tid}/order`, HttpMethods.GET)
        .then(res => {
          this.ttoc = this.detailedTime(res.data.ttoc);
          this.tlm = this.detailedTime(res.data.tlm);
          this.ttocDefault = this.detailedTime(res.data.ttocDefault);
          this.tlmDefault = this.detailedTime(res.data.tlmDefault);
        })
        .catch(err => {
          this.errorInfo = err.message || err.error;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    resetOrderTime() {
      this.ttoc = this.ttocDefault;
      this.tlm = this.tlmDefault;
    },
    setOrderTime(type, day) {
      const time = day * 24 * 60 * 60 * 1000;
      if(type === this.types.ttoc) {
        this.ttoc = this.detailedTime(new Date(time + new Date(this.ttoc).getTime()));
      } else {
        this.tlm = this.detailedTime(new Date(time + new Date(this.tlm).getTime()));
      }
    },
    submit() {
      const ttoc = (new Date(this.ttoc)).getTime();
      const tlm = (new Date(this.tlm)).getTime();
      return Promise.resolve()
        .then(() => {
          if(isNaN(ttoc)) {
            throw new Error('贴序时间格式错误');
          }
          if(isNaN(tlm)) {
            throw new Error('复序时间格式错误');
          }
          console.log({ttoc, tlm})
          return nkcAPI(`/api/v1/thread/${this.tid}/order`, HttpMethods.PUT, {
            ttoc,
            tlm,
          });
        })
        .then(() => {
          sweetSuccess("提交成功");
        })
        .catch(sweetError);
    },
    open(callback, props) {
      const {threadId} = props;
      this.callback = callback;
      this.tid = threadId;
      this.draggable.open();
      this.getOrderTime();
    },
    close(){
      this.draggable.close();
    }
  }
}
</script>
