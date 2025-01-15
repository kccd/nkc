import {
  sweetPrompt,
  sweetSuccess,
  sweetError,
  sweetQuestion,
} from '../../lib/js/sweetAlert';
import { deleteQuestion } from '../../lib/js/exam';
import { HttpMethods, nkcAPI } from '../../lib/js/netAPI';
import { getDataById } from '../../lib/js/dataConversion';
import QuestionTagSelector from '../../lib/vue/QuestionTagSelector.vue';
import Vue from 'vue';
import { reloadPage } from '../../lib/js/pageSwitch';
const data = getDataById('data');
new Vue({
  el: '#app',
  data: {
    tags: data.tags,
    tagId: data.tagId,
    manageQuestionTagsPermission: data.manageQuestionTagsPermission,
  },
  components: {
    'question-tag-selector': QuestionTagSelector,
  },
  computed: {
    questionTagSelector() {
      return this.$refs.questionTagSelector;
    },
  },
  methods: {
    addQuestionTag() {
      this.questionTagSelector.open({
        name: this.questionTagSelector.names.editor,
        callback: () => {
          this.questionTagSelector.close();
          sweetSuccess('提交成功');
          setTimeout(() => {
            reloadPage();
          }, 200);
        },
      });
    },
    editQuestionTag(tag) {
      this.questionTagSelector.open({
        name: this.questionTagSelector.names.editor,
        tag: {
          _id: tag.tagId,
          name: tag.tagName,
          desc: tag.tagDesc,
        },
        callback: (newTag) => {
          this.questionTagSelector.close();
          tag.tagName = newTag.name;
          tag.tagDesc = newTag.desc;
          sweetSuccess('提交成功');
        },
      });
    },
    deleteQuestionTag(tag) {
      sweetQuestion('当前操作不可撤销，确定要删除试题标签吗？')
        .then(() => {
          return nkcAPI(`/api/v1/exam/tag/${tag.tagId}`, HttpMethods.DELETE);
        })
        .then(() => {
          const index = this.tags.indexOf(tag);
          if (index !== -1) {
            this.tags.splice(index, 1);
          }
          sweetSuccess('删除成功');
        })
        .catch(sweetError);
    },
  },
});

async function disabledQuestion(qid) {
  sweetPrompt('请输入屏蔽原因(500字以内)')
    .then((reason) => {
      return nkcAPI('/exam/question/' + qid + '/disabled', HttpMethods.POST, {
        reason,
      });
    })
    .then(function () {
      window.location.reload();
    })
    .catch(sweetError);
}
function enabledQuestion(qid) {
  nkcAPI('/exam/question/' + qid + '/disabled', HttpMethods.DELETE, {})
    .then(function () {
      window.location.reload();
    })
    .catch(sweetError);
}
function auth(qid, type) {
  let reason = '';
  Promise.resolve()
    .then(() => {
      if (!type) {
        return sweetPrompt('请输入审核不通过的原因').then((content) => {
          reason = content;
        });
      }
    })
    .then(() => {
      return nkcAPI('/exam/auth', HttpMethods.POST, {
        status: !!type,
        qid: qid,
        reason: reason,
      });
    })
    .then(function () {
      window.location.reload();
    })
    .catch(sweetError);
}

/*
 * 修改题库试题的状态
 * @param {String} qid 试题 ID
 * @param {String} status 状态类型
 * */
function modifyQuestionStatus(qid, auth) {
  return sweetQuestion('确定要执行当前操作？')
    .then(() => {
      return nkcAPI(`/exam/question/${qid}/auth`, HttpMethods.PUT, {
        auth,
      });
    })
    .then(() => {
      sweetSuccess('执行成功');
    })
    .catch(sweetError);
}

Object.assign(window, {
  disabledQuestion,
  enabledQuestion,
  auth,
  deleteQuestion: deleteQuestion,
  modifyQuestionStatus,
});
