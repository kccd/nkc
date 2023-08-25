<template lang="pug">
  div
    .exam-header-container
      img(:src="getUrl('siteFile', 'holy_exam.gif')")
      .exam-header-info
        .h3 科创会员开卷考试
        .h5 考试科目：{{paperName}}
        .h5 开考时间：{{detailedTime(paperTime)}}
        .h5 试题总数：{{paperQuestionCount}}
    hr
    div.clearfix.question-box(v-if="!isFinished")
      .question-title
        .question-text
          .h4.text-info 第 {{index}} 题：
          span {{question.content}}
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
                span {{q.serialIndex}}、
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
        .glyphicon.glyphicon-ok.icon-success.m-b-1
        .notice-text.m-b-1 考试通过
        div(v-if="form === 'register'")
          span 恭喜您通过了 {{paperName}} 考试，请点击&nbsp;
          a(:href="redirectUrl") 这里
          span &nbsp;继续注册。
        div(v-else)
          .m-b-1 恭喜您通过了 {{paperName}} 考试。
          a(:href="redirectUrl") 返回到考试主页


</template>

<style lang="less" scoped>
  .exam-header-container{
    @imgWidth: 10rem;
    position: relative;
    padding-left: @imgWidth + 1rem;
    img{
      max-height: 10rem;
      max-width: 100%;
      position: absolute;
      top: 0.5rem;
      left: 0;
      width: @imgWidth;
    }
    .exam-header-info{
      overflow: hidden;
    }
  }

 .question-box{
   //border: 1px solid #ddd;
   border-radius: 5px;
   //box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
   background-color: #fff;
   min-height: 30rem;
   .question-title{
     .question-text {
       font-size: 1.5rem;
       color: #000;
       line-height: 1.6;
       //text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
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
           cursor: pointer;
           display: block;
           border: 1px solid #dcdcdc;
           border-radius: 5px;
           padding: 15px;
           margin-top: 20px;
           //box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
   //border: 1px solid #ddd;
   //border-radius: 5px;
   //padding: 1rem;
   //box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
   //background-color: #fff;
   min-height: 30rem;
   position: relative;
   .notice-content{
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%,-50%);
     height: 50%;
     width: 80%;
     border-radius: 3px;
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
import {getUrl} from "../js/tools";
import {detailedTime} from '../js/time'
import {setRegisterActivationCodeToLocalstorage} from '../js/activationCode.js'
import {  renderFormula } from "../js/formula";

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
      from:'',
      paperTime: '',
      paperQuestionCount: "",
      paperName: '',
    };
  },
  props:['pid'],
  mounted() {
    this.getInit();
  },
  methods: {
    getUrl,
    detailedTime,
    //获取考题
    getInit() {
      nkcAPI(`/api/v1/exam/public/paper/${this.pid}?index=${this.index}`, 'GET')
        .then((res) => {
          if (res) {
            const { question, questionTotal, index, paperName, paperTime, paperQuestionCount } =
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
            this.paperName = paperName;
            this.paperTime = paperTime;
            this.paperQuestionCount = paperQuestionCount;

            setTimeout(() => {
              renderFormula()
            }, 500)
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

