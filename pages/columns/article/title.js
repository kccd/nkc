import {strToObj} from "../../lib/js/dataConversion";
import {asyncSweetCustom} from "../../lib/js/sweetAlert";

function displayAuthor(contractObjStr){
  const contractObj = strToObj(contractObjStr);
  asyncSweetCustom(`联系邮箱：${contractObj.contractEmail}\n 
  联系邮箱：${contractObj.contractEmail}\n 
  联系邮箱：${contractObj.contractEmail}`)
}
Object.assign(window, { turnUser, displayAuthor })
document.addEventListener('click', (e) => {
  const target = e.target;
  const dom = $('.origin.origin-icon.dropdown');
  if(target.outerText !== "原创"){
    if(dom.hasClass('open')){
      dom.removeClass('open');
    }
  }else{
    if(dom.hasClass('open')){
      dom.removeClass('open');
    }else{
      dom.addClass('open');
    }
  }
});
/*document.onclick = function ({target}){
  // console.dir(target)
  if(target.outerText !== "原创"){
    if($('#dropdown').hasClass('open')){
      $('#dropdown').removeClass('open');
    }
  }else{
    if($('#dropdown').hasClass('open')){
      $('#dropdown').removeClass('open');
    }else{
      $('#dropdown').addClass('open');
    }
  }
}*/
function turnUser(uid) {
	if(uid) {
		// window.location.href = "/u/"+uid;
		openToNewLocation("/u/"+uid);
	}
}
