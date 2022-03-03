<template lang="pug">
.container-fluid.max-width
  .article-common.col-xs-12.col-md-9.m-b-1.box-shadow-panel 
    .calendar
      div(ref="canvasDom", style="min-height: 29rem")
      #set-year
        select(@change="summaryCalendar", v-model="selected")
          template(v-for="year in years")
            option(:key="year", :value="year") {{ year }}
    .pie
      #pie(ref="renderPie" style="min-height: 29rem")
</template>

<script>
import { getState } from "../../lib/js/state";
import { detailedTime } from "../../lib/js/time";


export default {
  data: () => ({
    user: "",
    year: "2022",
    dom: "",
    myChart: "",
    years: [],
    selected: "",
  }),
  created() {
    this.user = getState();
  },
  mounted() {
    this.dom = this.$refs.canvasDom;
    this.setYear(this.year);
    this.getPie();
  },
  methods: {
    getPie() {
      nkcAPI("/u/" + this.user.uid + "/profile/summary/pie", "GET")
        .then((data)=> {
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
      nkcAPI(
        "/u/" + this.user.uid + "/profile/summary/calendar?year=" + this.year,
        "GET"
      )
        .then((data) => {
          this.initEcharts(data.posts);
          this.createYearList(data.targetUser.toc);
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
      this.selected = this.years[0];
      // this.dom.appendChild(select[0]);
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
        var timeName = detailedTime(i).slice(0, 11);
        times[detailedTime(i).slice(0, 11)] = timeObj[timeName] || 0;
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
          text: this.year + "年发表统计",
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
        /*visualMap: {
        min: 1,
        max: maxMap,
        type: 'piecewise',
        orient: 'horizontal',
        left: 'center',
        top: 65,
        /!*inRange: {
          color: [
            'rgba(191, 68, 76, 1)',
            'rgba(191, 68, 76, 0.8)',
            'rgba(191, 68, 76, 0.6)',
            'rgba(191, 68, 76, 0.4)',
            'rgba(191, 68, 76, 0.2)'
          ],
        },*!/
        textStyle: {
          color: '#000'
        }
      },*/
        calendar: {
          top: 120,
          left: 30,
          right: 30,
          cellSize: ["auto", 13],
          range: this.year,
          /*splitLine: {
          show: false
        },*/
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
      this.year = year || new Date().getFullYear();
      this.begin = new Date(this.year + "-1-1 00:00:00").getTime();
      this.end = new Date(this.year + 1 + "-1-1 00:00:00").getTime();
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
<style scoped>
#set-year {
  position: absolute;
  top: 10px;
  right: 10px;
}
</style>
