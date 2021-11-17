# @nkc/store



###  API 说明

#### 1、获取文件信息
```
GET /info

query: {
  files: [
    {
      type: String, // 自定义属性
      time: Number, // 附件上传日期
      path: String, // 附件相对目录
    },
    ...
  ]
}
res: {
  files: [
    type: String,
    time: Number,
    path: String,
    
    loat: Boolean, // 文件是否丢失
    info: null 或 {
      path: String, // 文件的路径
      name: String, // 文件名
      ext: String, // 文件格式
      hash: String, // 文件 MD5
      size: Stirng, // 文件大小 字节
      mtime: Date, // 文件最后修改时间
      height: Number, // 图片、视频高
      width: Number, // 图片、视频宽
      duration: Number, // 音频、视频时长 秒  
    }
  ]
}
```

#### 2、获取文件
```
GET / 

query: {
  time: Number, // 附件上传日期
  path: String, // 附件相对目录
}    

res: file stream
```