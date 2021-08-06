function getRedisPageKeyByUrl(url) {
  return {
    web: [
      `page:${url}:toc`,
      `page:${url}:data`
    ],
    reactNative: [
      `app:RN:page:${url}:toc`,
      `app:RN:page:${url}:data`
    ],
    apiCloud: [
      `app:AC:page:${url}:toc`,
      `app:AC:page:${url}:data`
    ]
  }
}
module.exports = {
  getRedisPageKeyByUrl
};