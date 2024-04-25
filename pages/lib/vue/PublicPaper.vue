<template lang="pug">
  div
    .exam-header-container
      img(:src="getUrl('siteFile', 'holy_exam.gif')")
      .exam-header-info
        .h3 科创会员开卷考试
          span(style="font-size:1.4rem;vertical-align:middle;") （Open-book examination for science and technology members）
        .h5 考试科目（Exam subjec）：{{paperName}}
        .h5 开考时间（Exam start time）：{{detailedTime(paperTime)}}
        .h5 试题总数（Total number of questions）：{{paperQuestionCount}}
    hr
    div.clearfix.question-box(v-if="!isFinished")
      .question-title
        .question-text
          .h4.text-info 第 {{index + 1}} 题（
            span(v-if="question.type === 'ans'") 填空题
            span(v-if="question.isIndefinite" ) 不定项
            span(v-if="question.type === 'ch4' && !question.isIndefinite" ) {{question.isMultiple? '多选题': '单选题'}}
            | ）
            span(style="font-size:1.2rem;") Question {{index + 1}}（
            span(v-if="question.type === 'ans'" style="font-size:1.2rem;") Blank
            span(v-if="question.isIndefinite" style="font-size:1.2rem;") Uncertainty
            span(style="font-size:1.2rem;" v-if="question.type === 'ch4' && !question.isIndefinite" ) {{question.isMultiple? 'Multiple Choice': 'Single Choice'}}
            span(style="font-size:1.2rem;") ）
          question-text-content(:text="`${question.content}`")
          .question-desc(v-if="question.contentDesc")
            .text-info(v-if="isShowReminder || isCorrect === false " ).m-t-1.m-b-05
              .answer-desc-icon.fa.fa-lightbulb-o
              span {{this.question.contentDesc}}
            button.btn.btn-default.btn-xs(@click="showReminder") 查看提示（Check out the tips）
        img(v-if='question.hasImage' :src='"/exam/question/" + question.qid + "/image"')
      .question-status
        h4.question-intro.text-danger(v-if="isCorrect === false" ) 
          span 回答错误，请阅读所有提示，理解其内容，再重新作答
          br
          span Wrong answer! Please read all prompts, understand their content, and answer again.
        h4.question-intro.text-success(v-if="isCorrect === true" ) 回答正确 (Answer correctly)
      .question-content
        .question-answer.m-b-2
          form(v-if='question.type === "ans"')
            .answer-form-group
              span 答案：（Answer）
              textarea(:disabled = "isCorrect"  v-model.trim='fill' )
              span(v-if="answerDesc.desc") {{answerDesc.desc}}
          form(v-else)
            label.options(v-if="question.isMultiple" v-for='(q, index) in question.answer' :class="bgc(index,q)")
              input.m-r-05(:disabled="isReselected || isCorrect " v-show="false" type="checkbox" :name="'question' + index" :value='index' v-model='selected' )
              .option-content
                span {{q.serialIndex}}、
                span.m-r-2 {{q.text}}
                .answer-desc.text-info(v-if="answerDescObj[q._id] && answerDescObj[q._id].desc.length > 0")
                  .answer-desc-icon.fa.fa-lightbulb-o
                  span {{answerDescObj[q._id].desc}}
            label.options(v-if="!question.isMultiple" v-for='(q, index) in question.answer' :class="bgc(index,q)")
              input.m-r-05(:disabled="isReselected || isCorrect " v-show="false" type="radio" :name="'question' + index" :value='index' v-model='selected' )
              .option-content
                span {{q.serialIndex}}、
                span.m-r-2 {{q.text}}
                .answer-desc.text-info(v-if="answerDescObj[q._id] && answerDescObj[q._id].desc.length > 0 ")
                  .answer-desc-icon.fa.fa-lightbulb-o
                  span {{answerDescObj[q._id].desc}}

        footer.clearfix
          .button-group
            button.btn.btn-default.btn-editor-block.m-r-1(@click='pre' v-if="index - 1 >= 0" ) 上一题（Previous question）
            button.btn.btn-default.btn-editor-block.btn-info(v-if="isReselected && type === 'ch4'" @click='reselected') 重选（Reselect）
            button.btn.btn-default.btn-editor-block.btn-primary(@click='next' v-if="isCorrect === true && this.index < this.questionTotal -1 " ) 下一题（Next question）
            button.btn.btn-default.btn-editor-block.btn-primary(v-if="!isReselected && isCorrect !== true" @click='submit' :disabled="isDisabled" :title="isDisabled?'答案不能为空（Answer cannot be empty）':''") 提交（Submit）
            button.btn.btn-default.btn-editor-block.btn-primary(v-if="this.index >= this.questionTotal - 1 && isCorrect === true" @click='finish' ) 完成（Finish）

    div.clearfix(v-else id="finished-box" )
      .notice-content
        .glyphicon.glyphicon-ok.icon-success.m-b-1
        .notice-text.m-b-1 考试通过（Passing the exam）
        div(v-if="from === 'register'")
          span 恭喜您通过了 {{paperName}} 考试，请点击&nbsp;
          button.btn.btn-xs.btn-default(@click="redirectToPage") 这里
          span &nbsp;继续注册。
          br
          span Congratulations on passing the {{paperName}} exam, please click&nbsp;
          button.btn.btn-xs.btn-default(@click="redirectToPage") here
          span &nbsp;continue to register.
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
     //font-size: 1.4rem;
     //color: rgb(255, 102, 102);
     //margin-top: 8px;
     //font-style: italic;
   }
 }
  .clearfix::after {
    content: "";
    display: table;
    clear: both;
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
  .answer-desc{
    margin-top: 1rem;
  }
  .answer-desc-icon{
    margin-right: 0.5rem;
    font-size: 1.3rem;
  }
  .answer-bg-danger{
    background-color: #ffe1e1;
    border-color: #efc3c3!important;
  }
  .shake-animation {
    animation: shake 0.5s ;
  }
  @keyframes shake {
    0%, 100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(-5px, -5px);
    }
    50% {
      transform: translate(5px, 5px);
    }
    75% {
      transform: translate(-5px, -5px);
    }
  }
  .question-desc{
    &>i{
      cursor: pointer;
      color: rgb(185, 185, 185);
    }
    &>div{
      font-weight: normal;
      font-size: 1.2rem;
    }

  }
