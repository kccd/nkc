import QuestionTagSelector from '../../lib/vue/QuestionTagSelector.vue';
import Vue from 'vue';
import { getDataById } from '../../lib/js/dataConversion';
import { getUrl } from '../../lib/js/tools';
import { getFileObjectUrl } from '../../lib/js/file';
import {
  sweetError,
  sweetQuestion,
  sweetSuccess,
} from '../../lib/js/sweetAlert';
import { HttpMethods, nkcUploadFile } from '../../lib/js/netAPI';

const data = getDataById('data');

const questionTypes = {
  ch4: 'ch4',
  ans: 'ans',
};

// 默认表单数据
function getDefaultQuestion() {
  return {
    _id: null,
    type: questionTypes.ch4,
    volume: 'A',
    tags: [],
    hasImage: false,
    content: '',
    contentDesc: '',
    answer: [],
    auth: null,
    reason: '',
    isIndefinite: false,
  };
}

let targetQuestion = getDefaultQuestion();

// 用于记录填空题答案
let correctAnswer = {
  text: '',
  desc: '',
};

if (data.question) {
  const {
    _id,
    type,
    volume,
    tags,
    hasImage,
    content,
    contentDesc,
    answer,
    auth,
    reason,
    isIndefinite,
  } = data.question;
  targetQuestion = {
    ...targetQuestion,
    ...{
      _id,
      type,
      volume,
      tags,
      hasImage,
      content,
      contentDesc,
      answer,
      auth,
      reason,
      isIndefinite,
    },
  };
  if (type === questionTypes.ans) {
    correctAnswer.text = targetQuestion.answer[0].text;
    correctAnswer.desc = targetQuestion.answer[0].desc;
  }
}

new Vue({
  el: '#app',
  data: {
    submitted: false,
    submitting: '',
    tags: data.tags,
    question: targetQuestion,
    correctAnswer,
    questionTypes,
    newImage: null,
    isApproved: targetQuestion.auth === true,
  },
  components: {
    'question-tag-selector': QuestionTagSelector,
  },
  computed: {
    questionTagSelector() {
      return this.$refs.questionTagSelector;
    },
    questionImageUrl() {
      let url = '';
      if (this.newImage) {
        url = getFileObjectUrl(this.newImage);
      } else if (this.question.hasImage) {
        url = getUrl('questionImage', this.question._id);
      }
      return url;
    },
    tagsObj() {
      const obj = {};
      for (const tag of this.tags) {
        obj[tag._id] = tag;
      }
      return obj;
    },
    selectedTags() {
      const tags = [];
      for (const tagId of this.question.tags) {
        const tag = this.tagsObj[tagId];
        if (tag) {
          tags.push(tag);
        }
      }
      return tags;
    },
    isCreateQuestion() {
      return !this.question._id;
    },
    isEditQuestion() {
      return !this.isCreateQuestion;
    },
    isFixedBaseInfo() {
      return this.isEditQuestion && this.isApproved;
    },
    isCh4Type() {
      return this.question.type === this.questionTypes.ch4;
    },
    contentCheck() {
      return !this.question.content ? ['题干内容不能为空'] : [];
    },
    answerCheck() {
      const info = [];
      if (this.isCh4Type) {
        if (this.question.answer.length <= 1) {
          info.push('至少应该包含两个选项');
        }
        let hasCorrectAnswer = false;
        for (let i = 0; i < this.question.answer.length; i++) {
          const answer = this.question.answer[i];
          if (!answer.text.length) {
            info.push(`选项 ${i + 1} 的内容不能为空`);
          }
          if (!hasCorrectAnswer && answer.correct) {
            hasCorrectAnswer = true;
          }
        }
        if (!hasCorrectAnswer) {
          info.push(`至少应该包含一个正确选项`);
        }
      } else {
        if (!this.correctAnswer.text.length) {
          info.push(`答案内容不能为空`);
        }
      }
      return info;
    },

    tagCheck() {
      const info = [];
      if (this.question.tags.length === 0) {
        info.push(`至少应该包含一个试题标签`);
      }
      return info;
    },

    errorInfo() {
      const { tagCheck, answerCheck, contentCheck } = this;
      return [...tagCheck, ...contentCheck, ...answerCheck];
    },

    canSubmit() {
      return this.errorInfo.length === 0;
    },
  },
  methods: {
    removeAnswer(index) {
      sweetQuestion('当前操作无法撤销，确定要执行吗？').then(() => {
        this.question.answer.splice(index, 1);
      });
    },
    addAnswer() {
      const newAnswer = {
        text: '',
        desc: '',
        correct: false,
      };
      this.question.answer.push(newAnswer);
    },
    selectQuestionTag() {
      this.questionTagSelector.open({
        name: this.questionTagSelector.names.list,
        callback: (res) => {
          const { tags } = res;
          for (const tag of tags) {
            if (this.question.tags.includes(tag._id)) {
              continue;
            }
            this.tags.push(tag);
            this.question.tags.push(tag._id);
          }
          this.questionTagSelector.close();
        },
      });
    },
    cancelSelectedTag(index) {
      this.question.tags.splice(index, 1);
    },
    reset: function () {
      this.question = getDefaultQuestion();
      this.submitting = '';
      this.submitted = false;
    },
    removeImage: function () {
      this.question.hasImage = false;
      this.newImage = null;
    },
    clickInput: function () {
      this.$refs.input.click();
    },
    inputChange: function (e) {
      const files = e.target.files;
      if (files.length === 0) {
        return;
      }
      this.newImage = files[0];
    },
    submit() {
      const formData = new FormData();
      if (this.newImage) {
        formData.append('image', this.newImage);
      }
      const {
        _id,
        type,
        volume,
        tags,
        hasImage,
        content,
        contentDesc,
        answer,
        isIndefinite,
      } = this.question;
      const { correctAnswer } = this;
      const form = {
        type,
        volume,
        tags,
        hasImage,
        content,
        contentDesc,
        isIndefinite,
      };
      if (this.isCh4Type) {
        form.answer = answer;
      } else {
        form.answer = [
          {
            text: correctAnswer.text,
            desc: correctAnswer.desc,
            correct: true,
          },
        ];
      }

      formData.append('form', JSON.stringify(form));
      const url = this.isEditQuestion
        ? `/api/v1/exam/question/${_id}`
        : `/api/v1/exam/questions`;
      const method = this.isEditQuestion ? HttpMethods.PUT : HttpMethods.POST;

      this.submitting = '提交中...';
      nkcUploadFile(url, method, formData, (e, num) => {
        if (num === 100) {
          this.submitting = `处理中...`;
        } else {
          this.submitting = `提交中...${num}%`;
        }
      })
        .then(() => {
          if (this.isCreateQuestion) {
            this.submitted = true;
          } else {
            sweetSuccess('提交成功');
          }
        })
        .catch(sweetError)
        .finally(() => {
          this.submitting = '';
        });
    },
  },
});
