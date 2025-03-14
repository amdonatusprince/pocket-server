import { CacheManager, Character, DbCacheAdapter, IDatabaseCacheAdapter } from "@elizaos/core";

export function initializeDbCache(
  character: Character,
  db: IDatabaseCacheAdapter
) {
  if (!character.id) {
    throw new Error('Character ID is required for cache initialization');
  }
  const cache = new CacheManager(new DbCacheAdapter(db, character.id));
  return cache;
}