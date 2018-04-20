function initTime() {
	$('.time').datetimepicker({
		language:  'zh-CN',
		format: 'yyyy-mm-dd',
		autoclose: 1,
		todayHighlight: 1,
		startView: 4,
		minView: 2,
		forceParse: 0
	});
}


$.getJSON('/sql_areas.json',function(data){
	for (var i = 0; i < data.length; i++) {
		var area = {id:data[i].id,name:data[i].cname,level:data[i].level,parentId:data[i].upid};
		data[i] = area;
	}
	$('.bs-chinese-region').chineseRegion('source',data);
	$('#location').val($('#location').attr('data'));
});

var eduName = [
	{
		id: 1,
		name: '小学'
	},
	{
		id: 2,
		name: '初中'
	},
	{
		id: 3,
		name: '高中'
	},
	{
		id: 4,
		name: '大学'
	},
	{
		id: 5,
		name: '硕士'
	},
	{
		id: 6,
		name: '博士'
	}
];

var indName = [
	{ id: 0, name: 'IT|通信|电子|互联网', level: 1 },
	{ id: 1, name: '金融业', level: 1 },
	{ id: 2, name: '房地产|建筑业', level: 1 },
	{ id: 3, name: '商业服务', level: 1 },
	{ id: 4, name: '贸易|批发|零售|租赁业', level: 1 },
	{ id: 5, name: '文体教育|工艺美术', level: 1 },
	{ id: 6, name: '生产|加工|制造', level: 1 },
	{ id: 7, name: '交通|运输|物流|仓储', level: 1 },
	{ id: 8, name: '服务业', level: 1 },
	{ id: 9, name: '文化|传媒|娱乐|体育', level: 1 },
	{ id: 10, name: '能源|矿产|环保', level: 1 },
	{ id: 11, name: '政府|非盈利机构', level: 1 },
	{ id: 12, name: '农|林|牧|渔|其他', level: 1 },
	{ id: 13, name: '互联网/电子商务', parentId: 0, level: 2 },
	{ id: 14, name: '计算机软件', parentId: 0, level: 2 },
	{ id: 15, name: 'IT服务(系统/数据/维护)', parentId: 0, level: 2 },
	{ id: 16, name: '电子技术/半导体/集成电路', parentId: 0, level: 2 },
	{ id: 17, name: '计算机硬件', parentId: 0, level: 2 },
	{ id: 18, name: '通信/电信/网络设备', parentId: 0, level: 2 },
	{ id: 19, name: '通信/电信运营、增值服务', parentId: 0, level: 2 },
	{ id: 20, name: '网络游戏', parentId: 0, level: 2 },
	{ id: 21, name: '基金/证券/期货/投资', parentId: 1, level: 2 },
	{ id: 22, name: '保险', parentId: 1, level: 2 },
	{ id: 23, name: '银行', parentId: 1, level: 2 },
	{ id: 24, name: '信托/担保/拍卖/典当', parentId: 1, level: 2 },
	{ id: 25, name: '房地产/建筑/建材/工程', parentId: 2, level: 2 },
	{ id: 26, name: '家居/室内设计/装饰装潢', parentId: 2, level: 2 },
	{ id: 27, name: '物业管理/商业中心', parentId: 2, level: 2 },
	{ id: 28, name: '专业服务/咨询(财会/法律/人力资源等)', parentId: 3, level: 2 },
	{ id: 29, name: '广告/会展/公关', parentId: 3, level: 2 },
	{ id: 30, name: '中介服务', parentId: 3, level: 2 },
	{ id: 31, name: '检验/检测/认证', parentId: 3, level: 2 },
	{ id: 32, name: '外包服务', parentId: 3, level: 2 },
	{ id: 33, name: '快速消费品（食品/饮料/烟酒/日化）', parentId: 4, level: 2 },
	{ id: 34, name: '耐用消费品（服饰/纺织/皮革/家具/家电）', parentId: 4, level: 2 },
	{ id: 35, name: '贸易/进出口', parentId: 4, level: 2 },
	{ id: 36, name: '零售/批发', parentId: 4, level: 2 },
	{ id: 37, name: '租赁服务', parentId: 4, level: 2 },
	{ id: 38, name: '教育/培训/院校', parentId: 5, level: 2 },
	{ id: 39, name: '礼品/玩具/工艺美术/收藏品/奢侈品', parentId: 5, level: 2 },
	{ id: 40, name: '汽车/摩托车', parentId: 6, level: 2 },
	{ id: 41, name: '大型设备/机电设备/重工业', parentId: 6, level: 2 },
	{ id: 42, name: '加工制造（原料加工/模具）', parentId: 6, level: 2 },
	{ id: 43, name: '仪器仪表及工业自动化', parentId: 6, level: 2 },
	{ id: 44, name: '印刷/包装/造纸', parentId: 6, level: 2 },
	{ id: 45, name: '办公用品及设备', parentId: 6, level: 2 },
	{ id: 46, name: '医药/生物工程', parentId: 6, level: 2 },
	{ id: 47, name: '医疗设备/器械', parentId: 6, level: 2 },
	{ id: 48, name: '航空/航天研究与制造', parentId: 6, level: 2 },
	{ id: 49, name: '交通/运输', parentId: 7, level: 2 },
	{ id: 50, name: '物流/仓储', parentId: 7, level: 2 },
	{ id: 51, name: '医疗/护理/美容/保健/卫生服务', parentId: 8, level: 2 },
	{ id: 52, name: '酒店/餐饮', parentId: 8, level: 2 },
	{ id: 53, name: '旅游/度假', parentId: 8, level: 2 },
	{ id: 54, name: '媒体/出版/影视/文化传播', parentId: 9, level: 2 },
	{ id: 55, name: '娱乐/体育/休闲', parentId: 9, level: 2 },
	{ id: 56, name: '能源/矿产/采掘/冶炼', parentId: 10, level: 2 },
	{ id: 57, name: '石油/石化/化工', parentId: 10, level: 2 },
	{ id: 58, name: '电气/电力/水利', parentId: 10, level: 2 },
	{ id: 59, name: '环保', parentId: 10, level: 2 },
	{ id: 60, name: '政府/公共事业/非盈利机构', parentId: 11, level: 2 },
	{ id: 61, name: '学术/科研', parentId: 11, level: 2 },
	{ id: 62, name: '农/林/牧/渔', parentId: 12, level: 2 },
	{ id: 63, name: '跨领域经营', parentId: 12, level: 2 },
	{ id: 64, name: '其他', parentId: 12, level: 2 }
];

