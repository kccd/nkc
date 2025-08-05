import { sweetError } from '../lib/js/sweetAlert';
import { nkcAPI } from '../lib/js/netAPI';
import { screenTopAlert, screenTopWarning } from '../lib/js/topAlert';
import { initNKCSource } from '../lib/js/nkcSource';
import { getUrl } from '../lib/js/tools';
import { markdownToHTML } from '../lib/js/dataConversion';
import MomentFiles from '../lib/vue/zone/MomentFiles';

var data = window.NKC.methods.getDataById('data');
var pid = [];
var did = [];
var nid = [];
var aid = [];
var review = {};
const auditDescriptionObject = {};
for (var i = 0; i < data.results.length; i++) {
  if (['thread', 'post'].includes(data.results[i].type)) {
    var p = data.results[i].post.pid;
    var tid = data.results[i].thread.tid;
    var isThread = data.results[i].thread.oc === p;
    pid.push(p);
    review[p] = {
      pid: p,
      pass: true,
      reason: '',
      delType: 'toDraft',
      isThread: isThread,
      noticeType: true,
      illegalType: false,
      threadId: tid,
    };
  } else if (data.results[i].type === 'document') {
    let d = data.results[i].document.did;
    let documentId = data.results[i].document._id;
    let source = data.results[i].document.source;
    let aid = data.results[i].content._id;
    did.push(documentId);
    review[documentId] = {
      documentId: documentId,
      did: d,
      pass: true,
      reason: '',
      delType: source !== 'moment' ? 'faulty' : 'deleted',
      noticeType: true,
      illegalType: false,
      articleId: aid,
      resetPostCount: '',
    };
  } else if (data.results[i].type === 'note') {
    let n = data.results[i].note._id;
    nid.push(n);
    review[n] = {
      noteId: n,
      pass: true,
      reason: '',
      delType: 'disabled',
      noticeType: true,
      illegalType: false,
    };
  } else if (data.results[i].type === 'userAudit') {
    let item = data.results[i].userAudit._id;
    aid.push(item);
    review[item] = {
      noteId: item,
      pass: true,
      reason: '',
      delType: 'disabled',
      noticeType: true,
      illegalType: false,
    };
    const description = data.results[i].userAudit.description;
    if (description) {
      auditDescriptionObject[item] = markdownToHTML(description, {});
    }
  }
}
var app = new window.Vue({
  el: '#app',
  data: {
    selectedPid: [],
    selectedDid: [],
    selectedNid: [],
    selectedAid: [],
    showInputPid: [],
    pid: pid,
    did: did,
    nid: nid,
    aid: aid,
    review: review,
    auditDescriptionObject: auditDescriptionObject,
    results: data.results,
  },
  components: {
    'moment-files': MomentFiles,
  },
  mounted() {
    initNKCSource();
  },
  methods: {
    getUrl,
    viewImage(data) {
      const { name = '', url = '' } = data;
      const images = [
        {
          name,
          url,
        },
      ];
      const readyFiles = images.map((item) => {
        return { ...item, type: 'picture' };
      });
      window.RootApp.$refs.preview.setData(true, 0, readyFiles);
      window.RootApp.$refs.preview.init(0);
    },
    selectAll: function () {
      if (this.selectedPid.length === this.pid.length) {
        this.selectedPid = [];
      } else {
        this.selectedPid = [].concat(this.pid);
      }
      if (this.selectedDid.length === this.did.length) {
        this.selectedDid = [];
      } else {
        this.selectedDid = [].concat(this.did);
      }
      if (this.selectedNid.length === this.nid.length) {
        this.selectedNid = [];
      } else {
        this.selectedNid = [].concat(this.nid);
      }
      this.selectedAid =
        this.selectedAid.length === this.aid.length ? [] : this.aid.slice();
    },
    //提交document审核
    document(arr, index) {
      let data = arr[index];
      if (!data) {
        return;
      }
      let d,
        url,
        method = 'PUT';
      if (data.pass) {
        d = {
          pass: data.pass,
          docId: data.documentId,
          type: 'document',
        };
        url = '/review';
      } else {
        d = {
          type: 'document',
          pass: data.pass,
          docId: data.documentId,
          did: [data.did],
          reason: data.reason,
          delType: data.delType,
          remindUser: data.noticeType,
          violation: data.illegalType,
        };
        method = 'PUT';
        url = '/review';
      }
      nkcAPI(url, method, d)
        .then(function () {
          screenTopAlert('DocumentId: ' + data.documentId + ' 处理成功!');
          app.document(arr, index + 1);
        })
        .catch(function (data) {
          screenTopWarning(
            'DocumentId: ' +
              data.documentId +
              ' 处理失败! error: ' +
              data.error || data,
          );
          app.document(arr, index + 1);
        });
    },
    //提交post审核
    post: function (arr, index) {
      let data = arr[index];
      if (!data) {
        return;
      }
      let d,
        url,
        method = 'PUT';
      if (data.pass) {
        // 通过
        d = {
          pid: data.postId,
          type: 'post',
        };
        url = '/review';
      } else {
        // 不通过
        // 送回收站
        if (data.delType === 'toRecycle') {
          /*d = {
            fid: "recycle",
            para: data
          };*/
          d = {
            postsId: [data.postId],
            reason: data.reason,
            remindUser: data.noticeType,
            violation: data.illegalType, //是否违规
          };
          method = 'POST';
          // url = "/t/" + data.threadId + "/disabled";
          url = '/threads/recycle';
        } else {
          //退修
          /*d = {
            para: data
          };*/
          d = {
            postsId: [data.postId],
            reason: data.reason,
            remindUser: data.noticeType,
            violation: data.illegalType,
          };
          // url = "/t/" + data.threadId + "/moveDraft";
          url = '/threads/draft';
          method = 'POST';
        }
      }

      return nkcAPI(url, method, d)
        .then(function () {
          screenTopAlert('PID: ' + data.postId + ' 处理成功!');
          app.post(arr, index + 1);
        })
        .catch(function (data) {
          screenTopWarning(
            'PID: ' + data.postId + ' 处理失败! error: ' + data.error || data,
          );
          console.log(data);
          app.post(arr, index + 1);
        });
    },

    // 提交note审核
    note: function (arr, index) {
      let data = arr[index];
      if (!data) {
        return;
      }
      let d,
        url,
        method = 'PUT';
      if (data.pass) {
        d = {
          pass: data.pass,
          noteId: data.noteId,
          type: 'note',
        };
        url = '/review';
      } else {
        d = {
          type: 'note',
          pass: data.pass,
          noteId: data.noteId,
          reason: data.reason,
          delType: data.delType,
          remindUser: data.noticeType,
          violation: data.illegalType,
        };
        method = 'PUT';
        url = '/review';
      }
      nkcAPI(url, method, d)
        .then(function () {
          screenTopAlert('noteId: ' + data.noteId + '处理成功');
          app.note(arr, index + 1);
        })
        .catch(function (data) {
          screenTopWarning(
            'noteId: ' + data.noteId + '处理失败! error: ' + data.error || data,
          );
          app.note(arr, index + 1);
        });
    },
    userAudit(arr, index = 0) {
      const data = arr[index];
      if (!data) {
        return;
      }
      const payload = {
        type: 'userAudit',
        pass: data.pass,
        auditId: data.userAuditId,
        ...(data.pass
          ? {}
          : {
              reason: data.reason,
              remindUser: data.noticeType,
              violation: data.illegalType,
            }),
      };
      nkcAPI('/review', 'PUT', payload)
        .then(() => {
          screenTopAlert(`UserAudit ${data.userAuditId} 处理成功`);
          this.userAudit(arr, index + 1);
        })
        .catch((err) => {
          screenTopWarning(
            `UserAudit ${data.userAuditId} 处理失败: ${err.error || err}`,
          );
          this.userAudit(arr, index + 1);
        });
    },
    submit: function (id, type) {
      const self = this;
      Promise.resolve()
        .then(() => {
          if (self.selectedPid.length !== 0 || (id && type === 'post')) {
            let pidArr;
            if (typeof id === 'string') {
              // 提交单个
              pidArr = [id];
            } else {
              // 提交多个
              pidArr = self.selectedPid;
            }
            let arr = [];
            for (let i = 0; i < pidArr.length; i++) {
              let reviewData = self.review[pidArr[i]];
              arr.push({
                pass: reviewData.pass,
                reason: reviewData.reason,
                delType: reviewData.delType,
                postType: reviewData.isThread ? 'thread' : 'post',
                threadId: reviewData.threadId,
                postId: reviewData.pid,
                noticeType: reviewData.noticeType,
                illegalType: reviewData.illegalType,
              });
            }
            return self.post(arr, 0);
          }
          // return;
        })
        .then(() => {
          if (self.selectedDid.length !== 0 || (id && type === 'document')) {
            let didArr;
            if (typeof id === 'string') {
              //提交单个
              didArr = [id];
            } else {
              didArr = self.selectedDid;
            }
            let arr = [];
            for (let i = 0; i < didArr.length; i++) {
              let reviewData = self.review[didArr[i]];
              arr.push({
                documentId: reviewData.documentId,
                did: reviewData.did,
                pass: reviewData.pass,
                reason: reviewData.reason,
                delType: reviewData.delType,
                articleId: reviewData.articleId,
                noticeType: reviewData.noticeType,
                illegalType: reviewData.illegalType,
              });
            }
            self.document(arr, 0);
          }
        })
        .then(() => {
          if (self.selectedNid.length !== 0 || (id && type === 'note')) {
            let nidArr;
            if (typeof id === 'string') {
              //提交单个
              nidArr = [id];
            } else {
              nidArr = self.selectedNid;
            }
            let arr = [];
            for (let i = 0; i < nidArr.length; i++) {
              let reviewData = self.review[nidArr[i]];
              arr.push({
                noteId: reviewData.noteId,
                pass: reviewData.pass,
                reason: reviewData.reason,
                delType: reviewData.delType,
                noticeType: reviewData.noticeType,
                illegalType: reviewData.illegalType,
              });
            }
            self.note(arr, 0);
          }
        })
        .then(() => {
          // 处理 userAudit
          if (self.selectedAid.length || (id && type === 'userAudit')) {
            const aidArr = typeof id === 'string' ? [id] : self.selectedAid;
            const arr = aidArr.map((uid) => {
              const rd = self.review[uid];
              return {
                userAuditId: uid,
                pass: rd.pass,
                reason: rd.reason,
                noticeType: rd.noticeType,
                illegalType: rd.illegalType,
              };
            });
            self.userAudit(arr);
          }
        })
        .catch((err) => {
          sweetError(err);
        });
    },

    chooseAll: function (type) {
      for (let i = 0; i < this.selectedPid.length; i++) {
        const p = this.selectedPid[i];
        const reviewData = this.review[p];
        reviewData.pass = type;
      }
      for (let i = 0; i < this.selectedDid.length; i++) {
        const d = this.selectedDid[i];
        const reviewData = this.review[d];
        reviewData.pass = type;
      }
      for (let i = 0; i < this.selectedNid.length; i++) {
        const n = this.selectedNid[i];
        const reviewData = this.review[n];
        reviewData.pass = type;
      }
      for (let i = 0; i < this.selectedAid.length; i++) {
        const n = this.selectedAid[i];
        const reviewData = this.review[n];
        reviewData.pass = type;
      }
    },
    //选择审核类型
    selectReviewType(type) {
      window.location.href = `/review?reviewType=${type}`;
    },
  },
});

Object.assign(window, {
  pid,
  review,
  app,
});
