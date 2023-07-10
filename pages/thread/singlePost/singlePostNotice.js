// 引入 Vue.js 库
import Vue from 'vue';
import Draggable from '../../lib/vue/publicVue/draggable.vue';
import FromNow from '../../lib/vue/FromNow.vue';
import {
  sweetConfirm,
  sweetError,
  sweetPrompt,
  sweetSuccess,
} from '../../lib/js/sweetAlert';
import { objToStr } from '../../lib/js/dataConversion';

let vueInstance; //全局变量
// 创建 Vue 实例
vueInstance = new Vue({
  // Vue 实例的选项和属性
  el: '#notice-dialog',
  data: {
    postNotices: [],
    canEditNotice: false,
    shieldNotice: false,
    postHistory: null,
    dataGlobalData: null,
  },
  mounted() {},
  components: {
    Draggable,
    FromNow,
  },
  methods: {
    checkNotice(pid) {
      return Promise.resolve()
        .then(() => {
          return nkcAPI('/p/' + pid + '/checkNotice', 'GET').then((res) => {
            if (res) {
              const { canEditNotice, shieldNotice, postHistory } =
                res.permission;
              this.canEditNotice = canEditNotice;
              this.shieldNotice = shieldNotice;
              this.postHistory = postHistory;
              this.postNotices = res.postNotices;
            }
            this.$refs.noticeDialog.open();
          });
        })
        .catch((err) => {
          sweetError(err);
        });
    },
    getObjToStr({ uid }) {
      return objToStr({ uid });
    },
    sweetEditNotice(title, nid, content = '') {
      return new Promise((resolve) => {
        Swal.fire({
          title,
          input: 'textarea',
          inputAttributes: {
            autocapitalize: 'off',
            maxlength: 200,
          },
          inputValue: content,
          allowOutsideClick: () => !Swal.isLoading(),
          showCancelButton: true,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showLoaderOnConfirm: true,
          preConfirm: (text) => {
            return nkcAPI('/p/' + nid + '/editNotice', 'PUT', {
              noticeContent: text,
              type: 'post',
            })
              .then(() => {
                resolve(text);
              })
              .catch(({ error }) => {
                Swal.showValidationMessage(error);
              });
          },
        }).then((result) => {
          if (result.value) {
            sweetSuccess('提交成功');
          }
        });
      });
    },
    async editNotice(nid, noticeContent) {
      const newNoticeContent = await this.sweetEditNotice(
        '编辑公告',
        nid,
        noticeContent,
      );
      if (newNoticeContent) {
        this.postNotices.forEach((notice) => {
          if (notice.nid === nid) {
            notice.noticeContent = newNoticeContent;
          }
        });
      }
    },
    async disabledNotice(nid, isShield) {
      if (isShield) {
        sweetPrompt('屏蔽原因').then((reason) => {
          nkcAPI('/p/' + nid + '/shieldNotice', 'PUT', { isShield, reason })
            .then(() => {
              this.postNotices.forEach((item) => {
                if (item.nid === nid) {
                  item.status = 'shield';
                  item.reason = reason;
                }
              });
              sweetSuccess('屏蔽成功');
            })
            .catch((err) => {
              sweetError(err);
            });
        });
      } else {
        sweetConfirm('是否解除屏蔽').then(() => {
          nkcAPI('/p/' + nid + '/shieldNotice', 'PUT', { isShield })
            .then(() => {
              this.postNotices.forEach((item) => {
                if (item.nid === nid) {
                  item.status = 'normal';
                  item.reason = '';
                }
              });
              sweetSuccess('解除屏蔽成功');
            })
            .catch((err) => {
              sweetError(err);
            });
        });
      }
    },
  },
});

window.onload = function () {
  const noticeImg = document.getElementsByClassName('new-post-notice');
  noticeImg.forEach((item) => {
    const parentNode = item.closest('.single-post-container');
    const pid = parentNode.getAttribute('data-pid');
    item.addEventListener('click', () => {
      vueInstance.checkNotice(pid);
    });
  });
};
