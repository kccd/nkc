var nationCode = '86';
//选择国际区号
function chooseCountryNum(num){
  nationCode = parseInt(num);
}

function error_report(str){
  geid('error_info').innerHTML = '<strong style="color:red;">'+str+'</strong>';
  display('error_info_panel');  //下面的提示框
  screenTopWarning(str);
}

function info_report(str){
  geid('error_info').innerHTML = '<strong style="color:#4169E1;">'+str+'</strong>';
  display('error_info_panel');  //下面的提示框
  screenTopAlert(str);
}




function register_submit(){
  return Promise.resolve()
  .then(function(){
    var userobj={
      username : gv('username'),
      password : gv('password'),
      password2 : gv('password2'),
      mobile:gv('phone'),
      mcode:gv('mcode'),
      nationCode: nationCode,
	    imgCode: gv('icode')
      /*,
      icode:gv('icode')*/
    }
		userobj.username = $.trim(userobj.username);
    if(userobj.username === ''){
      getFocus("#username")
      throw('请填写用户名！')
    }
    if(userobj.password === ''){
      getFocus("#password")
      throw('请填写密码！')
    }
    if(userobj.password2 === ''){
      getFocus("#password2")
      throw('请再次填写密码！')
    }
    if(userobj.password.length < 8){
      getFocus("#password")
      throw('密码长度不能小于8位，请重新填写！')
    }
    if(checkPass(userobj.password) < 2){
      getFocus("#password")
      throw('密码要具有数字、字母和符号三者中的至少两者！')
    }
    if(userobj.password2!==userobj.password){
      getFocus("#password2")
      throw('两遍密码不一致！')
    }
    if(userobj.phone === ''){
      getFocus("#phone")
      throw('请填写手机号码！')
    }
    if(userobj.imgCode === '') {
	    getFocus("#icode")
	    throw('请填写图片验证码。');
    }
    /*if(!(/(^[1-9]\d*$)/.test(userobj.mobile))){
      getFocus("#phone")
      throw('手机号码格式不正确！')
    }*/
    /*if(userobj.phone.length !== 11)
    {
      getFocus("#phone")
      throw({detail:'手机号码格式不正确！'})
      return;
    }*/
    if(userobj.mcode === ''){
      getFocus("#mcode")
      throw('请填写手机验证码！')
    }
    return nkcAPI('/register/mobile','post',userobj)
  })
  .then(function(data){
  	var uid = data.user.uid;
    window.location.href = '/u/'+uid+'/subscribe?type=register';

  })
  .catch(function(data){
  	if(data.error === undefined) {
  		data = {error: data};
	  }
    if(data.error == '用户名已存在，请输入其他用户名'){
      //refreshICode();
      getFocus("#username")
    }
    if(data.error == '手机验证码不正确，请检查'){
      //refreshICode();
      getFocus("#mcode")
    }
    if(data.error == '此号码已经用于其他用户注册，请检查或更换'){
      //refreshICode();
      getFocus("#phone")
    }
    if(['图片验证码无效。', '图片验证码已失效。', '图片验证码错误。'].indexOf(data.error) !== -1) {
	    getFocus("#icode")
    }
    error_report(data.error);
  })

}


function getMcode(){
  var phone = geid('phone').value.trim();
  var username = geid('username').value.trim();
  var password = geid('password').value.trim();
  var password2 = geid('password2').value.trim();
  var imgCode = geid('icode').value.trim();

  if(username === ''){
    getFocus("#username");
    return error_report('请填写用户名。')
  }
  if(password === ''){
    getFocus("#password");
    return error_report('请填写密码。')
  }
  if(password2 === ''){
    getFocus("#password2");
    return error_report('请再次填写密码。')
  }
  if(password !== password2) {
  	getFocus("#password2");
	  return error_report('两次输入的密码不一致，请重新输入。');
  }
  if(phone === ''){
    getFocus("#phone");
    return error_report('请填写手机号码。')
  }
	var reg = /^[0-9]*$/;
  if(!reg.test(phone)) {
	  getFocus("#phone");
	  return error_report('手机号码格式不正确。')
  }
  if(imgCode === '') {
	  getFocus("#icode");
	  return error_report('请输入图片中验证码。');
  }
  /*if(!(/(^[1-9]\d*$)/.test(phone))){
    getFocus("#phone")
    return error_report('手机号码格式不正确！')
  }*/
  /*if(phone == '' || phone.length !== 11 )
  {
    getFocus("#phone")
    return error_report('手机号码为空或者格式不正确！')
  }*/
 /* if(icode == ''){
    getFocus("#icode")
    return error_report('请填写图片验证码！')
  }*/

  else{
    nkcAPI('/sendMessage/register','POST',{mobile:phone, nationCode: nationCode, username: username, imgCode: imgCode})
    .then(function(){
	    info_report('短信验证码发送成功。');
      var count = 120;
      var countdown = setInterval(CountDown, 1000);
      function CountDown() {
          $("#getMcode").attr("disabled", true);
          $("#getMcode").text(count + "秒后可重发");
          if (count == 0) {
              $("#getMcode").text("获取手机验证码");
              $("#getMcode").val("Submit").removeAttr("disabled");
              clearInterval(countdown);
          }
          count--;
      }
    })
    .catch(function(data){
      if(data.error === '手机号码已被其他账号注册。'){
        getFocus("#phone");
      }
      if(data.error === '用户名已被注册。'){
        getFocus("#username");
      }
      if(data.error === '图片验证码无效。') {
      	getFocus("#icode");
      }
      error_report(data.error);
    })
  }
}


/*function refreshICode() {
  nkcAPI('//refreshICode')
    .then(function(res) {
      $('#icodeImg').attr('src', '/static/captcha/captcha.svg?' + Math.random())
    })
}*/

//点击刷新图片验证码
/*
$(document).ready(function() {
	 $("#icodeImg").click(//refreshICode)
})
*/


function getFocus(a){
  $(a).css('border-color','#f88')
  $(a).focus()
  $(a).blur(function(){
    $(a).css('border-color','')
  })
}


//检查密码复杂度
function checkPass(s){
	 var ls = 0;
	 if(s.match(/([a-zA-Z])+/)){
	    ls++;
	 }
	 if(s.match(/([0-9])+/)){
	    ls++;
	 }
	 if(s.match(/[^a-zA-Z0-9]+/)){
	    ls++;
	 }
	 return ls
}

var imgCode = $('#imgCode');
var progressBar = $('#progressBar');
var imgWidth = imgCode.width();
var maxTime = 60000;
var initTime = Date.now();
var sT;
progressBar.width(imgWidth);

autoChangeImg();

function changeImg() {
	imgCode.attr('src', '/register/code?'+Date.now());
	imgWidth = imgCode.width();
	initTime = Date.now();
	displayBar();
	autoChangeImg()
}

imgCode.on('click', function() {
	changeImg();
});

function autoChangeImg() {
	clearTimeout(sT);
	sT = setTimeout(function(){
		displayBar();
		if(Date.now()-initTime >= maxTime) {
			changeImg();
		} else {
			autoChangeImg();
		}
	}, 200)
}

function displayBar() {
	progressBar.width(((maxTime-Date.now()+initTime)/maxTime)*imgWidth + 'px');
}