import { setJson } from "./redis";

export interface CacheUpdate<T = any> {
  key: string;
  payload?: T | ((dbResult: any) => Promise<T> | T);
  ttl?: number;
}

export interface WriteThroughOptions {
  rollback?: (dbResult: any) => Promise<void> | void;
}

/**
 * writeThrough: perform a DB write, then update Redis cache keys synchronously.
 * If cache update fails and a rollback is provided, the rollback will be invoked.
 */
export async function writeThrough<T = any>(
  dbWrite: () => Promise<T>,
  cacheUpdates: CacheUpdate[],
  options?: WriteThroughOptions,
) {
  let dbResult: T | null = null;
  dbResult = await dbWrite();

  // Update all caches sequentially. Payload builder may be async.
  for (const upd of cacheUpdates) {
    try {
      let payload: any = undefined;
      if (typeof upd.payload === "function") {
        payload = await (upd.payload as any)(dbResult);
      } else if (upd.payload !== undefined) {
        payload = upd.payload;
      } else {
        // Default: cache the DB result
        payload = dbResult;
      }
      await setJson(upd.key, payload, upd.ttl);
    } catch (err) {
      console.error("Cache set error in writeThrough for key", upd.key, err);
      // If cache set fails, attempt rollback if provided
      if (options && options.rollback && dbResult) {
        try {
          await options.rollback(dbResult);
        } catch (rbErr) {
          console.error("Rollback failed after cache set error:", rbErr);
        }
      }
      throw err;
    }
  }

  return dbResult;
}

export default writeThrough;