var data = JSON.parse($('#data').text());

var education = data.education;
var industries= data.industries;

function educationRender(arr) {
	var div = $('<div></div>');
	for(var i = 0; i < arr.length; i++) {
		var educationList = addEduElement(arr[i], i);
		div.append(educationList);
	}
	return div;
}

function industriesRender(arr) {
	var div = $('<div></div>');
	for(var i = 0; i < arr.length; i++) {
		var industriesList = addIndElement(arr[i], i);
		div.append(industriesList);
	}
	return div;
}

function addEduElement(obj, i) {
	var educationList = $('<div class="education-list"></div>');
	var form = $('<form class="form-inline"></form>');
	var select = $('<select class="form-control" id="eduName'+i+'" onchange="changeSelect('+i+', this.value)"></select> ');
	for(var j = 0; j < eduName.length; j++) {
		var selected = '';
		if(obj.degree === eduName[j].id) {
			selected = 'selected';
		}
		var option = $('<option '+selected+'>'+eduName[j].name+'</option> ');
		select.append(option);
	}
	var timeInput = $('<input class="form-control time" id="eduTime'+i+'" size="7" type="text" placeholder="入学时间" value="'+obj.timeB+'"> ');
	var schoolInput = $('<input class="form-control" id="eduSchool'+i+'" type="text" placeholder="学校名称" value="'+obj.school+'"> ');
	var majorInput = $('<input class="form-control" id="eduMajor'+i+'" type="text" placeholder="专业名称" value="'+obj.major+'" style="'+(obj.degree > 3?'':'display: none;')+'"> ');
	var deleteBtn = $('<button class="btn btn-danger btn-sm" onclick="deleteEdu('+i+')" id="edu'+i+'DeleteBtn">删除</button> ');
	form.append(select);
	form.append('&nbsp;');
	form.append(timeInput);
	form.append('&nbsp;');
	form.append(schoolInput);
	form.append('&nbsp;');
	form.append(majorInput);
	form.append('&nbsp;');
	form.append(deleteBtn);
	form.append('&nbsp;');
	educationList.append(form);
	return educationList;
}

