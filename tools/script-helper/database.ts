import { MongoClient, Db, FilterQuery, UpdateQuery } from "mongodb";
import uri from "mongodb-uri";
import onExit from "signal-exit";
import config from "../../config/mongodb.json";

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

function encodeMongoURI (url: string) {
  let parsedURL = uri.parse(url)
  return uri.format(parsedURL);
}

export async function useDB(): Promise<Db> {
  if(!client.isConnected()) {
    await client.connect();
  }
  return client.db(database);
}

export async function sampleFind<T = any>(collection: string, query: FilterQuery<any>): Promise<T[]> {
  const db = await useDB();
  return await db.collection(collection).find(query).toArray();
}

export async function sampleUpdate(collection: string, query: FilterQuery<any>, doc: UpdateQuery<any>, many?: boolean) {
  const db = await useDB();
  if(many) {
    return await db.collection(collection).updateMany(query, doc);
  } else {
    return await db.collection(collection).updateOne(query, doc);
  }
}