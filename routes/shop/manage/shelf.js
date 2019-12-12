const Router = require('koa-router');
const shelfRouter = new Router();
shelfRouter
	.get('/', async (ctx, next) => {
		const {data, db, query} = ctx;
    const {user} = data;
    // 检测是否被封禁商品上架功能
    const homeSetting = await db.ShopSettingsModel.findOne({type: "homeSetting"});
    if(homeSetting.banList) {
      if(homeSetting.banList.includes(user.uid)) {
        ctx.throw(400, "你已被禁止上架商品");
      }
    }
    data.forumList = await db.ForumModel.getAccessibleForums(data.userRoles, data.userGrade, data.user);
    data.forumsThreadTypes = await db.ThreadTypeModel.find({}).sort({order: 1});
    // 取出全部商城类别专业
    data.shopForumTypes = await db.ForumModel.getAllShopForums(data.userRoles, data.userGrade, data.user);
    // 取出全部vip等级
    data.grades = await db.UsersGradeModel.find({}).sort({_id: 1});
    const {productId} = query;
    if(productId) {
      const product = await db.ShopGoodsModel.findOne({productId});
      if(!product) ctx.throw(400, `商品不存在，productId: ${productId}`);
      data.product = (await db.ShopGoodsModel.extendProductsInfo([product]))[0];
      data.navType = "goods";
    } else {
      data.navType = "shelf";
    }
    ctx.template = 'shop/manage/shelf/shelf.pug';
		await next();
  })
	.post('/', async (ctx, next) => {
    const {data, db, body, tools, nkcModules} = ctx;
    const {
      checkNumber,
      checkString
    } = nkcModules.checkData;
    const {user} = data;
    let {
      productName, // 商品标题
      attention, // 关键词
      productDescription, // 商品简介
      productDetails, // 图文描述
      mainForumsId, // 专业分类，商品分类和辅助分类
      imgIntroductions, // 商品图
      isFreePost, // 是否免邮
      freightTemplates, // 运费模板
      stockCostMethod, // 减库存方式
      productStatus, // 上架相关
      shelfTime, // 定时上架的时间
      purchaseLimitCount, // 购买数量，-1为不限制，>1 数字为具体的限购数量
      productParams, // 规格信息，如果存在ID则为修改，否则为新增
      // singleParams, // 独立规格
      uploadCert, // 购买是否需要上传凭证
      uploadCertDescription, // 购买凭证说明
      vipDiscount, // 是否启用会员打折
      vipDisGroup, // 会员打折的具体数值
      productSettings, // 价格的可见性 游客可见、停售可见

      productId, // 商品ID 就在编辑商品信息时有值

    } = body.post;

    let product;

    if(productId) {
      product = await db.ShopGoodsModel.findOne({productId});
      if(!product) ctx.throw(400, `商品ID错误，productId: ${productId}`);
    }

    if(!product) {
      // 验证商品文字信息
      checkString(productName, {
        name: "商品标题",
        minLength: 6,
        maxLength: 200
      }); 
      // 验证商品简介
      checkString(productDescription, {
        name: "商品简介",
        minLength: 6, 
        maxLength: 1000
      });
      // 验证图文描述
      checkString(productDetails, {
        name: "图文描述",
        minLength: 1,
        maxLength: 100000
      });
      // 专业权限判断
      const accessibleForumsId = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, data.user);
      for(const fid of mainForumsId) {
        const forum = await db.ForumModel.findOne({fid});
        if(!forum) ctx.throw(400, `专业ID错误, fid: ${fid}`);
        if(!accessibleForumsId.includes(fid)) ctx.throw(400, `你无权在专业“${forum.displayName}”下发表内容`)
      }
    }
    // 验证商品图
    let resourcesId = imgIntroductions.filter(i => !!i);
    resourcesId = [...new Set(resourcesId)];
    if(!resourcesId.length) ctx.throw(400, "请至少选择一张商品图");
    const resourceCount = await db.ResourceModel.count({rid: {$in: resourcesId}, mediaType: "mediaPicture", ext: {$in: ["jpg", "jpeg", "png"]}});
    if(resourcesId.length !== resourceCount) ctx.throw(400, "商品图错误，请重新选择");
    const imgMaster = resourcesId[0];
    // 验证商品规格
    if(!productParams.length) ctx.throw(400, "请至少添加一个商品规格");
    productParams = productParams.map(param => {
      const {
        _id,
        name,
        originPrice,
        price,
        useDiscount,
        isEnable,
        stocksTotal
      } = param;
      const p = {
        isEnable: !!isEnable
      };
      checkString(name, {
        name: "规格名称",
        minLength: 1,
        maxLength: 100
      });
      p.name = name;
      checkNumber(stocksTotal, {
        name: "规格数量",
        min: 0
      }),
      p.stocksTotal = stocksTotal;
      checkNumber(originPrice, {
        name: "规格价格",
        min: 0.01,
        fractionDigits: 2
      });
      p.originPrice = originPrice * 100;
      if(useDiscount) {
        if(price >= originPrice) ctx.throw(400, "规格优惠价必须小于原价");
        checkNumber(price, {
          name: "规格优惠价",
          min: 0.01,
          fractionDigits: 2
        });
        p.price = price * 100;  
      } else {
        p.price = p.originPrice;
      }
      p._id = _id;
      p.useDiscount = !!useDiscount;      
      return p;
    });
    const grades = await db.UsersGradeModel.find().sort({_id: 1});
    vipDiscount = !!vipDiscount;
    if(vipDiscount) {
      const vipDisGroupObj = {};
      vipDisGroup.map(v => {
        const {vipNum, vipLevel} = v;
        checkNumber(vipLevel, {
          name: "会员等级",
          min: 0
        });
        checkNumber(vipNum, {
          name: "会员折扣等级",
          min: 0,
          max: 100
        });
        vipDisGroupObj[v.vipLevel] = v
      });
      vipDisGroup = grades.map(g => {
        const {_id} = g;
        const vipGrade = vipDisGroup[_id];
        const group = {
          vipLevel: _id,
          vipNum: 100
        };
        if(vipGrade) {
          group.vipNum = vipGrade.vipNum;
        }
        return group;
      });
    } else {
      vipDisGroup = grades.map(grade => {
        return {
          vipNum: 100,
          vipLevel: grade._id
        };
      });
    }
    isFreePost = !!isFreePost;
    if(!isFreePost) {
      freightTemplates = freightTemplates.map(f => {
        const {name, firstPrice, addPrice} = f;
        checkString(name, {
          name: "物流名称",
          minLength: 1,
          maxLength: 100
        });
        checkNumber(firstPrice, {
          name: "物流首件价格",
          min: 0,
          fractionDigits: 2
        });
        checkNumber(addPrice, {
          name: "物流每增加一件的价格",
          min: 0,
          fractionDigits: 2
        });
        return {
          name,
          firstPrice: firstPrice * 100,
          addPrice: addPrice  * 100
        };
      });
    } else {
      freightTemplates = [];
    }
    // 价格的显示
    const {priceShowToVisit, priceShowAfterStop} = productSettings;
    productSettings = {
      priceShowAfterStop: !!priceShowAfterStop,
      priceShowToVisit: !!priceShowToVisit
    };
    // 减库存的方式
    stockCostMethod = stockCostMethod === "orderReduceStock"? "orderReduceStock": "payReduceStock";
    // 购买限制
    if(purchaseLimitCount !== -1) {
      checkNumber(purchaseLimitCount, {
        name: "购买限制",
        min: 1
      });
    }
    if(uploadCert) {
      checkString(uploadCertDescription, {
        name: "凭证说明",
        minLength: 1,
        maxLength: 1000
      });
    } else {
      uploadCertDescription = "";
    }


    if(!product) {
      // 新上架
      if(!["notonshelf", "insale"].includes(productStatus)) {
        ctx.throw(400, "未知的上架类型");
      }
      const now = Date.now();
      if(shelfTime) {
        checkNumber(shelfTime, {
          name: "上架时间"
        });
        if(shelfTime <= now) {
          ctx.throw(400, "定时上架的时间必须大于当前时间");
        }
      }
      if(productStatus === "insale") {
        shelfTime = Date.now();
      }
      const options = {
        title: productName,
        abstractCn: productDescription,
        keyWordsCn: attention,
        content: productDetails,
        uid: user.uid,
        fids: mainForumsId,
        cids: [],
        ip: ctx.address,
        type: "product"
      };
      await db.ThreadModel.ensurePublishPermission(options);
      const productId = await db.SettingModel.operateSystemID("shopGoods", 1);
      product = db.ShopGoodsModel({
        productId,
        purchaseLimitCount,
        ip: ctx.address,
        mainForumsId,
        imgIntroductions,
        imgMaster,
        stockCostMethod,
        productStatus: "notonshelf",
        uploadCert,
        uploadCertDescription,
        shelfTime,
        isFreePost,
        freightTemplates,
        uid: user.uid,
        threadInfo: options,
        vipDiscount,
        vipDisGroup,
        productSettings
      });
      // 生成规格信息
      for(const param of productParams) {
        param.productId = productId; // 规格所属商品的ID
        param.uid = user.uid; // 商品拥有者
        param.stocksSurplus = param.stocksTotal; // 剩余库存=总库存
        param._id = await db.SettingModel.operateSystemID("shopProductsParams", 1);
        await db.ShopProductsParamModel(param).save();
      }
      await product.save();
      if(productStatus === "insale") {
        await product.onshelf();
      }
    } else {
      // 修改已上架的商品
      await product.update({
        purchaseLimitCount,
        imgIntroductions,
        imgMaster,
        stockCostMethod,
        uploadCert,
        uploadCertDescription,
        isFreePost,
        freightTemplates,
        vipDiscount,
        vipDisGroup,
        productSettings
      });
      for(const param of productParams) {
        const {
          _id,
          name,
          originPrice,
          price,
          isEnable,
          useDiscount,
          stocksTotal
        } = param;
        if(_id) {
          // 修改已有规格
          await db.ShopProductsParamModel.updateOne({_id, uid: user.uid, productId: product.productId}, {
            $set: {
              name,
              originPrice,
              price,
              isEnable: !!isEnable,
              useDiscount: !!useDiscount,
              stocksTotal
            }
          });
        } else {
          param.productId = product.productId; // 规格所属商品的ID
          param.uid = user.uid; // 商品拥有者
          param.stocksSurplus = param.stocksTotal; // 剩余库存=总库存
          param._id = await db.SettingModel.operateSystemID("shopProductsParams", 1);
          await db.ShopProductsParamModel(param).save();
        }
      }
    }
    return await next();
    /*
    const paramsInfo = body.post.params;
    const {contentLength} = tools.checkString;
    if(!productName) ctx.throw(400, '商品名不能为空');
    if(contentLength(productName) > 100) ctx.throw(400, '商品名不能超过100字节');
    if(!productDescription) ctx.throw(400, '商品描述不能为空');
    if(contentLength(productDescription) > 500) ctx.throw(400, '商品描述不能超过500字节');
    if(!attention){
      attention = []
    }else{
      attention = attention.split(",")
    }
    if(!productDetails) ctx.throw(400, '商品详细介绍不能为空');
    if(contentLength(productDetails) > 50000) ctx.throw(400, '商品详细介绍不能超过50000字节');
    const accessibleForumsId = await db.ForumModel.getAccessibleForumsId(data.userRoles, data.userGrade, user);
    if(!mainForumsId.length) ctx.throw(400, "至少选择一个商品分类");
    await Promise.all(mainForumsId.map(async fid => {
      const forum = await db.ForumModel.findOne({fid});
      if(!forum) ctx.throw(404, `不存在ID为【${fid}】的专业，请重新选择`);
      if(!accessibleForumsId.includes(fid)) {
        ctx.throw(400, `您没有访问专业【${forum.displayName}】的权限，无法在该专业下发布商品`);
      }
    }));
    if(!imgIntroductions.length) ctx.throw(400, '商品图片不能为空');
    await Promise.all(imgIntroductions.map(async rid => {
      const resource = await db.ResourceModel.findOne({rid});
      if(!resource) ctx.throw(400, `图片【${rid}】不存在`);
      if(!['jpg', 'png', 'jpeg'].includes(resource.ext.toLowerCase())) 
        ctx.throw(400, '商品图片只支持jpg、png和jpeg格式');
    }));
    if(!imgMaster) ctx.throw(400, '商品主要图片不能为空');
    if(!imgIntroductions.includes(imgMaster)) ctx.throw(400, '请在已选择的商品图片中选择商品主要图片');
    if(!['payReduceStock', 'orderReduceStock'].includes(stockCostMethod)) 
      ctx.throw(400, '库存计数方式错误，仅支持【付款减库存(payReduceStock)】、【下单减库存(orderReduceStock)】');
    if(!['notonshelf', 'insale'].includes(productStatus)) 
      ctx.throw(400, '商品状态 设置错误，仅支持【上架(insale)】、【不上架(notonshelf)】');
    if(productStatus === 'notonshelf' && shelfTime && Date.now() >= new Date(shelfTime))
      ctx.throw(400, '商品的上架时间不能早于当前时间，若想立即上架商品请点击【立即上架】按钮'); 
    if(productStatus === "insale") {
      shelfTime = Date.now();
    }  
    if(productParams.length === 0) ctx.throw(400, '规格信息不能为空');
    if(paramsInfo.length !== 0) {
      let count = paramsInfo[0].values.length;
      for(let i = 1; i < paramsInfo.length; i++) {
        count = count * paramsInfo[i].values.length;
      }
      if(count !== productParams.length) ctx.throw(400, `规格组合缺失，根据输入的规格信息，总组合数应该为${count}。`);
    }
    for(const p of productParams) {
      if(p.originPrice < 0) continue;
      if(paramsInfo.length !== 0) {
        if(!p.index) ctx.throw(400, '规格索引不能为空');
        const arr = p.index.split('-');
        for(let i = 0; i < arr.length; i++) {
          if(arr[i] >= paramsInfo[i].values.length) 
            ctx.throw(400, `规格组合中的规格索引设置错误，规格【${paramsInfo[i].name}】只有${paramsInfo[i].values.length}个值，而索引值为${arr[i]}`);
        }
      }
      if(p.stocksTotal < 0) ctx.throw(400, '商品库存不能小于0');
      if(!p.useDiscount) p.price = p.originPrice;
      else {
        if(p.price < 0) ctx.throw(400, '商品优惠价不能小于0');
        if(p.originPrice < p.price) ctx.throw(400, '商品优惠价必须小于商品原价');
      }
    }
    // 发表商品文章
    const options = {
      title: productName,
      abstractCn: productDescription,
      keyWordsCn: attention,
      content: productDetails,
      uid: user.uid,
      fids: mainForumsId,
      cids: [],
      ip: ctx.address,
      type: 'product'
    };
    await db.ThreadModel.ensurePublishPermission(options);
    const productId = await db.SettingModel.operateSystemID('shopGoods', 1);
    const product = db.ShopGoodsModel({
      productId,
      purchaseLimitCount,
      ip: ctx.address,
      mainForumsId,
      imgIntroductions,
      imgMaster,
      stockCostMethod,
      productStatus: "notonshelf",
      uploadCert,
      uploadCertDescription:uploadCertDescription,
      shelfTime,
      isFreePost,
      freightPrice,     
      freightTemplates,
      params: paramsInfo,
      uid: user.uid,
      threadInfo: options,
      vipDiscount,
      vipDisGroup,
      productSettings
    });

    // 存储多规格
    let paraIdArr = [];
    for(const p of productParams) {
      if(p.originPrice < 0) p.originPrice = 0;
      p.productId = productId;
      p.uid = user.uid;
      p.stocksSurplus = p.stocksTotal;
      p._id = await db.SettingModel.operateSystemID('shopProductsParams', 1);
      paraIdArr.push(p._id);
      const d = db.ShopProductsParamModel(p);
      await d.save();
    }
    // 存储独立规格
    let singleParaIdArr = [];
    for(const s of singleParams) {
      if(s.originPrice < 0) s.originPrice = 0;
      if(!s.useDiscount) s.price = s.originPrice;
      s.productId = productId;
      s.uid = user.uid;
      s.type = "single";
      s.stocksSurplus = s.stocksTotal;
      s._id = await db.SettingModel.operateSystemID("shopProductsParams", 1);
      singleParaIdArr.push(s._id);
      const sd = db.ShopProductsParamModel(s);
      await sd.save();
    }
    product.singleParaIdArr = singleParaIdArr;
    product.paraIdArr = paraIdArr;
    await product.save();

    // 立即上架
    if(productStatus === "insale") {
      await product.onshelf();
    }

    data.product = product;
    await next();
    */
	});
module.exports = shelfRouter;