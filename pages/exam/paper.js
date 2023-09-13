import { sweetConfirm } from '../lib/js/sweetAlert';

var app = new Vue({
  el: '#app',
  data: {
    submitted: false,
    passed: '',
    paper: '',
    created: false,
    category: '',
    questions: [],
    countdown: '',
    timeOut: false,
    countToday: 0,
    countOneDay: 0,
  },
  methods: {
    format: NKC.methods.format,
    compute: function () {
      var toc = this.paper.toc;
      var time = Date.now() - new Date(toc).getTime();
      time = this.category.time * 60 * 1000 - time;
      if (time < 0) {
        time = 0;
        this.timeOut = true;
      }
      var minutes = Math.floor(time / (1000 * 60));
      var seconds = Math.floor((time - minutes * 60 * 1000) / 1000);
      if (minutes < 10) {
        minutes = '0' + minutes;
      }
      if (seconds < 10) {
        seconds = '0' + seconds;
      }
      this.countdown = minutes + ' 分钟 ' + seconds + ' 秒 ';
    },
    submit: function () {
      Promise.resolve()
        .then(() => {
          if (this.unfinished) {
            return sweetConfirm('您还有未做完的题目，是否要提交');
          }
        })
        .then(() => {
          const questions = this.questions.map((item) => ({
            _id: item._id,
            selected:
              item.type !== 'ch4'
                ? null
                : Array.isArray(item.selected)
                ? item.selected
                : [item.selected],
            fill: item.type !== 'ans' ? null : item.fill,
          }));
          this.submitted = true;
          nkcAPI('/exam/paper/' + app.paper._id, 'post', {
            questions,
          })
            .then(function (data) {
              app.passed = data.passed;
            })
            .catch(function (data) {
              screenTopWarning(data);
              app.submitted = false;
            });
        });
    },
  },
  mounted: function () {
    var href = window.location.href;
    if (href.indexOf('?') !== -1) {
      href += '&t=' + Date.now();
    } else {
      href += '?t=' + Date.now();
    }
    nkcAPI(href, 'GET', {})
      .then(function (data) {
        app.paper = data.paper;
        app.created = !!data.created;
        app.category = data.category;
        app.countToday = data.countToday;
        app.countOneDay = data.examSettings.countOneDay;
        const questions = data.questions;
        app.questions = questions.map((item, index) => {
          const obj = {
            type: item.type,
            content_: NKC.methods.custom_xss_process(
              NKC.methods.mdToHtml(index + 1 + '、' + item.content),
            ),
            _id: item.qid,
          };
          //填空题值唯一
          if (item.type === 'ans') {
            obj.fill = '';
          } else if (item.type === 'ch4') {
            obj.ans_ = [];
            //判断是否为多选题
            obj.isMultiple = item.isMultiple;
            obj.selected = [];
            obj.isIndefinite = item.isIndefinite;
            for (let j = 0; j < item.answer.length; j++) {
              obj.ans_[j] = NKC.methods.custom_xss_process(
                NKC.methods.mdToHtml(
                  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][j] +
                    '. ' +
                    item.answer[j].text,
                ),
              );
            }
          }
          return obj;
        });
        setInterval(function () {
          app.compute();
        }, 500);
        setTimeout(function () {
          NKC.methods.renderFormula();
        }, 500);
      })
      .catch(function (err) {
        screenTopWarning(err);
      });
  },
  computed: {
    //未做完的题
    unfinished() {
      let count = 0;
      this.questions.forEach((question) => {
        const { type, selected, fill } = question;
        //选择题
        if (type === 'ch4' && selected.length === 0) {
          count += 1;
          //填空题
        } else if (type === 'ans' && !fill) {
          count += 1;
        }
      });
      if (count > 0) {
        return `您还有 ${count} 道题没有作答。`;
      } else {
        return '';
      }
    },
  },
});
