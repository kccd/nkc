
$(document).ready(()=>{
  // if(top.location.search){
  //   const serach = top.location.search.split('=')
  //   // 页面先隐藏 等隐藏了不需要页面后再显示
  //   if(serach[0] ==='?type' && serach[1] === 'hidden'){
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
  //   }
  // }
  document.querySelector('body').style.display = 'block';
})
