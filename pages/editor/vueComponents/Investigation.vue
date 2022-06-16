<template lang="pug">
  //- data.createSurveyPermission && data.type === "newThread" || (data.type === "modifyThread" && data.post.surveyId)
  .investigation(v-if="createSurveyPermission && type === 'newThread' || (type === 'modifyThread' && post.surveyId)")
    .editor-header 调查
      button.btn.btn-xs.disabledSurveyButton(
        @click="disabledSurveyForm()"
        ref="disabledSurveyButton"
        :class="{'btn-danger': !disabled , 'btn-success': disabled}"
      ) {{!disabled ? "取消" : "创建"}}
    .survey-edit-body(v-cloak v-if="survey && roles.length && !disabled")
      .form.form-horizontal
        .form-group(v-if="!survey._id")
          label.col-sm-2.control-label 类别
          .col-sm-10
            .survey-type(@click="selectType('vote')")
              .fa.fa-check-circle(v-if="survey.type === 'vote'")
              .fa.fa-circle-o(v-else)
              span 投票
            .survey-type(@click="selectType('score')")
              .fa.fa-check-circle(v-if="survey.type === 'score'")
              .fa.fa-circle-o(v-else)
              span 评分
            .survey-type(@click="selectType('survey')")
              .fa.fa-check-circle(v-if="survey.type === 'survey'")
              .fa.fa-circle-o(v-else)
              span 问卷调查
        .form-group(v-if="survey.type !== 'vote'")
          label.col-sm-2.control-label 调查说明
          .col-sm-9
            textarea.form-control(v-model="survey.description" rows=4 placeholder="请输入调查说明")
        .form-group
          label.col-sm-2.control-label 问题
          .col-sm-9
            .survey-options.m-b-05
              .survey-option(v-for="o, index in survey.options" v-if="survey.type !== 'vote' || index === 0")
                .option-index 问题{{index+1}}
                  .pull-right
                    span(v-if="survey.type !== 'vote'")
                      .fa.fa-chevron-circle-up(title="上移" @click="moveOption('up', o)")
                      .fa.fa-chevron-circle-down(title="下移" @click="moveOption('down', o)")
                    .fa.fa-trash(title="移除" @click="removeOption(index)")
                textarea.form-control(v-model="o.content" placeholder="请输入问题内容")
                .row.option-links.m-t-05(v-if="o.links_ && o.links_.length")
                  .option-link.m-b-05(v-for="link, index in o.links_")
                    .col-xs-12.col-md-8
                      input.form-control(type="text" v-model="link.link" placeholder="内容链接" @change="checkHttp(link)")
                    .col-xs-12.col-md-4
                      button.btn.btn-default(@click="removeLink(o, index)") 删除
                .option-resources
                  .option-resource(v-for="r, index in o.resourcesId")
                    img(:src="getUrl('resource', r, 'sm')" @click="visitUrl(getUrl('resource', r))")
                    //.option-resource-img(:style="'background-image:url(/rt/'+r+')'" @click="visitUrl('/r/' + r)")
                    .fa.fa-remove(@click="removeResourceId(o, index)")
                .survey-option-buttons.m-t-05.m-b-05
                  button.btn.btn-default.btn-xs(@click="addLink(o)") 添加链接
                  button.btn.btn-default.btn-xs(@click="addResource(o)") 添加图片
                .option-answers(v-if="o.answers && o.answers.length")
                  .survey-answer(v-for="a, index in o.answers")
                    .m-b-05.option-index 选项{{index+1}}
                      .pull-right
                        .fa.fa-files-o(title="复制并添加选项" @click="copy(o.answers, a)")
                        .fa.fa-chevron-circle-up(title="上移" @click="moveOption('up', o, a)")
                        .fa.fa-chevron-circle-down(title="下移" @click="moveOption('down', o, a)")
                        .fa.fa-trash(title="移除" @click="removeAnswer(o, index)")

                    textarea.form-control.m-b-05(placeholder="请输入选项内容" v-model="a.content")
                    .row.option-links.m-t-05(v-if="a.links_ && a.links_.length")
                      .option-link.m-b-05(v-for="link, index in a.links_")
                        .col-xs-12.col-md-8
                          input.form-control(type="text" v-model="link.link" placeholder="选项链接" @change="checkHttp(link)")
                        .col-xs-12.col-md-4
                          button.btn.btn-default(@click="removeLink(a, index)") 删除
                    .option-resources
                      .option-resource(v-for="r, index in a.resourcesId")
                        img(:src="getUrl('resource', r, 'sm')" @click="visitUrl(getUrl('resource', r))")
                        //.option-resource-img(:style="'background-image:url(/rt/'+r+')'" @click="visitUrl('/r/' + r)")
                        .fa.fa-remove(@click="removeResourceId(a, index)")
                    button.btn.btn-default.btn-xs(@click="addLink(a)") 添加链接
                    button.btn.btn-default.btn-xs(@click="addResource(a)") 添加图片
                    .survey-scores(v-if="survey.type === 'score'").form-inline
                      h5
                        b 打分范围（有效范围-150到150，精确到0.01）：
                        | 最小
                        input(type="text" v-model.number="a.minScore" @change="toInt")
                        | &nbsp;最大
                        input(type="text" v-model.number="a.maxScore" @change="toInt")
                .survey-option-buttons.m-t-05
                  button.btn.btn-default.btn-xs(@click="addAnswer(o)") 添加选项
                h5(v-if="survey.type !== 'score'") 可选选项数量限制：
                  | 最小
                  select(v-model="o.minVoteCount")
                    option(v-for="i in getVoteCount(o)" :value="i") {{i}}
                  | &nbsp;最大
                  select(v-model="o.maxVoteCount")
                    option(v-for="i in getVoteCount(o)" :value="i") {{i}}
            button.btn.btn-default.btn-sm(@click="addOption" v-if="survey.type !== 'vote'")
              .fa.fa-plus.add-option-button &nbsp;添加问题
            button.btn.btn-default.btn-sm(@click="copy(survey.options)" v-if="survey.type !== 'vote' && survey.options.length")
              .fa.fa-files-o &nbsp;复制问题
        .form-group
          label.col-sm-2.control-label 结果展示
          .col-sm-9
            .radio
              label.m-r-1
                input(type="radio" v-model="survey.showResult" value="all")
                | 所有人可见
              label.m-r-1
                input(type="radio" v-model="survey.showResult" value="posted")
                | 参与者可见
              label.m-r-1
                input(type="radio" v-model="survey.showResult" value="this")
                | 仅自己可见
            div(v-if="survey.showResult !== 'this'")
              hr.m-t-05.m-b-05
              .checkbox
                label
                  input(type="checkbox" v-model="survey.showResultAfterTheEnd" :value="true")
                  span 结束后展示结果
        .form-group
          label.col-sm-2.control-label 显示参与人
          .col-sm-9
            .radio
              label.m-r-1
                input(type="radio" v-model="survey.showVoter" value="always")
                | 始终
              label.m-r-1
                input(type="radio" v-model="survey.showVoter" value="after")
                | 结束后
              label.m-r-1
                input(type="radio" v-model="survey.showVoter" value="never")
                | 不显示
        .form-group
          label.col-sm-2.control-label 奖励
          .col-sm-9
            .radio
              label.m-r-1
                input(type="radio" v-model="survey.reward.status" :value="false")
                span 关闭
              label
                input(type="radio" v-model="survey.reward.status" :value="true")
                span 开启
            .survey-scores(v-if="survey.reward.status")
              h5.text-info 你当前拥有{{targetUserSurveyRewardScore/100}}{{surveyRewardScore.unit}}{{surveyRewardScore.name}}。
              h5.text-info(v-if="rewardKcbTotal") 每次提交奖励 {{survey.reward.onceKcb}} {{surveyRewardScore.unit}}{{surveyRewardScore.name}}，总共奖励 {{survey.reward.rewardCount}} 次，共计 {{rewardKcbTotal}} {{surveyRewardScore.unit}}{{surveyRewardScore.name}}。
              h5.text-danger(v-if="rewardWarning") {{rewardWarning}}
              h5 单次奖励
                input(type="text" v-model.number="survey.reward.onceKcb" @change="toInt")
                | &nbsp;{{surveyRewardScore.unit}}{{surveyRewardScore.name}}（精确到0.01），
                | 总奖励次数
                input(type="text" v-model.number="survey.reward.rewardCount" @change="toInt")
        .form-group
          label.col-sm-2.control-label 权限
          .col-sm-9.m-t-05.survey-scores
            .form.col-sm-12
              .form-group
                label 允许游客参与：
                .radio-inline.m-r-05.p-t-0
                  label
                    input(type="radio" v-model="survey.permission.visitor" :value="false")
                    | 否
                .radio-inline.p-t-0
                  label
                    input(type="radio" v-model="survey.permission.visitor" :value="true")
                    | 是
            div(v-if="!survey.permission.visitor")
              .form.col-sm-12
                .form-group
                  label 注册天数：
                  input(type="text" v-model.number="survey.permission.registerTime" @change="toInt")
              .form.col-sm-12
                .form-group
                  label 精选文章数：
                  input(type="text" v-model.number="survey.permission.digestThreadCount" @change="toInt")
              .form.col-sm-12
                .form-group
                  label 文章总数：
                  input(type="text" v-model.number="survey.permission.threadCount" @change="toInt")
              .form.col-sm-12
                .form-group
                  label 回复总数：
                  input(type="text" v-model.number="survey.permission.postCount" @change="toInt")
              .form.col-sm-12
                .form-group
                  label 点赞数：
                  input(type="text" v-model.number="survey.permission.voteUpCount" @change="toInt")
              .form.col-sm-12
                .form-group
                  label 用户等级：
                  .checkbox
                    label.m-r-1(v-for="g in grades")
                      input(type="checkbox" v-model="survey.permission.gradesId" :value="g._id")
                      span {{g.displayName}}
              h5.text-danger 用户必须同时满足以上条件才能参与。
              .form.col-sm-12
                .form-group
                  label 指定用户：
                  .selected-users(v-if="selectedUsers.length")
                    .selected-user(v-for="u in selectedUsers")
                      .selected-user-avatar
                        img(:src="getUrl('userAvatar', u.avatar, 'sm')")
                      .selected-user-name {{u.username}}
                        .fa.fa-remove(@click="removeUser(index)")

                  button.btn.btn-xs.btn-default(@click="selectUser") 选择用户
                  h5.text-danger 指定的用户无需满足以上条件即可参与。
        .form-group
          label.col-sm-2.control-label 时间
          .col-sm-9.m-t-05
            .col-sm-12.form
              .form-group
                label 开始：
                select(v-model="timeStart.year")
                  //option(value=(new Date()).getFullYear())=(new Date()).getFullYear()
                  -for(var i = new Date().getFullYear(); i < 2030; i++)
                    option(value=i)=i
                | &nbsp;年
                select(v-model="timeStart.month")
                  -for(var i = 1; i < 13; i++)
                    option(value=i)=i
                | &nbsp;月
                select(v-model="timeStart.day")
                  option(v-for="i in timeStartDay" :value="i") {{i}}
                | &nbsp;日&nbsp;
                select(v-model="timeStart.hour")
                  -for(var i = 0; i < 24; i++)
                    option(value=i)=i
                | &nbsp;时
                select(v-model="timeStart.minute")
                  -for(var i = 0; i < 60; i++)
                    option(value=i)=i
                | &nbsp;分
              .form-group
                label 结束：
                select(v-model="timeEnd.year")
                  -for(var i = (new Date().getFullYear()); i < 2030; i++)
                    option(value=i)=i
                | &nbsp;年
                select(v-model="timeEnd.month")
                  -for(var i = 1; i < 13; i++)
                    option(value=i)=i
                | &nbsp;月
                select(v-model="timeEnd.day")
                  option(v-for="i in timeEndDay" :value="i") {{i}}
                | &nbsp;日&nbsp;
                select(v-model="timeEnd.hour")
                  -for(var i = 0; i < 24; i++)
                    option(value=i)=i
                | &nbsp;时
                select(v-model="timeEnd.minute")
                  -for(var i = 0; i < 60; i++)
                    option(value=i)=i
                | &nbsp;分
                h5.text-danger(v-if="deadlineMax") 调查时间不能超过{{deadlineMax}}天。
    select-user(ref ="selectUser")
    resource-selector(ref= "resourceSelector")
