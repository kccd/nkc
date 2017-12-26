var threads = [];
var application = {
  threads: []
};
$(function(){
  init();
});
function loadThreads(page, pid) {
  var url = '/me/threads';
  if(page) {
    url = '/me/threads?page='+page;
  }
  if(pid !== undefined) {
    url = '/me/threads?pid='+pid
  }
  nkcAPI(url, 'GET', {})
    .then(function(data) {
      for (var threadFromData of data.threads){
        var flag = false;
        for (var thread of threads){
          if(thread.tid === threadFromData.tid) {
            flag = true;
          }
        }
        if(!flag) {
          threads.push(threadFromData);
        }
      }
      var threadsFromData = data.threads;
      var paging = data.paging;
      console.log(data);
      var pagingListContent = '';
      var threadListContent = '';
      if(paging && paging.pageCount > 1){
        for (var i = 0; i < paging.pageCount; i++) {
          console.log(paging.page)
          if(i === paging.page) {
            pagingListContent += '<li>'+(i+1)+'</li>';
          } else {
            pagingListContent += '<li><a href="###" onclick="loadThreads('+i+')">'+(i+1)+'</a></li>';
          }
        }
      }
      for (var thread of threadsFromData) {
        threadListContent += '<div class="thread-list-body"><div class="col-xs-12 col-md-10 thread-list-title"><a href="/t/'+thread.tid+'" target="_blank">'+thread.firstPost.t+'</a></div><div class="col-xs-12 col-md-2"><span class="glyphicon glyphicon-plus-sign" onclick="chooseThread('+thread.tid+')"></span></div></div>';
      }
      $('#threadListPage').html(pagingListContent);
      $('#threadList').html(threadListContent);
    })
    .catch(function(err){
      jwarning(err);
    })
}
function chooseThread(tid) {
  for (var thread of threads) {
    if(thread.tid == tid && !application.threads.includes(tid)){
      application.threads.push(tid);
      displayThreadList();
    }
  }
}

function displayThreadList() {
  var content = '';
  for (var tid of application.threads){
    for (var thread of threads) {
      if(thread.tid == tid) {
        content += '<div class="thread-list-body"><div class="col-xs-12 col-md-10 thread-list-title"><a href="/t/'+thread.tid+'" target="_blank">'+thread.firstPost.t+'</a></div><div class="col-xs-12 col-md-2"><span class="glyphicon glyphicon-minus-sign" onclick="removeThread('+thread.tid+')"></span></div></div>';
      }
    }
  }
  $('#threadListChose').html(content);
  $('#choseThread').html('&nbsp;'+application.threads.length+'&nbsp;篇');
}

function removeThread(tid){
  var threads = application.threads;
  for (var i in application.threads) {
    if(threads[i] == tid){
      application.threads.splice(i,1);
      displayThreadList();
    }
  }
}

function clearThreads(){
  $('#threadListPage').html('');
  $('#threadList').html('');
}

function init() {
  $('#submitOfSearch').on('click', function() {
    var pid = $('#pid').val();
    if(pid === '') return jwarning('输入不能为空');
    loadThreads(0,pid);
  });
}