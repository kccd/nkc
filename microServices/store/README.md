# @nkc/store

nkc专属附件存储服务，支持多磁盘、多服务、多主机部署。

### 一、安装
```
git clone https://github.com/kccd/nkc-store

npm i
```

### 二、配置文件说明 store.json
```
{
  "port": 10292, // 服务端口号
  "attachment": [ // 存储位置配置，按文件上传时间分配路径，（时间区间前闭后开）
    {
      "startingTime": "1970-01-01", 
      "endTime": "2020-07-14",
      "path": "E:/nkc-resource1"
    },
    {
      "startingTime": "2020-07-14",
      "endTime": "2020-12-25",
      "path": "E:/nkc-resource2"
    },
    {
      "startingTime": "2020-12-25",
      "endTime": "2077-01-01",
      "path": "G:/nkc-resource1"
    },
    ...
  ]
}
```

###  三、API 说明

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
    },
    ...
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

#### 3、上传文件
```
POST /
body: FormData // 其中的 file1、file2 可自定义，但必须保证 fields 和 files 中的键名相同
  fields: {
    file1: {
      time: Number, 文件上传时间戳
      path: String, 文件相对路径
    },
    file2: {
      time: Number,
      path: String,
    },
    ...
  }
  files: {
    file1: File,
    file2: File,
    ...  
  }
```