var gallery = (function(){
  var gallery = {
    imageItem:geid('GalleryImage'),
    titleItem:geid('GalleryTitle'),
    authorItem:geid('GalleryAuthor'),
    forumName:geid('GalleryForumName'),
    imageA: geid('GalleryImageA'),
    navileft:geid('GalleryNavigationLeft'),
    naviright:geid('GalleryNavigationRight'),
  }

  gallery.next = function(step){
    var arr = gallery.arr

    gallery.counter = (gallery.counter+step+arr.length)%arr.length

    var counter = gallery.counter
    var galleryItem = arr[counter]

    gallery.render(galleryItem)
  }

  gallery.click = function(){
    gallery.end()
    gallery.next(1)
    gallery.start()
  }

  gallery.backclick =function(){
    gallery.end()
    gallery.next(-1)
    gallery.start()
  }

  gallery.start = function(){
    gallery.timer = setTimeout(function(){
      gallery.next(1)
      gallery.start()
    },6000)
  }

  gallery.end = function(){
    clearTimeout(gallery.timer)
  }

  gallery.render = function(galleryItem){

    var r = galleryItem.r
    var thread = galleryItem.thread
    var f = galleryItem.forum

    gallery.imageItem.src = '/r/'+ r._key

    gallery.titleItem.innerHTML = thread.oc.t.replace(/</g,'&lt;').replace(/>/g,'&gt;')
    gallery.titleItem.href = '/t/' + thread._key
    gallery.imageA.href = '/t/' + thread._key;
    gallery.authorItem.innerHTML = thread.ocuser.username
    gallery.authorItem.href = '/m/' + thread.ocuser._key

    gallery.forumName.innerHTML = f.display_name
    gallery.forumName.href = '/f/' + f._key
  }

  gallery.init = function(){
    gallery.navileft.addEventListener('click',gallery.backclick)
    gallery.naviright.addEventListener('click',gallery.click)
    var params = {};
    params.target = geid('gMain').getAttribute('fTarget');
    console.log('gallery init...');
    return nkcAPI('getGalleryRecent',params)
    .then(function(arr){
      gallery.arr = arr
      gallery.counter = Math.floor(Math.random()*arr.length)
    })
    .catch(jwarning)
  }

  return gallery
})()

gallery.init().then(function(){
  gallery.start()
  gallery.click()
})
