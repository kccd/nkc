<template lang="pug">
  div
    div.clearfix(v-if="!isFinished" id="question-box")
      .question-title
        .question-text 题目：{{question.content}}
        img(v-if='question.hasImage' :src='"/exam/question/" + question.qid + "/image"')
      .question-content
        .question-answer.m-b-2
          form(v-if='question.type === "ans"')
            .answer-form-group
              span 答案：
              textarea(v-model='fill')
              span(v-if="answerDesc.desc") {{answerDesc.desc}}
          form(v-else)
            label.options(v-for='(q, index) in question.answer' :class="selected.includes(index)?'bg-info':'bg-secondary'")
              input.m-r-05(:disabled="isReselected" v-show="false" type="checkbox" :name="'question' + index" :value='index' v-model='selected' )
              .option-content
                span {{q.serialIndex}}.
                span.m-r-2 {{q.text}}
                p.red-text(v-if="answerDesc.length>0 && selected.includes(index)") {{answerDesc.find((item)=>item._id === q._id).desc}}
        footer.clearfix
          h5.question-intro 当前题数: {{index+1}} / {{questionTotal}}
          .button-group
            button.btn.btn-default.btn-editor-block.m-r-1(v-if="question.contentDesc" @click="showReminder") 提示
            button.btn.btn-default.btn-editor-block.btn-primary(v-if="isReselected && type === 'ch4'" @click='reselected') 重选
            button.btn.btn-default.btn-editor-block.btn-primary(v-else @click='submit') 提交
    div.clearfix(v-else id="finished-box" )
      .notice-content
        span.m-r-2.glyphicon.glyphicon-ok.icon-success
        span.notice-text 恭喜您考试通过了！
        a.m-t-2.notice-link(v-if="from === 'register'" :href="redirectUrl") 点击参加注册
        a.m-t-2.notice-link(v-else :href="redirectUrl") 返回到考试主页


</template>

<style lang="less" scoped>
 #question-box{
   border: 1px solid #ddd;
   border-radius: 5px;
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
 #finished-box{
   border: 1px solid #ddd;
   border-radius: 5px;
   padding: 1rem;
   box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
   background-color: #fff;
   min-height: 30rem;
   position: relative;
   .notice-content{
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%,-50%);
     height: 50%;
     width: 80%;
     border-radius: 8px;
     padding: 10px;
     text-align: center;

     .notice-text {
       font-size: 18px;
       color: #555;

     }

     .notice-link {
       font-size: 16px;
       color: #007bff;
       text-decoration: none;
       transition: color 0.3s ease;
       display: block;
     }

     .notice-link:hover {
       color: #0056b3;
     }
   }
 }
</style>

<script>
import Vue from 'vue';
import { nkcAPI } from '../js/netAPI.js';
import { sweetError ,sweetSuccess} from '../js/sweetAlert.js'
import {setRegisterActivationCodeToLocalstorage} from '../js/activationCode.js'

export default Vue.extend({
  data() {
    return {
      question: {}, //题目
      questionTotal: 0, //题目总数
      index: 0, //当前做到第几题
      selected: [], //当前用户选择题所选
      fill: '', //当前填空题用户所填
      answerDesc: [], //题目的简介，每个选项的简介
      isReselected:false, //是否重置
      answerOrder:[], //存储选择题的题目顺序
      type:'',
      isFinished:false,//用户是否做完
      redirectUrl:'', //跳转的路径
      from:''
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
            const oldAnswer = JSON.parse(JSON.stringify(answer));
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
              this.answerOrder = oldAnswer.map((item)=>item._id);
            } else {
              this.question = question;
            }
            this.questionTotal = questionTotal;
            this.index = index;
            this.type = type;
          }
        })
        .catch((error) => {
          sweetError(error);
        });
    },
    submit() {
      let userSelected = [];
      let selected = [];
      if (this.type === 'ch4'){
        userSelected = this.question.answer.reduce((selectedIds, item, index) => {
          if (this.selected.includes(index)) {
            selectedIds.push(item._id);
          }
          return selectedIds;
        }, []);
         selected = this.answerOrder.reduce((result, item, index) => {
          if (userSelected.includes(item)) {
            result.push(index);
          }
          return result;
        }, []);
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
            const { status, answerDesc, index } = res.data;
            if (status === 403) {
              if (this.type === 'ch4'){
                this.isReselected = true;
              }
              else {
                sweetError('输入的问题有误')
              }
              this.answerDesc = answerDesc;
            } else if (status === 200) {
              this.answerDesc = [];
              this.selected = [];
              this.fill = '';
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
                    const { activationCode, redirectUrl,from} = res.data;
                    if (activationCode) {
                      setRegisterActivationCodeToLocalstorage(activationCode);
                    }
                    this.redirectUrl = redirectUrl
                    this.isFinished = true;
                    this.from = from;
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
      if(this.type === 'ch4'){
        this.selected = [];
        this.shuffle(this.question.answer)
      }
      this.answerDesc = [];
      this.isReselected = false;
    },
    shuffle(arr){
      const length = arr.length;
      for(let i = 0; i < length; i++) {
        const index = Math.round(Math.random()*(length-1));
        const n = arr[i];
        arr[i] = arr[index];
        arr[index] = n;
      }
    }

  },
})
</script>

