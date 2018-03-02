function modify(id, fundId) {
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
	var url = '/fund/bills/'+id;
	if(fundId) {
		url = '/fund/list/'+fundId.toLowerCase()+'/bills/'+id;
	}
	nkcAPI(url, 'PATCH', {obj: obj})
		.then(function() {
			screenTopAlert('修改成功。');
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}

function deleteBill(id, fundId) {
	if(confirm('确定要删除该记录？') === false) {
		return;
	}
	var url = '/fund/bills/'+id;
	var href = '/fund/bills';
	if(fundId) {
		url = '/fund/list/'+fundId.toLowerCase()+'/bills/'+id;
		href = '/fund/list/'+fundId.toLowerCase() +'/bills';
	}
	nkcAPI(url, 'DELETE', {})
		.then(function() {
			window.location.href = href;
		})
		.catch(function(data) {
			screenTopWarning(data.error);
		})
}