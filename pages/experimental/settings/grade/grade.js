(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");
var app = new Vue({
  el: "#app",
  data: {
    grades: data.grades,
    gradeSettings: data.gradeSettings
  },
  mounted: function mounted() {
    NKC.methods.initSelectColor();
  },
  methods: {
    checkNumber: NKC.methods.checkData.checkNumber,
    checkString: NKC.methods.checkData.checkString,
    save: function save() {
      var colors = $("input.color");

      for (var i = 0; i < colors.length; i++) {
        var color = colors.eq(i);
        var index = color.attr("data-index");
        app.grades[index].color = color.val();
      }

      var grades = this.grades,
          gradeSettings = this.gradeSettings;
      nkcAPI("/e/settings/grade", "PATCH", {
        grades: grades,
        gradeSettings: gradeSettings
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    removeGrade: function removeGrade(index) {
      this.grades.splice(index, 1);
    },
    addGrade: function addGrade() {
      this.grades.push({
        _id: "",
        displayName: "新建等级",
        score: 0,
        color: "#aaaaaa",
        description: ""
      });
    }
  }
});

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9leHBlcmltZW50YWwvc2V0dGluZ3MvZ3JhZGUvZ3JhZGUubWpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLElBQUksR0FBRyxHQUFHLENBQUMsT0FBSixDQUFZLFdBQVosQ0FBd0IsTUFBeEIsQ0FBYjtBQUNBLElBQU0sR0FBRyxHQUFHLElBQUksR0FBSixDQUFRO0FBQ25CLEVBQUEsRUFBRSxFQUFFLE1BRGU7QUFFbkIsRUFBQSxJQUFJLEVBQUU7QUFDTCxJQUFBLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFEUjtBQUVMLElBQUEsYUFBYSxFQUFFLElBQUksQ0FBQztBQUZmLEdBRmE7QUFNbkIsRUFBQSxPQUFPLEVBQUUsbUJBQVc7QUFDbkIsSUFBQSxHQUFHLENBQUMsT0FBSixDQUFZLGVBQVo7QUFDQSxHQVJrQjtBQVNuQixFQUFBLE9BQU8sRUFBRTtBQUNSLElBQUEsV0FBVyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBWixDQUFzQixXQUQzQjtBQUVSLElBQUEsV0FBVyxFQUFFLEdBQUcsQ0FBQyxPQUFKLENBQVksU0FBWixDQUFzQixXQUYzQjtBQUdSLElBQUEsSUFBSSxFQUFFLGdCQUFXO0FBQ2hCLFVBQU0sTUFBTSxHQUFHLENBQUMsQ0FBQyxhQUFELENBQWhCOztBQUNBLFdBQUksSUFBSSxDQUFDLEdBQUcsQ0FBWixFQUFlLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBMUIsRUFBa0MsQ0FBQyxFQUFuQyxFQUF1QztBQUN0QyxZQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsRUFBUCxDQUFVLENBQVYsQ0FBZDtBQUNBLFlBQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFOLENBQVcsWUFBWCxDQUFkO0FBQ0EsUUFBQSxHQUFHLENBQUMsTUFBSixDQUFXLEtBQVgsRUFBa0IsS0FBbEIsR0FBMEIsS0FBSyxDQUFDLEdBQU4sRUFBMUI7QUFDQTs7QUFOZSxVQU9ULE1BUFMsR0FPZ0IsSUFQaEIsQ0FPVCxNQVBTO0FBQUEsVUFPRCxhQVBDLEdBT2dCLElBUGhCLENBT0QsYUFQQztBQVFoQixNQUFBLE1BQU0sQ0FBQyxtQkFBRCxFQUFzQixPQUF0QixFQUErQjtBQUNwQyxRQUFBLE1BQU0sRUFBTixNQURvQztBQUVwQyxRQUFBLGFBQWEsRUFBYjtBQUZvQyxPQUEvQixDQUFOLENBSUUsSUFKRixDQUlPLFlBQVc7QUFDaEIsUUFBQSxZQUFZLENBQUMsTUFBRCxDQUFaO0FBQ0EsT0FORixXQU9RLFVBUFI7QUFRQSxLQW5CTztBQW9CUixJQUFBLFdBQVcsRUFBRSxxQkFBUyxLQUFULEVBQWdCO0FBQzVCLFdBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsS0FBbkIsRUFBMEIsQ0FBMUI7QUFDQSxLQXRCTztBQXVCUixJQUFBLFFBQVEsRUFBRSxvQkFBVztBQUNwQixXQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCO0FBQ2hCLFFBQUEsR0FBRyxFQUFFLEVBRFc7QUFFaEIsUUFBQSxXQUFXLEVBQUUsTUFGRztBQUdoQixRQUFBLEtBQUssRUFBRSxDQUhTO0FBSWhCLFFBQUEsS0FBSyxFQUFFLFNBSlM7QUFLaEIsUUFBQSxXQUFXLEVBQUU7QUFMRyxPQUFqQjtBQU9BO0FBL0JPO0FBVFUsQ0FBUixDQUFaIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgZGF0YSA9IE5LQy5tZXRob2RzLmdldERhdGFCeUlkKFwiZGF0YVwiKTtcclxuY29uc3QgYXBwID0gbmV3IFZ1ZSh7XHJcblx0ZWw6IFwiI2FwcFwiLFxyXG5cdGRhdGE6IHtcclxuXHRcdGdyYWRlczogZGF0YS5ncmFkZXMsXHJcblx0XHRncmFkZVNldHRpbmdzOiBkYXRhLmdyYWRlU2V0dGluZ3NcclxuXHR9LFxyXG5cdG1vdW50ZWQ6IGZ1bmN0aW9uKCkge1xyXG5cdFx0TktDLm1ldGhvZHMuaW5pdFNlbGVjdENvbG9yKCk7XHJcblx0fSxcclxuXHRtZXRob2RzOiB7XHJcblx0XHRjaGVja051bWJlcjogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrTnVtYmVyLFxyXG5cdFx0Y2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuXHRcdHNhdmU6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRjb25zdCBjb2xvcnMgPSAkKFwiaW5wdXQuY29sb3JcIik7XHJcblx0XHRcdGZvcihsZXQgaSA9IDA7IGkgPCBjb2xvcnMubGVuZ3RoOyBpKyspIHtcclxuXHRcdFx0XHRjb25zdCBjb2xvciA9IGNvbG9ycy5lcShpKTtcclxuXHRcdFx0XHRjb25zdCBpbmRleCA9IGNvbG9yLmF0dHIoXCJkYXRhLWluZGV4XCIpO1xyXG5cdFx0XHRcdGFwcC5ncmFkZXNbaW5kZXhdLmNvbG9yID0gY29sb3IudmFsKCk7XHJcblx0XHRcdH1cclxuXHRcdFx0Y29uc3Qge2dyYWRlcywgZ3JhZGVTZXR0aW5nc30gPSB0aGlzO1xyXG5cdFx0XHRua2NBUEkoXCIvZS9zZXR0aW5ncy9ncmFkZVwiLCBcIlBBVENIXCIsIHtcclxuXHRcdFx0XHRncmFkZXMsXHJcblx0XHRcdFx0Z3JhZGVTZXR0aW5ncyxcclxuXHRcdFx0fSlcclxuXHRcdFx0XHQudGhlbihmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHN3ZWV0U3VjY2VzcyhcIuS/neWtmOaIkOWKn1wiKTtcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRcdC5jYXRjaChzd2VldEVycm9yKVxyXG5cdFx0fSxcclxuXHRcdHJlbW92ZUdyYWRlOiBmdW5jdGlvbihpbmRleCkge1xyXG5cdFx0XHR0aGlzLmdyYWRlcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cdFx0fSxcclxuXHRcdGFkZEdyYWRlOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0dGhpcy5ncmFkZXMucHVzaCh7XHJcblx0XHRcdFx0X2lkOiBcIlwiLFxyXG5cdFx0XHRcdGRpc3BsYXlOYW1lOiBcIuaWsOW7uuetiee6p1wiLFxyXG5cdFx0XHRcdHNjb3JlOiAwLFxyXG5cdFx0XHRcdGNvbG9yOiBcIiNhYWFhYWFcIixcclxuXHRcdFx0XHRkZXNjcmlwdGlvbjogXCJcIlxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9XHJcbn0pO1xyXG4iXX0=