</style>

<script>
import Vue from "vue";
import { nkcAPI } from "../js/netAPI.js";
import { sweetError } from "../js/sweetAlert.js";
import { getUrl } from "../js/tools";
import { detailedTime } from "../js/time";
import { setRegisterActivationCodeToLocalstorage } from "../js/activationCode.js";
import { renderFormula } from "../js/formula";
import { visitUrl } from "../js/pageSwitch";

Vue.component('question-text-content', {
  props: ['text'],
  data: function() {
    return {
      key: (Math.random() * 10000).toString()
    }
  },
  watch: {
    text() {
      this.key = (Math.random() * 10000).toString();
    },
  },
  template: `<span :key="key">{{text}}</span>`
})

export default Vue.extend({
  data() {
    return {
      question: {}, //题目
      questionTotal: 0, //题目总数
      index: 0, //当前做到第几题
      selected: [], //当前用户选择题所选
      fill: '', //当前填空题用户所填
      answerDesc: [], //题目的简介，每个选项的简介
      isReselected: false, //是否重置
      answerOrder:[], //存储选择题的题目顺序
      type:'',
      isFinished:false,//用户是否做完
      redirectUrl:'', //跳转的路径
      from:'',
      paperTime: '',
      paperQuestionCount: "",
      paperName: '',
      isCorrect:null,
      isShowReminder:false,
      url: window.location.href
    };
  },
  props:['pid'],
  mounted() {
    this.getInit();
  },
  computed:{
    isDisabled(){
      const {question:{isMultiple,type}, selected ,fill}  = this
      //多选
      if(type === 'ch4'){
        if(isMultiple){
          return selected.length === 0
        }else {
          return  Array.isArray(selected)
        }
      }else {
        return  fill === ''
      }
    },
    answerDescObj() {
      if(this.question.type === 'ans') {
        return this.answerDesc;
      } else {
        const obj = {};
        for(const item of this.answerDesc) {
          obj[item._id] = item;
        }
        return obj;
      }
    }
  },
  created() {
    window.addEventListener('popstate', this.updateUrl);
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  },
  beforeDestroy() {
    window.removeEventListener('popstate', this.updateUrl);
    this.removeBeforeunloadEventListener();
  },
  methods: {
    getUrl,
    detailedTime,
    removeBeforeunloadEventListener() {
      window.removeEventListener('beforeunload', this.handleBeforeUnload);
    },
    //获取考题
    getInit(type='default',index = 0) {
      nkcAPI(`/api/v1/exam/public/paper/${this.pid}?index=${index}&&type=${type}`, 'GET')
        .then((res) => {
          if (res) {
            const { question, questionTotal, index, paperName, paperTime, paperQuestionCount } =
              res.data;
            const {correct ,answer, type, ...params } = question;
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
            //已经做过了,保留之前的状态
            if(question.correct){
              this.isCorrect = true
              //多选
              if(type === 'ch4'){
                if(this.question.isMultiple){
                  this.selected = question.answer
                    .map((item, index) => (item.correct ? index : undefined))
                    .filter(index => index !== undefined);
                }else {
                  this.selected = question.answer.findIndex(item => item.correct)
                }
                this.answerDesc =  this.question.answer.map((item) => {
                  const { desc, _id } = item;
                  return { desc, _id };
                });
              }
              else {
                this.answerDesc.desc = question.answer[0].desc
                this.fill = question.answer[0].fill
              }
            }
            this.questionTotal = questionTotal;
            this.index = Number(index) ;
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
    //提交
    submit() {
      const {isMultiple} = this.question
      let userSelected = [];
      let selected = [];
      if (this.type === 'ch4') {
        userSelected = this.question.answer.reduce((selectedIds, item, index) => {
          if ((isMultiple && this.selected.includes(index)) || (!isMultiple && this.selected === index)) {
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
        fill:this.fill
      })
        .then((res) => {
            const { status, answerDesc} = res.data;
            if (status === 403) {
              if (this.type === 'ch4'){
                this.isReselected = true;
                this.isCorrect = false
              }
              else {
                sweetError('输入的答案有误')
              }
              this.answerDesc = answerDesc;
            } else if (status === 200) {
              this.isCorrect = true;
              this.answerDesc = answerDesc;
            }
        })
        .catch((error) => {
          sweetError(error);
        });
    },
    showReminder(){
      this.isShowReminder = !this.isShowReminder
    },
    //重置
    reselected(){
      if(this.type === 'ch4'){
        this.selected = [];
        this.shuffle(this.question.answer)
      }
      this.answerDesc = [];
      this.isReselected = false;
      this.isCorrect = null;
    },
    //排序
    shuffle(arr){
      const length = arr.length;
      for(let i = 0; i < length; i++) {
        const index = Math.round(Math.random()*(length-1));
        const n = arr[i];
        arr[i] = arr[index];
        arr[index] = n;
      }
      const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 一个包含所有字母的字符串
      const alphabetArray = str.split(''); // 将字符串拆分为单个字母字符的数组
      arr.forEach((a, index) => {
        a.serialIndex = alphabetArray[index];
      });
    },
    //背景颜色
    bgc(index,q){
      //多选
      const isMultiple = this.question.isMultiple;
      //是否选择
      const isInclude = isMultiple ? this.selected.includes(index) : this.selected === index;
      const {isCorrect} = this
      if (!isInclude) {
        return 'bg-secondary';
      } else if (isCorrect === null) {
        return 'bg-info'
      } else if (isCorrect === true) {
        return 'bg-success';
      } else {
        return  'shake-animation';
      }
    },
    redirectToPage() {
      visitUrl(this.redirectUrl)
    },
    //切换下一题
    next(){
      this.answerDesc = [];
      this.selected = [];
      this.fill = '';
      this.isCorrect = null;
      this.isShowReminder = false;
      if(this.index <= this.questionTotal - 1){
        this.index +=1
        const currentUrl = window.location.pathname
        const newUrl = currentUrl + `#question${this.index}`;
        history.pushState({index:this.index}, '', newUrl);
        this.getInit('down',this.index);
      }
      else {
        sweetError('index混乱')
      }
    },
    //上一题
    pre(){
      if(this.index -1 <0){
        return sweetError('没有上一题')
      }
      this.answerDesc = [];
      this.selected = [];
      this.fill = '';
      this.isCorrect = null;
      this.isReselected = false;
      this.isShowReminder = false;
      if(this.index >=1){
        this.index -=1
        const currentUrl = window.location.pathname
        const newUrl = currentUrl + `#question${this.index}`;
        history.pushState({index:this.index}, '', newUrl);
        this.getInit('up',this.index);
      }
      else {
        sweetError('index混乱')
      }

    },
    //完成
    finish(){
      if (this.index === this.questionTotal - 1) {
        nkcAPI(
          `/api/v1/exam/public/final-result/${this.pid}`,
          'POST',
        ).then((res) => {
          if (res) {
            const { activationCode, redirectUrl,from} = res.data;
            if (activationCode) {
              setRegisterActivationCodeToLocalstorage(activationCode);
            }
            this.redirectUrl = redirectUrl
            this.isFinished = true;
            this.from = from;
            this.removeBeforeunloadEventListener();
          }
        });
      }
    },
    updateUrl(e) {
      this.answerDesc = [];
      this.selected = [];
      this.fill = '';
      this.isCorrect = null;
      this.isReselected = false;
      this.isShowReminder = false;
     if(!e.state){
       this.getInit('up',0);
     }else {
       this.getInit('down',e.state.index)
     }
    },
    handleBeforeUnload(event) {
      const confirmationMessage = '确定要离开页面吗？';
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    }
  },
})
</script>

