function addProblem() {
	var obj = {
		t: $('#title').val(),
		c: $('#content').val(),
		email: $('#email').val(),
		QQ: $('#QQ').val()
	};
	var cid = document.getElementById('cid');
	if(cid) {
	  obj.cid = cid.getAttribute('data-cid');
  }
	if(!obj.t) return screenTopWarning('请输入标题');
	if(!obj.c) return screenTopWarning('请输入问题内容');
	$('#submit').attr('disabled', true);
	nkcAPI('/problem/add', 'POST', obj)
		.then(function() {
			$('#submit').attr('disabled', false);
			screenTopAlert('感谢您的反馈！网站工程师将会第一时间处理该问题。');
			setTimeout(function() {
				// window.location.href = '/';
				openToNewLocation("/")
			}, 1500)
		})
		.catch(function(data) {
			$('#submit').attr('disabled', false);
			screenTopWarning(data.error || data);
		})
}

$(function() {
	$('#submit').on('click', function() {
		addProblem();
	});
});


var PostSurveyEdit = new NKC.modules.PostSurveyEdit();
PostSurveyEdit.open(function() {

});