var cidArr;
var disciplineArr;
var topicArr;
var app;

$(document).ready(function() {
  cidArr = JSON.parse($('#cidArr').text());
  disciplineArr = JSON.parse($('#disciplineDom').text());
  topicArr = JSON.parse($('#topicDom').text());
  app = new Vue({
    el: "#forumChoice",
    data: {
      activeClass: 'mdui-color-theme-accent',
      disciplineArr: disciplineArr,
      topicArr: topicArr,
      disciplineCategorys: [],
      topicCategorys: [],
      forumIdArr: [],
      categoryIdArr: [],
      disciplineForumId: "",
      topicForumId: "",
      disciplineCategoryId: "",
      topicCategoryId: "",
    },
    methods:{
      selectDiscipline: function(fid) {
        return selectDiscipline(fid);
      },
      selectTopic: function(fid) {
        return selectTopic(fid);
      },
      selectDisciplineCate: function(cid) {
        return selectDisciplineCate(cid);
      },
      selectTopicCate: function(cid) {
        return selectTopicCate(cid);
      },
      shuchu: function() {
        return shuchu();
      }
    }
  })
})

function selectDiscipline(fid) {
  var threadTypes = [];
  for(var i in cidArr){
    if(cidArr[i].fid == fid){
      threadTypes.push(cidArr[i])
    }
  }
  app.forumIdArr.push(fid);
  if(app.disciplineForumId !== ""){
    var index = app.forumIdArr.indexOf(app.disciplineForumId);
    if(index > -1){
      app.forumIdArr.splice(index, 1);
    }
  }
  app.disciplineForumId = fid;
  app.disciplineCategorys = threadTypes;
}

function selectTopic(fid) {
  var threadTypes = [];
  for(var i in cidArr){
    if(cidArr[i].fid == fid){
      threadTypes.push(cidArr[i])
    }
  }
  app.forumIdArr.push(fid);
  if(app.topicForumId !== ""){
    var index = app.forumIdArr.indexOf(app.topicForumId);
    if(index > -1){
      app.forumIdArr.splice(index, 1);
    }
  }
  app.topicForumId = fid;
  app.topicCategorys = threadTypes;
}

function selectDisciplineCate(cid) {
  app.categoryIdArr.push(cid);
  var index = app.categoryIdArr.indexOf(app.disciplineCategoryId);
  if(index > -1) {
    app.categoryIdArr.splice(index, 1);
  }
  app.disciplineCategoryId = cid;
}

function selectTopicCate(cid) {
  app.categoryIdArr.push(cid);
  var index = app.categoryIdArr.indexOf(app.topicCategoryId);
  if(index > -1) {
    app.categoryIdArr.splice(index, 1);
  }
  app.topicCategoryId = cid;
}

function shuchu() {
  console.log(app.forumIdArr, app.categoryIdArr)
}