</template>

<script>
import { nkcAPI } from "../../lib/js/netAPI";
import SelectUser from "./SelectUser"
import ResourceSelector from "../../lib/vue/ResourceSelector";
import { debounce } from '../../lib/js/execution';

export default {
  data: () => ({
    showSelectUser: false,
    disabled: true,
    deadlineMax: "",
    targetUser: "",
    targetUserSurveyRewardScore: "",
    surveyRewardScore: "",
    survey: "",
    newSurvey: "",
    grades: [],
    roles: [],
    users: [],
    timeEnd: {
      year: "",
      month: "",
      day: "",
      hour: "",
      minute: ""
    },
    timeStart: {
      year: "",
      month: "",
      day: "",
      hour: "",
      minute: ""
    },
    error: "",
    createSurveyPermission: '',
    type: '',
    post: '',
    changeContentDebounce: ''
  }),
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  components: {
    "resource-selector": ResourceSelector,
   "select-user": SelectUser,
  },
  watch: {
    data: {
      immediate: true,
      handler(n){
        this.createSurveyPermission = n.createSurveyPermission
        this.type = n.type
        this.post = n.post;
        this.initPostSurvey();
      }
    },
    changeData: {
      deep: true,
      handler() {
        this.changeContentDebounce()
      }
    }
  },
  computed: {
    selectedUsers: function() {
      var uid = this.survey.permission.uid || [];
      var arr = [];
      for (var i = 0; i < uid.length; i++) {
        var u = this.getUserById(uid[i]);
        if (u) arr.push(u);
      }
      return arr;
    },
    changeData() {
      // const { survey, selectedUsers, timeStart, timeEnd } = this
      return { survey: this.survey, timeStart: this.timeStart, timeEnd: this.timeEnd }
    },
    rewardKcbTotal: function() {
      var survey = this.survey;
      if (survey.reward.onceKcb && survey.reward.rewardCount) {
        return (survey.reward.onceKcb * survey.reward.rewardCount).toFixed(2);
      }
      return "";
    },
    rewardWarning: function() {
      var targetUser = this.targetUser;
      var survey = this.survey;
      var surveyRewardScore = this.surveyRewardScore;
      var targetUserSurveyRewardScore = this.targetUserSurveyRewardScore;
      if (
        targetUserSurveyRewardScore / 100 <
        survey.reward.onceKcb * survey.reward.rewardCount
      ) {
        return "你的" + surveyRewardScore.name + "不足，透支后将不再奖励。";
      }
      return "";
    },
    timeStartDay: function() {
      return NKC.methods.getDayCountByYearMonth(
        this.timeStart.year,
        this.timeStart.month
      );
    },
    timeEndDay: function() {
      return NKC.methods.getDayCountByYearMonth(
        this.timeEnd.year,
        this.timeEnd.month
      );
    },
    voteCount: function() {
      var arr = [];
      for (var i = 1; i <= this.survey.options.length; i++) {
        arr.push(i);
      }
      return arr;
    },
    formName: function() {
      return {
        vote: "发起投票",
        survey: "问卷调查",
        score: "评分"
      }[this.survey.type];
    }
  },
  created() {
    this.requestData();
    this.changeContentDebounce = debounce(this.changeContent, 2000);
  },
  mounted() {
    this.$nextTick(() => {
      this.initPostSurvey();
    });
  },
  methods: {
    getUrl: NKC.methods.tools.getUrl,
    changeContent() {
      this.$emit('info-change');
    },
    init(options) {
      options = options || {};
      if (options.pid) this.newSurvey.pid = options.pid;
      if (options.surveyId) {
        nkcAPI("/survey/" + options.surveyId, "GET")
          .then(data => {
            for (var i = 0; i < data.survey.options.length; i++) {
              var option = data.survey.options[i];
              option.links_ = this.modifyLinks(option.links);
              if (option.answers && option.answers.length) {
                for (var j = 0; j < option.answers.length; j++) {
                  var answer = option.answers[j];
                  answer.links_ = this.modifyLinks(answer.links);
                }
              }
            }
            data.survey.reward.onceKcb = data.survey.reward.onceKcb / 100;
            this.survey = data.survey;
            this.disabled = false;
            this.users = data.allowedUsers;
            this.targetUser = data.targetUser;
            this.setTime(new Date(this.survey.st), new Date(this.survey.et));
          })
          .catch(function(data) {
            sweetError(data);
          });
      } else {
        this.survey = this.newSurvey;
      }
    },
    getSurveyData() {
      return {
        ps: this.ps,
        options: this.ps
      };
    },
    getSurvey() {
      return this.submit();
    },
    removeUser: function(index) {
      this.survey.permission.uid.splice(index, 1);
    },
    getUserById: function(id) {
      var users = this.users;
      for (var i = 0; i < users.length; i++) {
        var u = users[i];
        if (u.uid === id) return u;
      }
    },
    newAnswer: function() {
      return {
        content: "",
        links: [],
        links_: [],
        resourcesId: [],
        minScore: 0,
        maxScore: 0
      };
    },
    newOption: function() {
      return {
        content: "",
        answers: [this.newAnswer()],
        links: [],
        links_: [],
        resourcesId: [],
        maxVoteCount: 1,
        minVoteCount: 1
      };
    },
    getVoteCount: function(o) {
      var count = (o.answers || []).length;
      var arr = [];
      for (var i = 1; i <= count; i++) {
        arr.push(i);
      }
      return arr;
    },
    getMinVoteCount: function(o) {
      var count = (o.answers || []).length;
      var arr = [];
      for (var i = 0; i <= count; i++) {
        arr.push(i);
      }
      return arr;
    },
    toInt: function() {
      var survey = this.survey;
      survey.permission.registerTime = parseInt(survey.permission.registerTime);
      survey.permission.digestThreadCount = parseInt(
        survey.permission.digestThreadCount
      );
      survey.permission.threadCount = parseInt(survey.permission.threadCount);
      survey.permission.postCount = parseInt(survey.permission.postCount);
      survey.permission.voteCount = parseInt(survey.permission.voteCount);
      for (var i = 0; i < survey.options.length; i++) {
        var option = survey.options[i];
        for (var j = 0; j < option.answers.length; j++) {
          var answer = option.answers[j];
          answer.maxScore = parseFloat(answer.maxScore.toFixed(2));
          answer.minScore = parseFloat(answer.minScore.toFixed(2));
        }
      }
      survey.reward.onceKcb = parseFloat(survey.reward.onceKcb.toFixed(2));
      survey.reward.rewardCount = parseInt(survey.reward.rewardCount);
    },
    modifyLinks: function(links, type) {
      var arr = [];
      for (var j = 0; j < links.length; j++) {
        var link = links[j];
        if (type === "str") {
          arr.push(link.link);
        } else {
          arr.push({
            index: j,
            link: link
          });
        }
      }
      return arr;
    },
    setTime: function(timeStart, timeEnd) {
      if (!timeStart) timeStart = new Date();
      if (!timeEnd) timeEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.timeStart = {
        year: timeStart.getFullYear(),
        month: timeStart.getMonth() + 1,
        day: timeStart.getDate(),
        hour: timeStart.getHours(),
        minute: timeStart.getMinutes()
      };
      this.timeEnd = {
        year: timeEnd.getFullYear(),
        month: timeEnd.getMonth() + 1,
        day: timeEnd.getDate(),
        hour: timeEnd.getHours(),
        minute: timeEnd.getMinutes()
      };
    },
    addAnswer: function(o) {
      o.answers.push(this.newAnswer());
    },
    removeResourceId: function(o, index) {
      o.resourcesId.splice(index, 1);
    },
    visitUrl: function(url) {
      NKC.methods.visitUrl(url, true);
    },
    removeOption: function(index) {
      sweetQuestion("确定要删除该问题？")
        .then(function() {
          this.survey.options.splice(index, 1);
        })
        .catch(function() {});
    },
    removeLink: function(o, index) {
      o.links_.splice(index, 1);
    },
    checkHttp: function(link) {
      const reg = /^(http|https):\/\//i;
      if (!reg.test(link.link)) {
        link.link = "http://" + link.link;
      }
    },
    addLink: function(o) {
      o.links_.push({
        index: o.links_.length,
        link: "http://"
      });
    },
    selectUser: function() {
      // this.showSelectUser = true;
      var app = this;
      this.$refs.selectUser.open(
        function(data) {
          var usersId = data.usersId;
          var users = data.users;
          app.users = app.users.concat(users);
          var permissionUid = app.survey.permission.uid;
          for (var i = 0; i < usersId.length; i++) {
            var uid = usersId[i];
            if (permissionUid.indexOf(uid) === -1) {
              permissionUid.push(uid);
            }
          }
        },
        {
          userCount: 999,
          selectedUsersId: this.survey.permission.uid || []
        }
      );
    },
    addResource: function(o) {
      // if (!window.SelectResource) {
      //   if (NKC.modules.SelectResource) {
      //     window.SelectResource = new NKC.modules.SelectResource();
      //   } else {
      //     return sweetError("未引入选择资源附件模块");
      //   }
      // }
      this.$refs.resourceSelector.open(
        data => {
          var resourcesId = data.resourcesId;
          for (var i = 0; i < resourcesId.length; i++) {
            var id = resourcesId[i];
            if (o.resourcesId.indexOf(id) === -1) o.resourcesId.push(id);
          }
          this.$refs.resourceSelector.close()
        },
        {
          allowedExt: ["picture"]
        }
      );
    },
    addOption: function() {
      this.survey.options.push(this.newOption());
    },
    // 复制问题或选项
    copy: function(arr, o) {
      if (o) {
        arr.push(JSON.parse(JSON.stringify(o)));
      } else {
        arr.push(JSON.parse(JSON.stringify(arr[arr.length - 1])));
      }
    },
    moveOption: function(type, o, answer) {
      var options, index;
      if (answer !== undefined) {
        options = o.answers;
        index = options.indexOf(answer);
      } else {
        options = this.survey.options;
        index = options.indexOf(o);
      }
      var other;
      var otherIndex;
      if (type === "up") {
        if (index === 0) return;
        otherIndex = index - 1;
      } else {
        if (index + 1 === options.length) return;
        otherIndex = index + 1;
      }
      other = options[otherIndex];
      options[index] = other;
      if (answer !== undefined) {
        options[otherIndex] = answer;
        Vue.set(options, otherIndex, answer);
      } else {
        options[otherIndex] = o;
        Vue.set(options, otherIndex, o);
      }
    },
    removeAnswer: function(o, index) {
      sweetQuestion("确定要移除该选项？")
        .then(function() {
          o.answers.splice(index, 1);
        })
        .catch(function() {});
    },
    selectType: function(type) {
      this.survey.type = type;
      if (
        type === "vote" &&
        (!this.survey.options || !this.survey.options.length)
      ) {
        this.survey.options = [this.newOption()];
      }
    },
    te: function(err) {
      // this.error = err.error || err;
      throw err;
    },
    submit: function() {
      if (this.disabled) return;
      this.error = "";
      var survey = JSON.parse(JSON.stringify(this.survey));
      var this_ = this;
      for (var i = 0; i < survey.options.length; i++) {
        var option = survey.options[i];
        option.links = this_.modifyLinks(option.links_, "str");
        for (var j = 0; j < option.answers.length; j++) {
          var answer = option.answers[j];
          if (survey.type === "score") {
            answer.maxScore = parseFloat(answer.maxScore.toFixed(2));
            answer.minScore = parseFloat(answer.minScore.toFixed(2));
          }
          answer.links = this_.modifyLinks(answer.links_, "str");
        }
      }
      var timeEnd = this.timeEnd;
      var timeStart = this.timeStart;
      var st = new Date(
        timeStart.year +
          "-" +
          timeStart.month +
          "-" +
          timeStart.day +
          " " +
          timeStart.hour +
          ":" +
          timeStart.minute
      );
      var et = new Date(
        timeEnd.year +
          "-" +
          timeEnd.month +
          "-" +
          timeEnd.day +
          " " +
          timeEnd.hour +
          ":" +
          timeEnd.minute
      );
      survey.st = st;
      survey.et = et;
      survey.reward.onceKcb = parseFloat(survey.reward.onceKcb || 0);
      survey.reward.rewardCount = parseInt(survey.reward.rewardCount || 0);
      survey.reward.onceKcb = survey.reward.onceKcb * 100;
      return survey;
    },
    requestData() {
      const this_ = this;
      this_.setTime();
      this_.newSurvey = {
        st: "",
        et: "",
        showResult: "all",
        disabled: false,
        showVoter: "always",
        reward: { rewardedCount: 0, rewardCount: 0, onceKcb: 0, status: false },
        permission: {
          visitor: false,
          voteUpCount: 0,
          postCount: 0,
          threadCount: 0,
          digestThreadCount: 0,
          registerTime: 0,
          gradesId: [1],
          certsId: ["default"],
          uid: []
        },
        description: "",
        options: [this.newOption()],
        type: "vote"
      };
      nkcAPI("/survey?t=thread", "GET").then( (data)=> {
        this.deadlineMax = data.deadlineMax;
        this.grades = data.grades;
        var arr = [];
        for (var i = 0; i < data.grades.length; i++) {
          arr.push(data.grades[i]._id);
        }
        this.newSurvey.permission.gradesId = arr;
        this.roles = data.roles;
        this.targetUser = data.user;
        this.surveyRewardScore = data.surveyRewardScore;
        this.targetUserSurveyRewardScore = data.targetUserSurveyRewardScore;
      });
    },
    hideButton() {
      $(this.$refs.disabledSurveyButton).hide();
    },
    initPostSurvey() {
      this.init({ surveyId: this.post?.surveyId || "" });
      if (this.type !== "newThread") {
        this.hideButton();
      }
      if (this.post && this.post.surveyId) {
        this.disabledSurveyForm();
      }
    },
    disabledSurveyForm() {
      this.disabled = !this.disabled;
    },
    getData() {
      if (this.getSurvey()) {
        return {
          survey: this.getSurvey()
        };
      }
    }
  }
};
</script>

