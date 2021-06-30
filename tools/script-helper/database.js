const { MongoClient, Db, FilterQuery, UpdateQuery } = require("mongodb");
const uri = require("mongodb-uri");
const onExit = require("signal-exit");
const config = require("../../config/mongodb.json");

const {
  username,
  password,
  database,
  address,
  port
} = config;

const account = username && password ? `${username}:${password}@` : "";
const client = new MongoClient(encodeMongoURI(`mongodb://${account}${address}:${port}/${database}`), { useUnifiedTopology: true });

onExit(() => {
  client.close();
});

/**
 * mongodb uri 格式化
 * @param {string} url
 * @returns string
 */
function encodeMongoURI(url) {
  let parsedURL = uri.parse(url)
  return uri.format(parsedURL);
}

/**
 * 
 * @returns {Promise<Db}
 */
async function useDB() {
  if(!client.isConnected()) {
    await client.connect();
  }
  return client.db(database);
}

/**
 * 简单查询
 * @param {string} collection 表名
 * @param {FilterQuery<any>} query 查询语句
 * @returns {any[]}
 */
async function sampleFind(collection, query) {
  const db = await useDB();
  return await db.collection(collection).find(query).toArray();
}

/**
 * 简单更新
 * @param {string} collection 表名
 * @param {FilterQuery<any>} query 查询语句
 * @param {UpdateQuery<any>} doc 更新语句
 * @param {boolean} many 是否更新多条
 * @returns {Promise<void>}
 */
async function sampleUpdate(collection, query, doc, many) {
  const db = await useDB();
  if(many) {
    return await db.collection(collection).updateMany(query, doc);
  } else {
    return await db.collection(collection).updateOne(query, doc);
  }
}

/**
 * 聚合查询
 * @param {string} collection 表名
 * @param {object[]} pipeline 查询语句管线
 * @returns {any[]}
 */
async function aggregate(collection, pipeline) {
  const db = await useDB();
  const cursor = db.collection(collection).aggregate(pipeline);
  return await cursor.toArray();
}

module.exports = {
  useDB,
  sampleFind,
  sampleUpdate,
  aggregate
}