// 引入 Vue.js 库
import Vue from 'vue';
import Draggable from '../../lib/vue/publicVue/draggable.vue';
import { nkcAPI } from '../../lib/js/netAPI';
import FromNow from '../../lib/vue/FromNow.vue';
import {
  sweetConfirm,
  sweetError,
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
          return nkcAPI(`/p/${pid}/notices`, 'GET').then((res) => {
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
    sweetEditNotice(props) {
      const { title, content = '', nid, pid } = props;
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
            return nkcAPI(`/p/${pid}/notice/${nid}/content`, 'PUT', {
              noticeContent: text,
              type: 'post',
            })
              .then((res) => {
                resolve(res.newNotice);
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
    async editNotice(pid, nid, noticeContent) {
      const newNoticeContent = await this.sweetEditNotice({
        title: '编辑公告',
        content: noticeContent,
        nid,
        pid,
      });
      if (newNoticeContent) {
        this.postNotices.forEach((notice) => {
          if (notice.nid === nid) {
            notice.noticeContent = newNoticeContent.noticeContent;
            notice.nid = newNoticeContent.nid;
          }
        });
      }
    },
    async disabledNotice(pid, nid, isShield) {
      const url = `/p/${pid}/notice/${nid}/disabled`;
      const method = 'PUT';
      return new Promise((resolve) => {
        if (isShield) {
          Swal.fire({
            title: '屏蔽公告',
            input: 'textarea',
            inputAttributes: {
              autocapitalize: 'off',
              maxlength: 200,
            },
            inputValue: '',
            allowOutsideClick: () => !Swal.isLoading(),
            showCancelButton: true,
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            showLoaderOnConfirm: true,
            preConfirm: (reason) => {
              return nkcAPI(url, method, {
                isShield,
                reason,
              })
                .then(() => {
                  resolve(reason);
                })
                .catch(({ error }) => {
                  Swal.showValidationMessage(error);
                });
            },
          }).then((result) => {
            if (result.value) {
              this.postNotices.forEach((item) => {
                if (item.nid === nid) {
                  item.status = 'shield';
                  item.reason = result.value;
                }
              });
              sweetSuccess('屏蔽成功');
            }
          });
        } else {
          sweetConfirm('是否解除屏蔽').then(() => {
            nkcAPI(url, method, { isShield })
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
      });
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
