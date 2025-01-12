// Remove id fields on returned objects
import { MongoMemoryServer } from "mongodb-memory-server";
import { Db } from "../../src";
import mongoose from "mongoose";
import { deleteAllDb } from "./deleteAll";
import * as Util from "../../src/utils/util";

interface ObjectWithId {
  _id: any;
  __v: any;
}

type ObjectOrArray<T> = T | T[];

export const omitId = <T extends Record<string, any>>(
  obj: ObjectOrArray<T>,
): ObjectOrArray<Omit<T, "_id" | "__v">> => {
  if (Array.isArray(obj)) {
    // Recursively apply omitId to each item in the array
    return obj.map((item) => omitId(item)) as ObjectOrArray<
      Omit<T, "_id" | "__v">
    >;
  } else if (obj && typeof obj === "object") {
    // Omit _id and __v fields if obj is an object
    const { _id, __v, ...rest } = obj;
    return rest as Omit<T, "_id" | "__v">;
  }
  return obj;
};

interface ObjectWithUpdated {
  updated: number;
}

export const omitUpdated = <T extends ObjectWithUpdated>(
  obj: ObjectOrArray<T>,
): ObjectOrArray<Omit<T, "updated">> => {
  if (Array.isArray(obj)) {
    // Recursively apply omitUpdated to each item in the array
    return obj.map((item) => omitUpdated(item)) as ObjectOrArray<
      Omit<T, "updated">
    >;
  } else if (obj && typeof obj === "object") {
    // Omit "updated" field if obj is an object
    const { updated, ...rest } = obj;
    return rest;
  }
  return obj;
};

export const omitFields = <T extends Record<string, any>>(
  obj: ObjectOrArray<T>,
  fieldsToOmit: string | string[],
): ObjectOrArray<Omit<T, keyof { _id: any; __v: any } | "updated">> => {
  if (Array.isArray(obj)) {
    // Recursively apply omitFields to each item in the array
    return obj.map((item) => omitFields(item, fieldsToOmit)) as ObjectOrArray<
      Omit<T, keyof { _id: any; __v: any } | "updated">
    >;
  } else if (obj && typeof obj === "object") {
    // Omit specified fields if obj is an object
    const filteredObj: any = {};
    const omitFieldsArray = Array.isArray(fieldsToOmit)
      ? fieldsToOmit
      : [fieldsToOmit];
    for (const key in obj) {
      if (!omitFieldsArray.includes(key)) {
        filteredObj[key] = obj[key];
      }
    }
    return filteredObj;
  }
  return obj;
};
export const sortByKey = (obj: any[], key: string) => {
  if (Array.isArray(obj)) {
    // Sort the array of objects by the specified key
    return obj.sort((a, b) => {
      if (a[key] < b[key]) {
        return -1;
      }
      if (a[key] > b[key]) {
        return 1;
      }
      return 0;
    });
  }
  return obj;
};

export const createTestServer = async (oldMongoServer?: MongoMemoryServer) => {
  try {
    await Util.sleep(500);
    if (oldMongoServer) {
      await oldMongoServer.stop();
      await Util.sleep(300);
    }

    const mongoServer = await MongoMemoryServer.create();
    const dbName = `t${Math.random().toString().replace(".", "")}`;
    console.log("dbName", dbName);
    const mongoUri = mongoServer.getUri(dbName);
    console.log("mongoUri", mongoUri);
    await Db.create(mongoUri);
    return mongoServer;
  } catch (error) {
    console.error("Error creating test server:", error);
    throw error;
  }
};

export const initTestServerBeforeAll = () => {
  let mongoServer: MongoMemoryServer;
  beforeAll(async () => {
    try {
      // await sleep(300);
      mongoServer = await createTestServer(mongoServer);
    } catch (error) {
      console.error("Error initializing test server before all tests:", error);
      throw error;
    }
  });
  afterEach(async () => {
    try {
      // await sleep(300);
      await deleteAllDb();
    } catch (error) {
      console.error("Error stopping test server after all tests:", error);
      // throw error;
    }
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });
};
