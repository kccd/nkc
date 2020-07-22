var data = $('#data').text();
data = JSON.parse(data);
update();
$('#title, #content, #reason, #solution, #QQ, #email, #log').on('input', function() {
	update();
});

function update() {
	var title = $('#title').text();
	var content = $('#content').text();
	var log = $('#log').val();
	var QQ = $('#QQ').val();
	var email = $('#email').val();
	// $('#titleH2').text(title);
	$('#logDev').html(NKC.methods.mdToHtmlSafe(log));
	$('pre code').each(function(i, block) {
    NKC.methods.highlightBlock(block);
	});
	return {
		t: title,
		c: content,
		QQ: QQ,
		email: email,
		restorLog: log
	}
}

function submit(_id, callback) {
	var obj = update();
	obj.resolved = $('input[name="select"]').prop('checked');
  var dom = document.getElementById('typeId');
  if(!dom) throw 'selector error';
	obj.name = dom.value;
	obj.remindUser = false;
	if(obj.resolved) {
		obj.reminded = $("input[name='remind']").prop("checked");
	}
	nkcAPI('/problem/list/'+_id, 'PUT', obj)
		.then(function() {
			if(callback) {
				return callback();
			}
			screenTopAlert('保存成功');
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}

function deleteProblem(_id) {
	if(confirm('确定要删除该问题？') === false) return;
	nkcAPI('/problem/list/'+_id, 'delete', {})
		.then(function() {
			screenTopAlert('删除成功');
			setTimeout(function(){
				// window.location.href = '/problem/list';
				openToNewLocation('/problem/list')
			}, 1000);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
// setInterval(function() {
// 	if(!$('input[name="select"]').prop('checked')) {
// 		submit(data.id, function(){
// 			screenTopAlert('自动保存成功');
// 		})
// 	}
// }, 30*1000);

function changeType(problemId) {
  submit(problemId);
}
function checkMark() {
	var dom = $("input[name='select']");
	var remind = $("#remind");
	if(dom.prop("checked")) {
		remind.show();
	} else {
		remind.hide();
	}
}

checkMark();
