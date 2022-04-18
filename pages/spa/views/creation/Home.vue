<template lang="pug">
.standard-fluid-max-container.clear-float
  .article-common.col-xs-12.col-md-9.m-b-1.box-shadow-panel.xs-p.clear-padding
    .calendar.overflow-x
      .min-h(ref="canvasDom")
      #set-year
        select(@change="summaryCalendar", v-model="selected")
          template(v-for="year in years")
            option(:key="year", :value="year") {{ year }}
    .pie.overflow-x
      #pie.min-h(ref="renderPie")
    .account-logs
      .account-header 最近阅读
      .account-description
      div
        .account-logs-thread(v-for="(vt, i) in visitThreadLogs", :key="i")
          span {{ setTime(vt.timeStamp) }}
          span 看过
          a(:href="'/t/' + vt.tid") {{ vt.thread.firstPost.t }}
    .account-logs
      .account-header 看过的用户
      .account-description
      div
        div(v-if="!visitUserLogs.length")
          .null 空空如也~
        .account-logs-user(v-for="(log, i) in visitUserLogs", :key="i")
          .account-logs-user-avatar
            //- img(src=tools.getUrl("userAvatar", log.targetUser.avatar, "sm") data-float-uid=log.toUid)
            img(:src="log.targetUser.avatar")
          .account-logs-user-info
            a.account-logs-user-name(:href="'/u/' + log.toUid") {{ log.targetUser.username }}
            .account-logs-user-time {{ setTime(log.timeStamp) }}

    .account-logs
      .account-header 我的读者排名
      .account-description
      div
        div(v-if="!visitSelfLogs.length")
          .null 空空如也~
        .account-logs-user(v-for="(log, i) in visitSelfLogs")
          .account-logs-user-avatar
            //- img(src=tools.getUrl("userAvatar", log.user.avatar, "sm") data-float-uid=log.uid)
            img(:src="log.user.avatar")
          .account-logs-user-info
            a.account-logs-user-name(:href="'/u/' + log.uid") {{ log.user.username }}
            .account-logs-user-time {{ setTime(log.timeStamp) }}
</template>

<script>
import { getState } from "../../../lib/js/state";
import { detailedTime } from "../../../lib/js/time";
import { fromNow } from "../../../lib/js/tools";

