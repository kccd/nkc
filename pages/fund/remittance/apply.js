import PostPanel from '../postPanel';
import { getUrl } from '../../lib/js/tools';
import { nkcAPI } from '../../lib/js/netAPI';
import {
  sweetError,
  sweetPrompt,
  sweetQuestion,
} from '../../lib/js/sweetAlert';
import { screenTopAlert } from '../../lib/js/topAlert';
import { getState } from '../../lib/js/state';
import Vue from 'vue';
import { getDataById } from '../../lib/js/dataConversion';

const state = getState();
const data = getDataById('data');
new Vue({
  el: '#applyApp',
  data: {
    uid: state.uid,
    form: data.form,
    selectedPosts: [],
    content: '',
    number: data.number,
    showPostPanel: false,
  },
  components: {
    'post-panel': PostPanel,
  },
  computed: {
    selectedPostsId() {
      return this.selectedPosts.map((s) => s.pid);
    },
  },
  methods: {
    getUrl,

    applyRemittance() {
      const { content, number, form, selectedPosts } = this;

      window
        .sendMessage()
        .then(() => {
          return sweetPrompt('请输入短信验证码：');
        })
        .then((code) => {
          return nkcAPI(`/fund/a/${form._id}/remittance/apply`, 'POST', {
            code,
            number,
            c: content,
            selectedThreads: selectedPosts.map((s) => s.tid),
          });
        })
        .then(() => {
          window.location.reload();
        })
        .catch(sweetError);
    },
    removeFromArr(arr, index) {
      arr.splice(index, 1);
    },
    selectPost(p) {
      const { selectedPosts, selectedPostsId } = this;
      if (selectedPostsId.includes(p.pid)) {
        return;
      }
      selectedPosts.push(p);
    },
    switchPostPanel() {
      this.showPostPanel = !this.showPostPanel;
    },
  },
});

window.verifyRemittance = (number, formId) => {
  return sweetQuestion(`确定要执行此操作吗？`)
    .then(() => {
      return nkcAPI('/fund/a/' + formId + '/remittance/verify', 'PUT', {
        number: number,
      });
    })
    .then(function () {
      window.location.reload();
    })
    .catch(sweetError);
};

window.sendMessage = () => {
  return nkcAPI(`/sendMessage/withdraw`, 'POST', {}).then(() => {
    screenTopAlert(`验证码发送成功`);
  });
};

window.applyRemittance = (number, formId) => {
  window
    .sendMessage()
    .then(() => {
      return sweetPrompt('请输入短信验证码：');
    })
    .then((code) => {
      return nkcAPI(`/fund/a/${formId}/remittance/apply`, 'POST', {
        number,
        code,
      });
    })
    .then(() => {
      window.location.reload();
    })
    .catch(sweetError);
};
