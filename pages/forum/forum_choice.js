var cidArr;
var app;

$(document).ready(function() {
  cidArr = JSON.parse($('#cidArr').text());
  app = new Vue({
    el: "#forumChoice",
    data: {
      categorys: []
    }
  })
})

function selectForum(fid) {
  var threadTypes = [];
  for(var i in cidArr){
    if(cidArr[i].fid == fid){
      threadTypes.push(cidArr[i])
    }
  }
  app.categorys = threadTypes;
  console.log(threadTypes)
}