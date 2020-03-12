(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*
import Highlighter from 'web-highlighter';

window.noteApp = new Vue({
  el: "#modulePostNotes",
  data: {
    notes: [],
    hl: ""
  },
  mounted() {
    this.initHighLighter();
  },
  computed: {
    notesObj() {
      const obj = {};
      this.notes.map(n => {
        obj[n.id] = n;
      });
      return obj;
    },
    notesOrder() {
      const {notes} = this;

    }
  },
  methods: {
    initHighLighter() {
      this.hl = new Highlighter({
        exceptSelectors: ["code", "pre"]
      });
      this.hl.on(Highlighter.event.CREATE, this.onCreate);
      this.hl.on(Highlighter.event.CLICK, this.onClick);
      this.hl.on(Highlighter.event.HOVER, this.onHover);
      this.hl.on(Highlighter.event.HOVER_OUT, this.onHoverOut);
      this.hl.run();
    },
    resetPanel() {
      const notes_ = this.notes;
      this.notes.map(n => n.active = false);
    },
    onCreate(data) {
      console.log("创建：");
      console.log(data);
      const self = this;
      const id = data.sources[0].id;
      let dom = this.hl.getDoms(id)[0];
      dom = $(dom);
      const btn = $(`<i data-post-node-id='${id}'>添加批注</i>`);
      dom.append(btn);
      btn.on("click", function() {
        
      });
      /!* this.resetPanel();
      data.sources.map(node => {
        const {id} = node;
        self.notes.push({
          id,
          active: true,
          node,
          comment: ""
        });
      });
      console.log(self.notes); *!/
    },
    removeNode(n) {
      const {id} = n;
      const {hl, notes} = this;
      const index = notes.indexOf(n);
      hl.remove(id);
      notes.splice(index, 1);
    },
    editNode(n) {
      this.resetPanel();
      n.active = true;
    },
    onClick({id}) {
      console.log("点击：");
      console.log(id);
      const {notesObj, notes} = this;
      this.resetPanel();
      notesObj[id].active = true;
    },
    onHover({id}) {
      this.hl.addClass('highlight-wrap-hover', id);  
    },
    onHoverOut({id}) {
      this.hl.removeClass('highlight-wrap-hover', id);
    }
  }
})

// 2. 从后端获取高亮信息，还原至网页
// getRemoteData().then(s => highlighter.fromStore(s.startMeta, s.endMeta, s.id, s.text));
*/
"use strict";

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL3B1YmxpY01vZHVsZXMvcG9zdE5vdGVzL3Bvc3ROb3Rlcy5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qXHJcbmltcG9ydCBIaWdobGlnaHRlciBmcm9tICd3ZWItaGlnaGxpZ2h0ZXInO1xyXG5cclxud2luZG93Lm5vdGVBcHAgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjbW9kdWxlUG9zdE5vdGVzXCIsXHJcbiAgZGF0YToge1xyXG4gICAgbm90ZXM6IFtdLFxyXG4gICAgaGw6IFwiXCJcclxuICB9LFxyXG4gIG1vdW50ZWQoKSB7XHJcbiAgICB0aGlzLmluaXRIaWdoTGlnaHRlcigpO1xyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIG5vdGVzT2JqKCkge1xyXG4gICAgICBjb25zdCBvYmogPSB7fTtcclxuICAgICAgdGhpcy5ub3Rlcy5tYXAobiA9PiB7XHJcbiAgICAgICAgb2JqW24uaWRdID0gbjtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiBvYmo7XHJcbiAgICB9LFxyXG4gICAgbm90ZXNPcmRlcigpIHtcclxuICAgICAgY29uc3Qge25vdGVzfSA9IHRoaXM7XHJcblxyXG4gICAgfVxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgaW5pdEhpZ2hMaWdodGVyKCkge1xyXG4gICAgICB0aGlzLmhsID0gbmV3IEhpZ2hsaWdodGVyKHtcclxuICAgICAgICBleGNlcHRTZWxlY3RvcnM6IFtcImNvZGVcIiwgXCJwcmVcIl1cclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuaGwub24oSGlnaGxpZ2h0ZXIuZXZlbnQuQ1JFQVRFLCB0aGlzLm9uQ3JlYXRlKTtcclxuICAgICAgdGhpcy5obC5vbihIaWdobGlnaHRlci5ldmVudC5DTElDSywgdGhpcy5vbkNsaWNrKTtcclxuICAgICAgdGhpcy5obC5vbihIaWdobGlnaHRlci5ldmVudC5IT1ZFUiwgdGhpcy5vbkhvdmVyKTtcclxuICAgICAgdGhpcy5obC5vbihIaWdobGlnaHRlci5ldmVudC5IT1ZFUl9PVVQsIHRoaXMub25Ib3Zlck91dCk7XHJcbiAgICAgIHRoaXMuaGwucnVuKCk7XHJcbiAgICB9LFxyXG4gICAgcmVzZXRQYW5lbCgpIHtcclxuICAgICAgY29uc3Qgbm90ZXNfID0gdGhpcy5ub3RlcztcclxuICAgICAgdGhpcy5ub3Rlcy5tYXAobiA9PiBuLmFjdGl2ZSA9IGZhbHNlKTtcclxuICAgIH0sXHJcbiAgICBvbkNyZWF0ZShkYXRhKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwi5Yib5bu677yaXCIpO1xyXG4gICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IGlkID0gZGF0YS5zb3VyY2VzWzBdLmlkO1xyXG4gICAgICBsZXQgZG9tID0gdGhpcy5obC5nZXREb21zKGlkKVswXTtcclxuICAgICAgZG9tID0gJChkb20pO1xyXG4gICAgICBjb25zdCBidG4gPSAkKGA8aSBkYXRhLXBvc3Qtbm9kZS1pZD0nJHtpZH0nPua3u+WKoOaJueazqDwvaT5gKTtcclxuICAgICAgZG9tLmFwcGVuZChidG4pO1xyXG4gICAgICBidG4ub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBcclxuICAgICAgfSk7XHJcbiAgICAgIC8hKiB0aGlzLnJlc2V0UGFuZWwoKTtcclxuICAgICAgZGF0YS5zb3VyY2VzLm1hcChub2RlID0+IHtcclxuICAgICAgICBjb25zdCB7aWR9ID0gbm9kZTtcclxuICAgICAgICBzZWxmLm5vdGVzLnB1c2goe1xyXG4gICAgICAgICAgaWQsXHJcbiAgICAgICAgICBhY3RpdmU6IHRydWUsXHJcbiAgICAgICAgICBub2RlLFxyXG4gICAgICAgICAgY29tbWVudDogXCJcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgICAgY29uc29sZS5sb2coc2VsZi5ub3Rlcyk7ICohL1xyXG4gICAgfSxcclxuICAgIHJlbW92ZU5vZGUobikge1xyXG4gICAgICBjb25zdCB7aWR9ID0gbjtcclxuICAgICAgY29uc3Qge2hsLCBub3Rlc30gPSB0aGlzO1xyXG4gICAgICBjb25zdCBpbmRleCA9IG5vdGVzLmluZGV4T2Yobik7XHJcbiAgICAgIGhsLnJlbW92ZShpZCk7XHJcbiAgICAgIG5vdGVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9LFxyXG4gICAgZWRpdE5vZGUobikge1xyXG4gICAgICB0aGlzLnJlc2V0UGFuZWwoKTtcclxuICAgICAgbi5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIG9uQ2xpY2soe2lkfSkge1xyXG4gICAgICBjb25zb2xlLmxvZyhcIueCueWHu++8mlwiKTtcclxuICAgICAgY29uc29sZS5sb2coaWQpO1xyXG4gICAgICBjb25zdCB7bm90ZXNPYmosIG5vdGVzfSA9IHRoaXM7XHJcbiAgICAgIHRoaXMucmVzZXRQYW5lbCgpO1xyXG4gICAgICBub3Rlc09ialtpZF0uYWN0aXZlID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBvbkhvdmVyKHtpZH0pIHtcclxuICAgICAgdGhpcy5obC5hZGRDbGFzcygnaGlnaGxpZ2h0LXdyYXAtaG92ZXInLCBpZCk7ICBcclxuICAgIH0sXHJcbiAgICBvbkhvdmVyT3V0KHtpZH0pIHtcclxuICAgICAgdGhpcy5obC5yZW1vdmVDbGFzcygnaGlnaGxpZ2h0LXdyYXAtaG92ZXInLCBpZCk7XHJcbiAgICB9XHJcbiAgfVxyXG59KVxyXG5cclxuLy8gMi4g5LuO5ZCO56uv6I635Y+W6auY5Lqu5L+h5oGv77yM6L+Y5Y6f6Iez572R6aG1XHJcbi8vIGdldFJlbW90ZURhdGEoKS50aGVuKHMgPT4gaGlnaGxpZ2h0ZXIuZnJvbVN0b3JlKHMuc3RhcnRNZXRhLCBzLmVuZE1ldGEsIHMuaWQsIHMudGV4dCkpO1xyXG4qL1xyXG4iXX0=
