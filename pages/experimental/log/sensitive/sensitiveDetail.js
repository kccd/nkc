import Vue from 'vue';
import { nkcAPI } from '../../../lib/js/netAPI';
import { getUrl } from '../../../lib/js/tools';
import { getDataById } from '../../../lib/js/dataConversion';
import {
  sweetSuccess,
  sweetError,
  sweetQuestion,
} from '../../../lib/js/sweetAlert';

const data = getDataById('data');
new Vue({
  el: '#app',
  data: {
    log: data.log,
    results: data.results,
    selectedIds: [],
  },
  computed: {
    selectedAll() {
      return this.selectedIds.length === this.results.length;
    },
  },
  methods: {
    getUrl,
    clearInfo(targetIds) {
      const { type } = this.log;
      const targets = [];
      for (const targetId of targetIds) {
        targets.push({
          type,
          targetId,
        });
      }
      sweetQuestion('您正在执行敏感内容清理操作，该操作不可逆，是否继续？')
        .then(() => {
          return nkcAPI('/e/log/sensitive', 'POST', {
            type: 'clearInfo',
            targets,
          });
        })
        .then(() => {
          sweetSuccess('提交成功');
          /*setTimeout(() => {
            window.location.reload();
          }, 1000);*/
        })
        .catch(sweetError);
    },
    // 这个函数的作用是选择全部的项目
    // 先判断是否已经全选，如果是全选，就取消全选
    selectAll() {
      const { results } = this;
      if (this.selectedAll) {
        this.selectedIds = [];
      } else {
        this.selectedIds = results.map((r) => r.targetId);
      }
    },
    clearSelectedInfo() {
      this.clearInfo(this.selectedIds);
    },
    clearAllInfo() {
      const { _id } = this.log;
      sweetQuestion('您正在执行敏感内容清理操作，该操作不可逆，是否继续？')
        .then(() => {
          return nkcAPI('/e/log/sensitive', 'POST', {
            type: 'clearAllInfo',
            logId: _id,
          });
        })
        .then(() => {
          sweetSuccess('提交成功');
          /*setTimeout(() => {
            window.location.reload();
          }, 1000);*/
        })
        .catch(sweetError);
    },
  },
});
