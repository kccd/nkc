# nkc

## Requirements
- Base: [Node.js](https://nodejs.org)

      v7.6+ is required, for async function
      
- Database: 
    1. **[mongoDB](https://www.mongodb.com)** v3.4
    2. **[Redis](https://redis.io/)** v3.2.100
 
- Image Processing: **[ImageMagick](https://www.imagemagick.org)** v7.0 or higher
- Search: **[ElasticSearch 6](https://elastic.co)** with **[IK Analysis for Elasticsearch](https://github.com/medcl/elasticsearch-analysis-ik)**
- video Processing: **[ffmpeg](https://www.ffmpeg.org/)** v4.0.2

## Main Frameworks
- Web Framework: **[Koa](http://koajs.com)**
- Template Language: **[pug](https://pugjs.org)**
- ORM: **[mongoose](https://www.mongoosejs.com)** v4.\*, v5.\* may not be compatible.

## Install

1. install all the requirements
2. clone this repo
3. run `npm install` in your console
4. npm start and you are able to access via localhost:1086

## How to call an API
- In browser

```html
<script src='/interface_common.js'/>
<script>
  nkcAPI(`pathToYourTarget`, HTTP_Method, {someParameter:'someValue'})
    .then(jalert)
    .catch(jalert)
</script>
```

## Future plans
- change the template engine into React, 
- isomorphism
- multiple device support(IOS, android, etc)
