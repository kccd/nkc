var cidArr;
var disciplineArr;
var topicArr;
var app;
var forumList;
var isThroughForum;
var historyFid = "";
var forumTypeEditor;

$(document).ready(function() {
  isThroughForum = getSearchKV();
  if(isThroughForum.type && isThroughForum.type === "forum") {
    historyFid = isThroughForum.id;
  }
  forumList = JSON.parse($('#allForumListData').text());
  cidArr = JSON.parse($('#cidArr').text());
  disciplineArr = JSON.parse($('#disciplineDom').text());
  topicArr = JSON.parse($('#topicDom').text());
  forumTypeEditor = $("#forumType").text();
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
      disciplineCategoryId: "0",
      topicCategoryId: "0",
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
  if(historyFid) {
    if(forumTypeEditor == "discipline"){
      selectDiscipline(historyFid)
    }else if(forumTypeEditor == "topic"){
      selectTopic(historyFid)
    }
  }
})

function selectDiscipline(fid) {
  app.disciplineCategorys = [];
  if(app.disciplineForumId == fid){
    var disciplineIndex = app.forumIdArr.indexOf(fid);
    if(disciplineIndex > -1){
      app.forumIdArr.splice(disciplineIndex, 1)
    }
    var lastTopForumId = "#disForumId"+app.disciplineForumId;
    $(lastTopForumId).removeClass("mdui-color-blue-300");
    app.disciplineForumId = "";
  }else{
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
      if(app.disciplineForumId !== fid){
        var lastDisForumId = "#disForumId"+app.disciplineForumId;
        $(lastDisForumId).removeClass("mdui-color-blue-300");
      }
      // if(app.disciplineForumId !== fid){
        var lastDisForumId = "#disForumId"+app.disciplineForumId;
        $(lastDisForumId).removeClass("mdui-color-blue-300");
      // }
      var index = app.forumIdArr.indexOf(app.disciplineForumId);
      if(index > -1){
        app.forumIdArr.splice(index, 1);
      }
    }
    app.disciplineForumId = fid;
  }
  setTimeout(function(){ app.disciplineCategorys = threadTypes; }, 300);
  // app.disciplineCategorys = threadTypes;
}

function selectTopic(fid) {
  app.topicCategorys = [];
  if(app.topicForumId == fid){
    var topicIndex = app.forumIdArr.indexOf(fid);
    if(topicIndex > -1){
      app.forumIdArr.splice(topicIndex, 1)
    }
    var lastTopForumId = "#topForumId"+app.topicForumId;
    $(lastTopForumId).removeClass("mdui-color-blue-300");
    app.topicForumId = "";
  }else{
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
      if(app.topicForumId !== fid){
        var lastTopForumId = "#topForumId"+app.topicForumId;
        $(lastTopForumId).removeClass("mdui-color-blue-300");
      }
      var index = app.forumIdArr.indexOf(app.topicForumId);
      if(index > -1){
        app.forumIdArr.splice(index, 1);
      }
    }
    app.topicForumId = fid;
  }
  setTimeout(function(){ app.topicCategorys = threadTypes; }, 300);
  // app.topicCategorys = threadTypes;
}

function selectDisciplineCate(cid) {
  cid = cid+"";
  if(app.disciplineCategoryId == cid){
    var disCatIndex = app.categoryIdArr.indexOf(cid);
    if(disCatIndex > -1){
      app.categoryIdArr.splice(disCatIndex, 1);
      var lastDisCateId = "#disCateId" + app.disciplineCategoryId;
      $(lastDisCateId).removeClass("mdui-color-blue-300")
      app.disciplineCategoryId = "";
    }
  }else{
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
}

function selectTopicCate(cid) {
  cid = cid+"";
  if(app.topicCategoryId == cid) {
    var topCatIndex = app.categoryIdArr.indexOf(cid);
    if(topCatIndex > -1){
      app.categoryIdArr.splice(topCatIndex, 1);
      var lastTopCateId = "#topCateId" + app.topicCategoryId;
      $(lastTopCateId).removeClass("mdui-color-blue-300")
      app.topicCategoryId = "";
    }
  }else{
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
          var lastDisForumId = "#disForumId"+app.disciplineForumId;
          $(lastDisForumId).removeClass("mdui-color-blue-300");
          var index = app.forumIdArr.indexOf(app.disciplineForumId);
          if(index > -1){
            app.forumIdArr.splice(index, 1);
          }
          app.disciplineArr.unshift(forumList[i]);
          // setTimeout(() => {
          //   selectDiscipline(disciplineArr[d].fid);
          // }, 300);
        }else{
          for(var t in topicArr){
            if(topicArr[t].fid == forumList[i].fid) {
              return screenTopWarning("该话题已在列表中")
            }
          }
          var lastTopForumId = "#topForumId"+app.topicForumId;
          $(lastTopForumId).removeClass("mdui-color-blue-300");
          var index = app.forumIdArr.indexOf(app.topicForumId);
          if(index > -1){
            app.forumIdArr.splice(index, 1);
          }
          app.topicArr.unshift(forumList[i]);
          // setTimeout(() => {
          //   selectTopic(topicArr[d].fid);
          // }, 300);
        }
    }
  }
}

function getFidAndCidResult() {
  var obj = {};
  if(app.forumIdArr.length == 0) {
    throw "请至少选择一个学科或话题";
  }
  obj.fids = app.forumIdArr;
  obj.cids = app.categoryIdArr;
  return obj
}