<style scoped>
.editor-header{
  font-size: 1.25rem;
  margin: 0.3rem 0;
  color: #555;
  font-weight: 700;
}
.editor-header small{
  color: #88919d;
}
.disabledSurveyButton{
  margin-left: 5px;
}
.btn-success {
  color: #fff;
  background-color: #5cb85c;
  border-color: #4cae4c;
}
.btn-success:focus,
.btn-success.focus {
  color: #fff;
  background-color: #449d44;
  border-color: #255625;
}
.btn-success:hover {
  color: #fff;
  background-color: #449d44;
  border-color: #398439;
}
.btn-danger {
  color: #fff;
  background-color: #d9534f;
  border-color: #d43f3a;
}
.btn-danger:focus,
.btn-danger.focus {
  color: #fff;
  background-color: #c9302c;
  border-color: #761c19;
}
.btn-danger:hover {
  color: #fff;
  background-color: #c9302c;
  border-color: #ac2925;
}
.btn-danger .badge {
  color: #d9534f;
  background-color: #fff;
}
.btn {
  vertical-align: top;
}
.survey-type {
  display: inline-block;
  margin-right: 1rem;
  cursor: pointer;
  padding-top: 7px;
}
.survey-type span {
  font-weight: 700;
}
.survey-type .fa {
  margin-right: 0.3rem;
  font-size: 15px;
  color: green;
}
.survey-type .fa-circle-o {
  color: #555;
}
.option-answers {
  padding: 0.5rem;
  padding-left: 2rem;
  /*background-color: #eee;*/
}
.add-option-button {
  cursor: pointer;
  font-weight: 700;
  /*color: #2b90d9;*/
}
.survey-option {
  padding: 0.5rem;
  margin-bottom: 1rem;
  background-color: #f4f4f4;
  border-radius: 3px;
}
.survey-option:first-child {
  border-top: none;
}
.survey-option .fa {
  cursor: pointer;
  font-size: 1.2rem;
  color: #888;
  display: inline-block;
  width: 1.5rem;
  text-align: center;
}
.survey-options {
  margin-top: 0.5rem;
}
.option-index {
  font-weight: 700;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}
