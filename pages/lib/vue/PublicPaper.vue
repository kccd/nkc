<template lang="pug">
  div.clearfix(id="parentBox")
    .question-title
      .question-text 题目：{{question.content}}
      img(v-if='question.hasImage' :src='"/exam/question/" + question.qid + "/image"')
    .question-content
      .question-answer.m-b-2
        form(v-if='question.type === "ans"')
          .answer-form-group
            span 答案：
            textarea(v-model='fill')
            span(v-if="answerDesc.length>0") {{answerDesc}}
        form(v-else)
          label.options(v-for='(q, index) in question.answer' :class="selected.includes(index)?'bg-info':'bg-secondary'")
            input.m-r-05(:disabled="isReselected" v-show="false" type="checkbox" :name="'question' + index" :value='index' v-model='selected' )
            .option-content
              span {{q.serialIndex}}.
              span.m-r-2 {{q.text}}
              p.red-text(v-if="answerDesc.length>0 && selected.includes(index)") {{answerDesc[index]}}
      footer.clearfix
        h5.question-intro 当前题数: {{index+1}} / {{questionTotal}}
        .button-group
          button.btn.btn-default.btn-editor-block.m-r-1(v-if="question.contentDesc" @click="showReminder") 提示
          button.btn.btn-default.btn-editor-block.btn-primary(v-if="isReselected" @click='reselected') 重选
          button.btn.btn-default.btn-editor-block.btn-primary(v-else @click='submit') 提交

</template>

<style lang="less" scoped>
 #parentBox{
   border: 1px solid #ddd;
   border-radius: 1rem;
   padding: 1rem;
   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
   background-color: #fff;
   min-height: 30rem;
   .question-title{
     .question-text {
       font-size: 1.5rem;
       color: #333;
       line-height: 1.6;
       font-weight: bold;
       text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
       margin-bottom: 10px;
     }

     img {
       max-width: 100%;
       height: auto;
       object-fit: contain;
       border: 1px solid #ddd;
       border-radius: 4px;
       margin: 10px 0;
       box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
     }
   }
   .question-content {
     .question-answer{
       form {
         .answer-form-group {
           span {
             display: block; /* 改为块状元素 */
             font-size: 14px;
             color: #555;
             margin-bottom: 3px;
             font-weight: bold;
           }
           textarea {
             width: 100%;
             padding: 10px;
             border: 1px solid #ddd;
             border-radius: 4px;
             font-size: 14px;
             color: #333;
             resize: vertical;
             max-width: 100%;
             transition: border-color 0.3s ease;
           }
           textarea:focus {
             outline: none;
             border-color: #007bff;
           }
         }
         .options {
           display: block;
           border: 2px solid #dcdcdc;
           border-radius: 8px;
           padding: 15px;
           margin-top: 20px;
           box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
           font-weight: normal;
         }
       }
     }
     footer {
       .question-intro {
         float: left;
       }
       .button-group {
         float: right;
       }
     }
   }
   .question-intro {
     font-size: 14px;
     color: #777;
     margin-top: 8px;
     font-style: italic;
   }
 }
 .clearfix::after {
   content: "";
   display: table;
   clear: both;
 }
 .red-text {
   color: rgb(255, 102, 102);
   font-weight: bold;
   font-size: 14px;
 }
</style>

<script>
import Vue from 'vue';
import { nkcAPI } from '../js/netAPI.js';
import { sweetError ,sweetSuccess} from '../js/sweetAlert.js'
import {setRegisterActivationCodeToLocalstorage} from '../js/activationCode.js'
import { visitUrl } from '../js/pageSwitch.js';

export default Vue.extend({
  data() {
    return {
      question: {}, //题目
      questionTotal: 0, //题目总数
      index: 0, //当前做到第几题
      selected: [], //当前用户选择题所选
      fill: '', //当前填空题用户所填
      answerDesc: [], //题目的简介，每个选项的简介
      isReselected:false
    };
  },
  props:['pid'],
  mounted() {
    this.getInit();
  },
  methods: {
    //获取考题
    getInit() {
      nkcAPI(`/api/v1/exam/public/paper/${this.pid}?index=${this.index}`, 'GET')
        .then((res) => {
          if (res) {
            const { question, questionTotal, index } =
              res.data;
            const { answer, type, ...params } = question;
            //选择题
            if (type === 'ch4') {
              const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 一个包含所有字母的字符串
              const alphabetArray = str.split(''); // 将字符串拆分为单个字母字符的数组
              const newAnswer = answer.map((a, index) => {
                const { ...resParams } = a;
                const serialIndex = alphabetArray[index];
                return { ...resParams, serialIndex };
              });
              this.question = { ...params, answer: newAnswer, type };
            } else {
              this.question = question;
            }
            this.questionTotal = questionTotal;
            this.index = index;
          }
        })
        .catch((error) => {
          sweetError(error);
        });
    },
    submit() {
      let selected = [];
      if (!Array.isArray(this.selected)) {
        selected.push(this.selected);
      } else {
        selected = this.selected;
      }
      const { qid } = this.question;
      nkcAPI(`/api/v1/exam/public/result/${this.pid}`, 'POST', {
        index: this.index,
        qid,
        selected,
        fill: this.fill,
      })
        .then((res) => {
          if (res.data) {
            const { message, status, answerDesc, index } = res.data;
            if (status === 403) {
              this.answerDesc = answerDesc;
              this.isReselected = true;
            } else if (status === 200) {
              this.answerDesc = [];
              this.selected = [];
              if (index <= this.questionTotal - 1) {
                this.index = index;
                this.getInit();
              } else {
                nkcAPI(
                  `/api/v1/exam/public/final-result/${this.pid}`,
                  'POST',
                ).then((res) => {
                  if (res) {
                    sweetSuccess('顺利完成');
                    const { activationCode, redirectUrl } = res.data;
                    if (activationCode) {
                      setRegisterActivationCodeToLocalstorage(activationCode);
                    }
                    visitUrl(redirectUrl);
                  }
                });
              }
            }
          }
        })
        .catch((error) => {
          sweetError(error);
        });
    },
    showReminder(){
      sweetInfo(this.question.contentDesc)
    },
    reselected(){
      this.selected = [];
      this.answerDesc = [];
      this.isReselected = false;
    }
  },
})
</script>

