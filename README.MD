# nkc

## Requirements
- Base: [Node.js](https://nodejs.org) v12.14.0
      
- Database: 
    1. **[mongoDB](https://www.mongodb.com)** v4.4.5
    2. **[Redis](https://redis.io/)** v3.2.100
    3. **[ElasticSearch](https://elastic.co)** v6.0.1
 
- Image Processing: **[ImageMagick](https://www.imagemagick.org)** v7.0.10 
- PDF Processing: **[Ghostscript](https://www.ghostscript.com/)** v9.53.3, **[QPDF](https://qpdf.sourceforge.io/)** v10.3.2
- video Processing: **[ffmpeg](https://www.ffmpeg.org/)** v4.0.2

## Main Frameworks
- Web Framework: **[Koa](http://koajs.com)**
- Template Language: **[Pug](https://pugjs.org)**
- ORM: **[Mongoose](https://www.mongoosejs.com)**

## Install

1. install all the requirements
2. clone this repo
3. run `npm install` in your console
4. run `npm run init` to initialize data
5. npm start and you are able to access via localhost:1086

## How to call an API
- In browser

```javascript
import {nkcAPI} from 'pages/lib/js/netAPI';
import {sweetError, sweetSuccess} from 'pages/lib/js/sweetAlert';

nkcAPI(`pathToYourTarget`, HTTP_Method, {someParameter:'someValue'})
  .then(sweetSuccess)
  .catch(sweetError)
```

## Future plans
- change the template engine into React, 
- isomorphism
- multiple device support(IOS, android, etc)
