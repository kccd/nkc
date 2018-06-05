var markdown = window.markdownit();
var data = $('#data').text();
data = JSON.parse(data);
update();
$('#title, #content, #reason, #solution, #QQ, #email').on('input', function() {
	update();
})/*.on('blur', function() {
	submit(data.id, function(){screenTopAlert('自动保存成功')});
});*/

function mdToHtml(md) {
	return markdown.render(md);
}
function update() {
	var title = $('#title').val();
	var reason = $('#reason').val();
	var content = $('#content').val();
	var solution = $('#solution').val();
	var QQ = $('#QQ').val();
	var email = $('#email').val();
	$('#titleH2').text(title);
	$('#reasonDiv').html(mdToHtml(reason || '暂无'));
	$('#solutionDiv').html(mdToHtml(solution || '暂无'));
	$('#contentDiv').html(mdToHtml(content));
	$('#QQDiv').text('QQ：' + (QQ || '暂无'));
	$('#emailDiv').text('邮箱地址：' + (email || '暂无'));
	return {
		t: title,
		c: content,
		solution: solution,
		QQ: QQ,
		email: email,
		reason: reason
	}
}

function submit(_id, callback) {
	var obj = update();
	nkcAPI('/problem/list/'+_id, 'PATCH', obj)
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
				window.location.href = '/problem/list';
			}, 1000);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}
setInterval(function() {
	submit(data.id, function(){
		screenTopAlert('自动保存成功');
	})
}, 30*1000);