export default {
  data: () => ({
    user: "",
    dom: "",
    myChart: "",
    years: [],
    selected: new Date().getFullYear(),
    visitThreadLogs: [],
    visitUserLogs: [],
    visitSelfLogs: [],
  }),
  computed: {},
  created() {
    this.user = getState();
    this.getuser();
  },
  mounted() {
    this.dom = this.$refs.canvasDom;
    this.setYear(this.selected);
    this.getPie();
  },
  methods: {
    setTime(time) {
      return fromNow(time);
    },
    async getuser() {
      nkcAPI(`/creation/home/visit`, "GET")
        .then((data) => {
          this.visitThreadLogs = data.visitThreadLogs;
          this.visitUserLogs = data.visitUserLogs;
          this.visitSelfLogs = data.visitSelfLogs;
        })
        .catch(sweetError);
    },
    getPie() {
      nkcAPI("/creation/home/active", "GET")
        .then((data) => {
          this.renderPie(data.pie);
        })
        .catch(sweetError);
    },
    renderPie(data) {
      var forumsName = [],
        summaryData = [],
        colors = [];
      for (var i = 0; i < data.length; i++) {
        var f = data[i];
        forumsName.push(f.forumName);
        colors.push(f.color);
        summaryData.push({
          value: f.count,
          name: f.forumName + "(" + f.count + "条)",
        });
      }
      // console.log(this.$refs.render-pie)
      var myChart = echarts.init(this.$refs.renderPie);
      var option = {
        title: {
          text: "活跃领域",
          subtext: "根据用户发表的文章和回复统计",
          x: "left",
        },
        tooltip: {
          trigger: "item",
          formatter: "{b} : {d}%",
        },
        legend: {
          show: false,
          x: "center",
          y: "bottom",
          data: forumsName,
        },
        color: colors,
        toolbox: {
          show: false,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: {
              show: true,
              type: ["pie", "funnel"],
            },
            restore: { show: true },
            saveAsImage: { show: true },
          },
        },
        calculable: true,
        series: [
          {
            name: "访问来源",
            type: "pie",
            radius: "50%",
            center: ["50%", "60%"],
            data: summaryData,
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
      myChart.setOption(option);
    },
    getData() {
      nkcAPI("/creation/home/calendar?year=" + this.selected, "GET")
        .then((data) => {
          this.initEcharts(data.posts);
          this.createYearList(data.user.toc);
        })
        .catch(sweetError);
    },
    createYearList(toc) {
      this.years = [];
      var registerYear = new Date(toc).getFullYear();
      var nowYear = new Date().getFullYear();
      for (var i = nowYear; i >= registerYear; i--) {
        this.years.push(i);
      }
    },
    initEcharts(data) {
      if (this.myChart && this.myChart.dispose) {
        this.myChart.dispose();
      }
      var timeObj = {};
      for (var i = 0; i < data.length; i++) {
        var t = data[i];
        timeObj[t._id] = t.count;
      }
      var times = {};
      for (var i = this.begin; i < this.end; i = i + 24 * 60 * 60 * 1000) {
        var timeName = detailedTime(i).slice(0, 10);
        times[detailedTime(i).slice(0, 10)] = timeObj[timeName] || 0;
      }
      data = [];
      var max = 0;
      for (var i in times) {
        if (!times.hasOwnProperty(i)) continue;
        if (times[i] > max) max = times[i];
        data.push([i, times[i]]);
      }
      var start = 1,
        pieceMax = 10000;
      var defaultPieces = [];
      for (var i = start; i < pieceMax; i = i * 2) {
        defaultPieces.push({
          min: i,
          max: i * 2 - 1,
        });
      }
      var pieces = [];
      for (var i = 0; i < defaultPieces.length; i++) {
        var p = defaultPieces[i];
        if (max >= p.min) {
          pieces.push(p);
        }
      }
      if (!pieces.length) {
        pieces.push({
          min: 1,
          max: 1,
        });
      }
      var option = {
        title: {
          left: "left",
          subtext: "根据用户发表的文章和回复统计",
          text: this.selected + "年发表统计",
        },
        tooltip: {},
        visualMap: [
          {
            type: "piecewise",
            left: "center",
            orient: "horizontal",
            top: 65,
            pieces: pieces,
          },
        ],
        calendar: {
          top: 120,
          left: 30,
          right: 30,
          cellSize: ["auto", 13],
          range: this.selected,
          dayLabel: {
            nameMap: "cn",
          },
          monthLabel: {
            nameMap: "cn",
          },
          splitLine: {
            lineStyle: {
              color: "#666",
              width: 2,
            },
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: "#fff",
            color: "#f5f5f5",
          },
          yearLabel: { show: false },
        },
        series: {
          type: "heatmap",
          coordinateSystem: "calendar",
          data: data,
        },
      };

      this.myChart = echarts.init(this.dom);
      this.myChart.setOption(option);
    },
    setYear(year) {
      if (year) year = parseInt(year);
      this.selected = year || new Date().getFullYear();
      this.begin = new Date(this.selected + "-1-1 00:00:00").getTime();
      this.end = new Date(this.selected + 1 + "-1-1 00:00:00").getTime();
      this.getData();
    },
    summaryCalendar() {
      // console.log(year);
      this.setYear(this.selected);
    },
    navTo(name) {
      this.$router.push({ name });
    },
  },
};
</script>
<style scoped lang="less">
.box-shadow-panel > div {
  box-shadow: none;
  padding: 0;
  background-color: #fff;
  border-radius: 3px;
}
@media (max-width: 992px) {
  .col-xs-12 {
    width: 100%;
    float: left;
    position: relative;
    min-height: 1px;
}
}
@media (min-width: 992px) {
    .col-md-3 {
    width: 25%;
    float: left;
  }
  .col-md-9 {
    width: 75%;
    float: left;
  }
}

.row:before{
    display: table;
    content: " ";
}
.row::after{
  display: table;
  content: " ";
}
*{
  box-sizing: border-box;
}
*:before, *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
}
*::after{
  clear: both
}
.m-b-2 {
    margin-bottom: 2rem;
}
.row {
    margin-right: -15px;
    margin-left: -15px;
}

.col-md-9 {
  position: relative;
  min-height: 1px;
  padding-right: 15px;
  padding-left: 15px;
}
.clear-padding{
  padding: 0;
}
.clear-marginLR{
  margin-left: 0;
  margin-right: 0;
}

 @max-width: 1000px;
//  @media (max-width: @max-width) {
//    .xs-p{
//       padding: 0 1rem;
//     }
//  }
.overflow-x{
  @media screen and (max-width: @max-width) {
    overflow-x: scroll;
    width: 100%;
    
  }

}
.min-h {
  min-height: 25rem;
  @media screen and (max-width: @max-width){
    min-width: 45rem;

  }
}
.account-logs .account-logs-user .account-logs-user-info {
  width: 7rem;
  display: table-cell;
  vertical-align: top;
  height: 3rem;
  .account-logs-user-name {
    height: 1.5rem;
    color: #2b90d9;
    font-weight: 700;
    word-break: break-word;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .account-logs-user-time {
    font-size: 1rem;
    margin-top: 0.2rem;
    color: #aaa;
  }
}
.account-logs .account-logs-thread {
  a {
    font-size: 1.25rem;
    color: #2b90d9;
  }
  span {
    color: #e85a71;
    margin-right: 0.5rem;
  }
}
.account-logs .account-logs-user {
  display: inline-block;
  width: 10.4rem;
  margin: 0 0.5rem 0.5rem 0;
  .account-logs-user-avatar img {
    height: 3rem;
    width: 3rem;
    border-radius: 50%;
    margin-right: 0.5rem;
  }
  .account-logs-user-avatar {
    display: table-cell;
    vertical-align: top;
  }
}
.null {
  padding-top: 5rem;
  padding-bottom: 5rem;
  text-align: center;
}
.account-header {
  margin-bottom: 10px;
  font-size: 1.4rem;
  font-weight: 700;
}
.calendar {
  position: relative;
}
.clear-float::after{
  content: "";
  display: block;
  clear: both;
}
#set-year {
  position: absolute;
  top: 1.3rem;
  right: 10px;
}
</style>