.option-resources {
  margin-top: 0.5rem;
  font-size: 0;
}
.option-resource {
  height: 5rem;
  display: inline-block;
  width: 7rem;
  line-height: 5rem;
  background-color: #000;
  margin: 0 0.5rem 0.5rem 0;
}
.option-resource-img {
  height: 100%;
  width: 100%;
  background-size: cover;
}
.option-resource {
  font-size: 0;
  cursor: pointer;
  position: relative;
  text-align: center;
}
.option-resource img {
  max-height: 100%;
  max-width: 100%;
}
.option-resource .fa {
  position: absolute;
  display: none;
  top: 0;
  right: 0;
  height: 2rem;
  font-size: 1rem;
  text-align: center;
  line-height: 2rem;
  width: 2rem;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
}
.option-resource:hover .fa {
  display: block;
}
@media (max-width: 991px) {
  .option-resource .fa {
    display: block;
  }
}
.survey-answers {
  background-color: #f4f4f4;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}
.survey-answer {
  margin-bottom: 0.5rem;
}
.survey-scores input {
  max-width: 3rem;
}
.module-survey-form .option-content {
  font-weight: 700;
  /*margin-bottom: 0.5rem;*/
}
.module-survey-form .survey-form-description {
  font-size: 1.4rem;
  font-weight: 700;
}
.module-survey-form .option-resource > img {
  height: 6rem;
  cursor: pointer;
  margin-right: 0.5rem;
  margin-bottom: 0.3rem;
}
.module-survey-form .option-resource > div {
  height: 6rem;
  display: inline-block;
  width: 9rem;
  margin-right: 0.5rem;
  border-radius: 3px;
  vertical-align: top;
  cursor: pointer;
  background-size: cover;
}
.module-survey-form .survey-form-option {
  margin: 1rem 0;
}
.module-survey-form .option-links {
  display: table-cell;
  vertical-align: top;
}
.module-survey-form .option-link {
  width: 100%;
  overflow: hidden;
  cursor: pointer;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  word-break: break-all;
  height: 1.5rem;
}
.module-survey-form .option-content {
  position: relative;
  padding-right: 6rem;
}
.module-survey-form .option-content.option-survey {
  padding-right: 0;
}
.module-survey-form .option-button {
  width: 6rem;
  position: absolute;
  top: 0;
  right: 0;
  text-align: right;
  font-size: 1.4rem;
  cursor: pointer;
}
.module-survey-form .option-button select {
  font-size: 1.2rem;
  font-weight: normal;
}
.module-survey-form .option-button span.score {
  font-size: 1.2rem;
  font-weight: normal;
  color: #667282;
}
.module-survey-form .option-button .fa.fa-square-o {
  color: #888;
}
.module-survey-form .option-button .fa.fa-check-square-o {
  color: #2b90d9;
}
.module-survey-form .form-warning {
  color: #808080;
  margin-bottom: 0.5rem;
}
.module-survey-form .option-answer span.active {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2b90d9;
}
.module-survey-form .option-answers {
  padding-left: 1rem;
}
.module-survey-form .option-answer.error {
  border: 3px solid #ff5200;
}
.module-survey-form .option-answer {
  background-color: #f6f6f6;
  margin: 0.5rem 0;
  border-radius: 3px;
  padding: 0.5rem;
}
.module-survey-form .option-content {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 1.25rem;
  /*background-color: #f4f4f4;*/
}
.module-survey-form .answer-content {
  background-color: #f6f6f6;
  font-weight: normal;
  padding-right: 0;
  font-size: 1.2rem;
  margin-bottom: 0;
}
.module-survey-form .answer-content .option-button {
  width: 10rem;
}
.module-survey-form .survey-score-input {
  max-width: 2rem;
  font-size: 1.2rem;
}
.module-survey-form .survey-score-score {
  font-size: 1rem;
}
.module-survey-form .option-status {
  position: relative;
  overflow: hidden;
  height: 2rem;
  line-height: 2rem;
}
.module-survey-form .option-status .number {
  position: absolute;
  transition: width 2s;
  top: 0;
  left: 0;
  height: 8px;
  border-radius: 4px;
}
.module-survey-form .number-background {
  position: absolute;
  border-radius: 4px;
  top: 0;
  left: 0;
  width: 100%;
  height: 8px;
  background-color: rgba(0, 0, 0, 0.05);
}
.module-survey-form .option-status-container {
  position: relative;
  margin-right: 8rem;
  margin-top: 0.6rem;
}
.module-survey-form .option-status-info {
  position: absolute;
  top: 0;
  width: 8rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  text-align: right;
  word-break: break-all;
  color: #9baec8;
  right: 0;
}
.module-survey-form .option-status-info.survey-score {
  width: 100%;
  position: relative;
  padding-top: 0.3rem;
  text-align: right;
}
.module-survey-form .form-post-users a {
  display: inline-block;
  margin-right: -1rem;
}
.module-survey-form .form-post-users a img {
  height: 3rem;
  width: 3rem;
  border: 2px solid #f4f4f4;
  border-radius: 50%;
}
.module-survey-form .option-score-input {
  display: inline-block;
  color: #888;
}
.module-survey-form .option-score-input input {
  width: 4rem;
}
.module-survey-form .option-score-input .score {
  font-size: 1.2rem;
  font-weight: 700;
  /*color: #9baec8;*/
  display: inline;
}
.module-survey-form .option-score-limit {
  display: inline-block;
}

.module-survey-form .option-select-count {
  text-align: right;
  font-size: 1.2rem;
  color: #9baec8;
}

.selected-users {
  padding: 0.5rem 0;
}
.selected-user {
  font-size: 0;
  display: inline-block;
  margin: 0 0.5rem 0.5rem 0;
  vertical-align: top;
}
.selected-user-avatar img {
  height: 2rem;
  width: 2rem;
  border-radius: 3px 0 0 3px;
}
.selected-user-avatar {
  display: inline-block;
  vertical-align: top;
}
.selected-user-name {
  vertical-align: top;
  display: inline-block;
  height: 2rem;
  line-height: 2rem;
  padding: 0 0.5rem;
  border-radius: 0 3px 3px 0;
  font-size: 1.2rem;
  background-color: #999;
  color: #fff;
}
.selected-user-name .fa {
  cursor: pointer;
}
</style>
