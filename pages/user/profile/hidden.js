
// document.addEventListener('click',({target})=>{
//   // console.log(target, (target.innerText === '全部'))
//   const iframe = document.body;
//     console.log(iframe.style.opacity="0") 
//   if((target.innerText === '全部') || (target.innerText === '我的')){
//     const iframe = document.querySelector("iframe");
//     console.log(iframe) 
//     iframe.style.height = 0 + "px";
//     if (iframe.attachEvent) {
//       iframe.attachEvent("onload", () => {
//         iframe.onload = () => {
//           var iDoc = iframe.contentDocument || iframe.contentWindow.document;
//           var height =
//             iDoc.documentElement.clientHeight || iDoc.body.clientHeight;
//           iframe.style.height = height + "px";
//         };
//       });
//     } else {
//       iframe.onload = () => {
//         var iDoc = iframe.contentDocument || iframe.contentWindow.document;
//         var height =
//           iDoc.documentElement.clientHeight || iDoc.body.clientHeight;
//         iframe.style.height = height + "px";
//       };
//     }
//   }
// })
// function listenerIfream (){
  
// }
$(document).ready(()=>{
  if(top.location.search){
    const serach = top.location.search.split('=')
    // 页面先隐藏 等隐藏了不需要页面后再显示
    if(serach[0] ==='?type' && serach[1] === 'hidden'){
      document.querySelector('.row').style.display = 'flex';
      document.querySelector('.row').style.justifyContent += 'center'
      // 获取 页头
      document.querySelector('.navbar').style.display = 'none';
      // 获取 页脚
      document.querySelector('.footer').style.display = 'none';
      // 获取 右上 （购物车）
      document.querySelector('.shopping-cart').style.display = 'none';
      // 获取 左侧 （显示用户信息） 
      document.querySelector('#get-left-user-info-list').style.display = 'none';
      // body.style.background = 'none';
      const content = $('#container-fluid-show')[0]
      content.addEventListener('click',function(e){
        let url;
        // 回复点击作者 通过 e.target.parentElement 获取a标签
        if(e.target.parentElement.tagName === "A"){
          e.preventDefault()
          url = e.target.parentElement.href
          window.open(url)
        }
        if(e.target.tagName === 'A'){
          e.preventDefault()
          url = e.target.href
          if(!url) return
          // 笔记的我的全部按钮 回复的分页按钮 在当前窗口打开
          const parentElement = e.target.parentElement
          if(parentElement._prevClass === "paging-button" || parentElement.tagName === 'LI' ){
            window.location.href = e.target.href
            return
          }
          window.open(url)
        }
      })
    }
  }
  document.querySelector('body').style.opacity = '1';
})