function addIndElement(obj, i) {
	var industriesList = $('<div class="industries-list"></div>');
	var form = $('<form class="form-inline"></form>');
	var indSelect = $('<select class="form-control" onchange="selectInd('+i+', this.value)"></select>');
	var dutySelect = $('<select class="form-control" onchange="selectDuty('+i+', this.value)" id="duty'+i+'"></select>');
	for(var j = 0; j < indName.length; j++) {
		var ind = indName[j];
		if(ind.level === 1) {
			var selected = '';
			if(ind.id === obj.industry) {
				selected = 'selected';
			}
			var option = $('<option '+selected+'>'+ind.name+'</option> ');
			indSelect.append(option);
		}
		if(ind.parentId === obj.industry) {
			selected = '';
			if(ind.id === obj.duty) {
				selected = 'selected';
			}
			option = $('<option '+selected+'>'+ind.name+'</option> ');
			dutySelect.append(option);
		}
	}
	var occu = $('<input type="text" class="form-control" id="indOccu'+i+'" placeholder="职位名称" value="'+obj.occupation+'">');
	var br = $('<br>');
	var org = $('<input type="text" class="form-control" id="indOrg'+i+'" placeholder="公司名称" value="'+obj.organization+'">');
	var timeB = $('<input type="text" class="form-control time" id="indTimeB'+i+'" size="8" placeholder="入职时间" value="'+obj.timeB+'">');
	var timeE = $('<input type="text" class="form-control time" id="indTimeE'+i+'" size="8" placeholder="离职时间" value="'+obj.timeE+'">');
	var deleteBtn = $('<button class="btn btn-danger btn-sm" onclick="deleteInd('+i+')" id="ind'+i+'DeleteBtn">删除</button> ');
	form.append(indSelect);
	form.append('&nbsp;');
	form.append(dutySelect);
	form.append('&nbsp;');
	form.append(occu);
	form.append('&nbsp;');
	form.append(br);
	form.append(org);
	form.append('&nbsp;');
	form.append(timeB);
	form.append('&nbsp;');
	form.append(timeE);
	form.append('&nbsp;');
	form.append(deleteBtn);
	form.append('&nbsp;');
	industriesList.append(form);
	form.append('&nbsp;');
	return industriesList;
}

function displayInd() {
	$('#industries-div').html(industriesRender(industries));
	initTime();
}

function displayEdu() {
	$('#education-div').html(educationRender(education));
	initTime();
}

function deleteEdu(i) {
	load();
	education.splice(i, 1);
	displayEdu();
}

function deleteInd(i) {
	load();
	industries.splice(i, 1);
	displayInd();
}

function addEdu() {
	var obj = {
		degree: 1,
		timeB: '',
		major: '',
		school: ''
	};
	var element = addEduElement(obj, education.length);
	$('#education-div>div').append(element);
	education.push(obj);
	initTime();
}

function addInd() {
	var obj = {
		timeB: '',
		timeE: '',
		industry: 0,
		duty: 14,
		occupation: '',
		organization: ''
	};
	var element = addIndElement(obj, industries.length);
	$('#industries-div>div').append(element);
	industries.push(obj);
	initTime();
}

function load() {
	for(var i = 0 ; i < education.length; i++) {
		var e = education[i];
		e.timeB = $('#eduTime'+i).val();
		e.school = $('#eduSchool'+i).val();
		e.major = $('#eduMajor'+i).val();
	}
	for(var i = 0; i < industries.length; i++) {
		var e = industries[i];
		e.timeB = $('#indTimeB'+i).val();
		e.timeE = $('#indTimeE'+i).val();
		e.occupation = $('#indOccu'+i).val();
		e.organization = $('#indOrg'+i).val();
	}
}


function changeSelect(j, value) {
	var id;
	for(var i = 0; i < eduName.length; i++) {
		if(eduName[i].name === value) {
			id = eduName[i].id;
			break;
		}
	}
	education[j].degree = id;
	if(id < 4) {
		$('#eduMajor'+j).css('display', 'none');
	} else {
		$('#eduMajor'+j).css('display', '');
	}
}

function selectInd(j, value) {
	var indId;
	var selected = 'selected';
	$('#duty'+j).html('');
	for(var i = 0; i < indName.length; i++) {
		var ind = indName[i];
		if(ind.name === value) {
			indId = ind.id;
			break;
		}
	}
	for(var i = 0; i < indName.length; i++) {
		ind = indName[i];
		if(ind.parentId === indId) {
			var option = $('<option '+selected+'>'+ind.name+'</option>');
			$('#duty'+j).append(option);
			if(selected) selected = '';
		}
	}
	industries[j].industry = indId;
}

function selectDuty(j, value) {
	for(var i = 0; i < indName.length; i++) {
		var ind = indName[i];
		if(ind.name === value) {
			industries[j].duty = ind.id;
			break;
		}
	}
}


displayInd();
displayEdu();

function submit(uid) {
	load();
	var obj = {
		education: education,
		industries: industries,
		name: $('#name').val(),
		birthDate: $('#birthDate').val(),
		address: $('#address').val(),
		location: $('#location').val()
	};
	var arr = $('input[name="gender"]');
	if(arr.eq(0).is(':checked')) {
		obj.gender = 'men';
	} else if(arr.eq(1).is(':checked')) {
		obj.gender = 'women';
	} else {
		obj.gender = ''
	}
	nkcAPI('/u/'+uid+'/settings/resume', 'PATCH', obj)
		.then(function() {
			screenTopAlert('保存成功');
			setTimeout(function() {
				window.location.reload();
			}, 1500);
		})
		.catch(function(data) {
			screenTopWarning(data.error || data);
		})
}