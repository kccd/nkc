$(document).ready(function() {
	var qrcode = geid('qrcode');
	if(qrcode) {
		var path = window.location.href;
		path = path.replace(/\?.*/g, '');
		QRCode.toCanvas(qrcode, path, {
			scale: 3,
			margin: 1,
			color: {dark: '#000000'}
		}, function(err) {
			if(err){
				screenTopWarning(err);
			}
		})
	}
})

function agree(_id) {
	nkcAPI('/fund/a/'+_id+'/member', 'PATCH', {agree: true})
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function disagree(_id) {
	nkcAPI('/fund/a/'+_id+'/member', 'PATCH', {agree: false})
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function support(_id) {
	var content = $('#content').val();
	var obj = {
		type: 'support',
		c: content
	};
	nkcAPI('/fund/a/'+_id+'/vote', 'POST', obj)
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function against(_id) {
	var content = $('#content').val();
	if(!content) {
		screenTopWarning('请输入反对的理由。');
		return;
	}
	var obj = {
		type: 'against',
		c: content
	};
	nkcAPI('/fund/a/'+_id+'/vote', 'POST', obj)
		.then(function(){
			window.location.reload();
		})
		.catch(function(data){
			screenTopWarning(data.error)
		})
}

function revoked(type, _id) {
	if(type === 'giveUp') {
		var content = prompt('请输入放弃的原因。', '');
		if(!content) return;
		nkcAPI('/fund/a/'+_id+'?type='+type+'&c='+content, 'DELETE', {})
			.then(function(){
				screenTopAlert('操作成功！');
			})
			.catch(function(data){
				screenTopWarning(data.error);
			})
	}
}

function disableApplicationForm(id, type) {
	if(type === true && confirm('确定要封禁该基金申请？') === false) return;
	nkcAPI('/fund/a/'+id+'/disabled', 'PATCH',{type: type})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function excellent(id, type) {
	nkcAPI('/fund/a/'+id+'/excellent', 'PATCH', {type: type})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}


function submitComment(id) {
	var comment = $('#commentContent').val();
	if(!comment) return screenTopWarning('请输入评论内容。');
	var obj = {
		c: comment
	};
	nkcAPI('/fund/a/'+id+'/comment', 'POST', {comment: obj})
		.then(function() {
			window.location.reload();
		})
		.catch(function (data) {
			screenTopWarning(data.error);
		})
}

function disabledComment(applicationFormId, commentId, type) {
	nkcAPI('/fund/a/'+applicationFormId+'/comment/'+commentId+'?type='+type, 'DELETE', {})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function restoreApplicationForm(id) {
	nkcAPI('/fund/a/'+id, 'POST', {operation: 'restore'})
		.then(function() {
			window.location.reload();
		})
		.catch(function(data) {
			screenTopWarning(data.error||data);
		})
}