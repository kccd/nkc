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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9fYnJvd3Nlci1wYWNrQDYuMS4wQGJyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInBhZ2VzL2V4cGVyaW1lbnRhbC9zZXR0aW5ncy9ncmFkZS9ncmFkZS5tanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBLElBQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFKLENBQVksV0FBWixDQUF3QixNQUF4QixDQUFiO0FBQ0EsSUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFKLENBQVE7QUFDbkIsRUFBQSxFQUFFLEVBQUUsTUFEZTtBQUVuQixFQUFBLElBQUksRUFBRTtBQUNMLElBQUEsTUFBTSxFQUFFLElBQUksQ0FBQyxNQURSO0FBRUwsSUFBQSxhQUFhLEVBQUUsSUFBSSxDQUFDO0FBRmYsR0FGYTtBQU1uQixFQUFBLE9BQU8sRUFBRSxtQkFBVztBQUNuQixJQUFBLEdBQUcsQ0FBQyxPQUFKLENBQVksZUFBWjtBQUNBLEdBUmtCO0FBU25CLEVBQUEsT0FBTyxFQUFFO0FBQ1IsSUFBQSxXQUFXLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFaLENBQXNCLFdBRDNCO0FBRVIsSUFBQSxXQUFXLEVBQUUsR0FBRyxDQUFDLE9BQUosQ0FBWSxTQUFaLENBQXNCLFdBRjNCO0FBR1IsSUFBQSxJQUFJLEVBQUUsZ0JBQVc7QUFDaEIsVUFBTSxNQUFNLEdBQUcsQ0FBQyxDQUFDLGFBQUQsQ0FBaEI7O0FBQ0EsV0FBSSxJQUFJLENBQUMsR0FBRyxDQUFaLEVBQWUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUExQixFQUFrQyxDQUFDLEVBQW5DLEVBQXVDO0FBQ3RDLFlBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxFQUFQLENBQVUsQ0FBVixDQUFkO0FBQ0EsWUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLElBQU4sQ0FBVyxZQUFYLENBQWQ7QUFDQSxRQUFBLEdBQUcsQ0FBQyxNQUFKLENBQVcsS0FBWCxFQUFrQixLQUFsQixHQUEwQixLQUFLLENBQUMsR0FBTixFQUExQjtBQUNBOztBQU5lLFVBT1QsTUFQUyxHQU9nQixJQVBoQixDQU9ULE1BUFM7QUFBQSxVQU9ELGFBUEMsR0FPZ0IsSUFQaEIsQ0FPRCxhQVBDO0FBUWhCLE1BQUEsTUFBTSxDQUFDLG1CQUFELEVBQXNCLE9BQXRCLEVBQStCO0FBQ3BDLFFBQUEsTUFBTSxFQUFOLE1BRG9DO0FBRXBDLFFBQUEsYUFBYSxFQUFiO0FBRm9DLE9BQS9CLENBQU4sQ0FJRSxJQUpGLENBSU8sWUFBVztBQUNoQixRQUFBLFlBQVksQ0FBQyxNQUFELENBQVo7QUFDQSxPQU5GLFdBT1EsVUFQUjtBQVFBLEtBbkJPO0FBb0JSLElBQUEsV0FBVyxFQUFFLHFCQUFTLEtBQVQsRUFBZ0I7QUFDNUIsV0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixLQUFuQixFQUEwQixDQUExQjtBQUNBLEtBdEJPO0FBdUJSLElBQUEsUUFBUSxFQUFFLG9CQUFXO0FBQ3BCLFdBQUssTUFBTCxDQUFZLElBQVosQ0FBaUI7QUFDaEIsUUFBQSxHQUFHLEVBQUUsRUFEVztBQUVoQixRQUFBLFdBQVcsRUFBRSxNQUZHO0FBR2hCLFFBQUEsS0FBSyxFQUFFLENBSFM7QUFJaEIsUUFBQSxLQUFLLEVBQUUsU0FKUztBQUtoQixRQUFBLFdBQVcsRUFBRTtBQUxHLE9BQWpCO0FBT0E7QUEvQk87QUFUVSxDQUFSLENBQVoiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBkYXRhID0gTktDLm1ldGhvZHMuZ2V0RGF0YUJ5SWQoXCJkYXRhXCIpO1xyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuXHRlbDogXCIjYXBwXCIsXHJcblx0ZGF0YToge1xyXG5cdFx0Z3JhZGVzOiBkYXRhLmdyYWRlcyxcclxuXHRcdGdyYWRlU2V0dGluZ3M6IGRhdGEuZ3JhZGVTZXR0aW5nc1xyXG5cdH0sXHJcblx0bW91bnRlZDogZnVuY3Rpb24oKSB7XHJcblx0XHROS0MubWV0aG9kcy5pbml0U2VsZWN0Q29sb3IoKTtcclxuXHR9LFxyXG5cdG1ldGhvZHM6IHtcclxuXHRcdGNoZWNrTnVtYmVyOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tOdW1iZXIsXHJcblx0XHRjaGVja1N0cmluZzogTktDLm1ldGhvZHMuY2hlY2tEYXRhLmNoZWNrU3RyaW5nLFxyXG5cdFx0c2F2ZTogZnVuY3Rpb24oKSB7XHJcblx0XHRcdGNvbnN0IGNvbG9ycyA9ICQoXCJpbnB1dC5jb2xvclwiKTtcclxuXHRcdFx0Zm9yKGxldCBpID0gMDsgaSA8IGNvbG9ycy5sZW5ndGg7IGkrKykge1xyXG5cdFx0XHRcdGNvbnN0IGNvbG9yID0gY29sb3JzLmVxKGkpO1xyXG5cdFx0XHRcdGNvbnN0IGluZGV4ID0gY29sb3IuYXR0cihcImRhdGEtaW5kZXhcIik7XHJcblx0XHRcdFx0YXBwLmdyYWRlc1tpbmRleF0uY29sb3IgPSBjb2xvci52YWwoKTtcclxuXHRcdFx0fVxyXG5cdFx0XHRjb25zdCB7Z3JhZGVzLCBncmFkZVNldHRpbmdzfSA9IHRoaXM7XHJcblx0XHRcdG5rY0FQSShcIi9lL3NldHRpbmdzL2dyYWRlXCIsIFwiUEFUQ0hcIiwge1xyXG5cdFx0XHRcdGdyYWRlcyxcclxuXHRcdFx0XHRncmFkZVNldHRpbmdzLFxyXG5cdFx0XHR9KVxyXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0c3dlZXRTdWNjZXNzKFwi5L+d5a2Y5oiQ5YqfXCIpO1xyXG5cdFx0XHRcdH0pXHJcblx0XHRcdFx0LmNhdGNoKHN3ZWV0RXJyb3IpXHJcblx0XHR9LFxyXG5cdFx0cmVtb3ZlR3JhZGU6IGZ1bmN0aW9uKGluZGV4KSB7XHJcblx0XHRcdHRoaXMuZ3JhZGVzLnNwbGljZShpbmRleCwgMSk7XHJcblx0XHR9LFxyXG5cdFx0YWRkR3JhZGU6IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR0aGlzLmdyYWRlcy5wdXNoKHtcclxuXHRcdFx0XHRfaWQ6IFwiXCIsXHJcblx0XHRcdFx0ZGlzcGxheU5hbWU6IFwi5paw5bu6562J57qnXCIsXHJcblx0XHRcdFx0c2NvcmU6IDAsXHJcblx0XHRcdFx0Y29sb3I6IFwiI2FhYWFhYVwiLFxyXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiBcIlwiXHJcblx0XHRcdH0pO1xyXG5cdFx0fVxyXG5cdH1cclxufSk7XHJcbiJdfQ==
