
$(document).ready(()=>{
  // if(top.location.search){
  //   const serach = top.location.search.split('=')
  //   if(serach[0] ==='?type' && serach[1] === 'hidden'){
      // document.querySelector('.row').style.display = 'flex';
      // document.querySelector('.row').style.justifyContent += 'center'
      // console.log(document.querySelector('.row'))
      // 获取 页头
      const navbar = document.querySelector('.navbar');
      // alert(navbar);
      navbar && (navbar.style.display = 'none');
      // 获取 页脚
      const footer = document.querySelector('.footer');
      // alert(footer);

      footer && (footer.style.display = 'none');
      // 获取 右上 （购物车）
      const shoppingCart = document.querySelector('.shopping-cart');
      shoppingCart && (shoppingCart.style.display = 'none');
      // 获取 左侧 （显示用户信息） 
      const userInfo = document.querySelector('#get-left-user-info-list');
      userInfo && (userInfo.style.display = 'none');
      // body.style.background = 'none';
      const content = $('#container-fluid-show')[0]
      content && (content.children[0].style.padding = '0');
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
  const body = document.querySelector('body');
  body && (body.style.display = 'block');
})
