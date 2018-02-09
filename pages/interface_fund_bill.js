function modify(fundId, id) {
	var time = $('#time').val();
	var uid = $('#uid').val();
	var changed = $('#changed').val();
	var abstract = $('#abstract').val();
	var notes = $('#notes').val();
	if(!time) return screenTopWarning('时间不能为空。');
	if(!uid) return screenTopWarning('操作人不能为空。');
	if(!changed) return screenTopWarning('资金变动不能为空。');
	if(!abstract) return screenTopWarning('摘要不能为空。');
	if(!notes) return screenTopWarning('备注不能为空。');
	const obj = {
		time: time,
		uid: uid,
		changed: changed,
		abstract: abstract,
		notes: notes
	};
	nkcAPI('/fund/list/'+fundId.toLowerCase()+'/bills/'+id, 'PATCH', {obj: obj})
		.then(function() {
			screenTopAlert('修改成功。');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function deleteBill(fundId, id) {
	if(confirm('确定要删除该记录？') === false) {
		return;
	}
	nkcAPI('/fund/list/'+fundId.toLowerCase()+'/bills/'+id, 'DELETE', {})
		.then(function() {
			window.location.href = '/fund/list/'+fundId.toLowerCase() +'/bills';
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}