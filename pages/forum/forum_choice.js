var cidArr;
var disciplineArr;
var topicArr;
var app;
var forumList;

$(document).ready(function() {
  forumList = JSON.parse($('#allForumListData').text());
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
      categoryIdArr: ["0"],
      disciplineForumId: "",
      topicForumId: "",
      disciplineCategoryId: "",
      topicCategoryId: "",
      newDomNum: 0
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
      addNewForumDom: function() {
        return addNewForumDom();
      },
      shuchu: function() {
        return shuchu();
      }
    }
  })
})

function selectDiscipline(fid) {
  app.disciplineCategorys = [];
  if(app.disciplineCategoryId !== ""){
    var index1 = app.categoryIdArr.indexOf(app.disciplineCategoryId)
    if(index1>-1){
      app.categoryIdArr.splice(index1, 1)
    }
    app.disciplineCategoryId = "";
  }
  var nowDisForumId = "#disForumId"+fid;
  $(nowDisForumId).addClass("mdui-color-blue-300");
  var threadTypes = [];
  for(var i in cidArr){
    if(cidArr[i].fid == fid){
      threadTypes.push(cidArr[i])
    }
  }
  app.forumIdArr.push(fid);
  if(app.disciplineForumId !== ""){
    var lastDisForumId = "#disForumId"+app.disciplineForumId;
    $(lastDisForumId).removeClass("mdui-color-blue-300");
    var index = app.forumIdArr.indexOf(app.disciplineForumId);
    if(index > -1){
      app.forumIdArr.splice(index, 1);
    }
  }
  app.disciplineForumId = fid;
  setTimeout(function(){ app.disciplineCategorys = threadTypes; }, 300);
  // app.disciplineCategorys = threadTypes;
}

function selectTopic(fid) {
  app.topicCategorys = [];
  if(app.topicCategoryId !== ""){
    var index1 = app.categoryIdArr.indexOf(app.topicCategoryId)
    if(index1>-1){
      app.categoryIdArr.splice(index1, 1)
    }
    app.topicCategoryId = "";
  }
  var nowTopForumId = "#topForumId"+fid;
  $(nowTopForumId).addClass("mdui-color-blue-300");
  var threadTypes = [];
  for(var i in cidArr){
    if(cidArr[i].fid == fid){
      threadTypes.push(cidArr[i])
    }
  }
  app.forumIdArr.push(fid);
  if(app.topicForumId !== ""){
    var lastTopForumId = "#topForumId"+app.topicForumId;
    $(lastTopForumId).removeClass("mdui-color-blue-300");
    var index = app.forumIdArr.indexOf(app.topicForumId);
    if(index > -1){
      app.forumIdArr.splice(index, 1);
    }
  }
  app.topicForumId = fid;
  setTimeout(function(){ app.topicCategorys = threadTypes; }, 300);
  // app.topicCategorys = threadTypes;
}

function selectDisciplineCate(cid) {
  cid = cid+"";
  var nowDisCateId = "#disCateId" + cid;
  $(nowDisCateId).addClass("mdui-color-blue-300")
  app.categoryIdArr.push(cid);
  if(app.disciplineCategoryId !== ""){
    if(cid !== app.disciplineCategoryId){
      var lastDisCateId = "#disCateId" + app.disciplineCategoryId;
      $(lastDisCateId).removeClass("mdui-color-blue-300")
    }
    var index = app.categoryIdArr.indexOf(app.disciplineCategoryId);
    if(index > -1) {
      app.categoryIdArr.splice(index, 1);
    }
  }
  app.disciplineCategoryId = cid;
}

function selectTopicCate(cid) {
  cid = cid+"";
  var nowTopCateId = "#topCateId" + cid;
  $(nowTopCateId).addClass("mdui-color-blue-300")
  app.categoryIdArr.push(cid);
  if(app.topicCategoryId !== ""){
    if(cid !== app.topicCategoryId){
      var lastTopCateId = "#topCateId" + app.topicCategoryId;
      $(lastTopCateId).removeClass("mdui-color-blue-300")
    }
    var index = app.categoryIdArr.indexOf(app.topicCategoryId);
    if(index > -1) {
      app.categoryIdArr.splice(index, 1);
    }
  }
  app.topicCategoryId = cid;
}

function shuchu() {
  console.log(app.forumIdArr, app.categoryIdArr)
}


function moreForum() {
  $("#allForumChoice").css("display", "block")
  // var forumList = JSON.parse($('#allForumListData').text());
  // app.newDomNum += 1;
  // console.log(app.newDomNum)
  // var newDom = `<div class='mdui-col-xs-12' id='newDom${app.newDomNum}'></div>`;
  // var newId = "#newDom"+app.newDomNum
  // console.log(newId)
  // $("#allForum").append(newDom)
  // $(newId).append(createSelect(forumList))
}

function selectNewOption() {
  try{
    var obj = getResult1();
  } catch(e) {
    return screenTopWarning(e);
  }
  $("#allForumChoice").css("display", "none");
  for(var i in forumList){
    if(forumList[i].fid === obj.fid){
        if(forumList[i].forumType == "discipline"){
          for(var d in disciplineArr){
            if(disciplineArr[d].fid == forumList[i].fid) {
              return screenTopWarning("该专业已在列表中")
            }
          }
          app.disciplineArr.unshift(forumList[i])
        }else{
          for(var t in topicArr){
            if(topicArr[t].fid == forumList[i].fid) {
              return screenTopWarning("该话题已在列表中")
            }
          }
          app.topicArr.unshift(forumList[i])
        }
    }
  }
}

function getFidAndCidResult() {
  var obj = {};
  if(app.forumIdArr.length == 0) return screenTopWarning("请至少选择一个学科或话题");
  obj.fids = app.forumIdArr;
  obj.cids = app.categoryIdArr;
  return obj
}