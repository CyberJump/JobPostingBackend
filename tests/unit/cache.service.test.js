import { jest } from "@jest/globals";
import cacheService from "../../src/infrastructure/cache/cache.service.js";
import redisService from "../../src/infrastructure/redis/redis.service.js";

describe("Cache-Aside Infrastructure Service", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should serialize and store object in cache", async () => {
        const spySet = jest.spyOn(redisService, "set").mockResolvedValue(true);
        const data = { id: "123", title: "Software Engineer" };

        const success = await cacheService.set("cache:job:123", data, 300);
        expect(success).toBe(true);
        expect(spySet).toHaveBeenCalledWith("cache:job:123", JSON.stringify(data), 300);
    });

    it("should deserialize cached JSON string into object on hit", async () => {
        const data = { id: "123", title: "Software Engineer" };
        jest.spyOn(redisService, "get").mockResolvedValue(JSON.stringify(data));

        const cached = await cacheService.get("cache:job:123");
        expect(cached).toEqual(data);
    });

    it("should return null on cache miss", async () => {
        jest.spyOn(redisService, "get").mockResolvedValue(null);

        const cached = await cacheService.get("cache:job:missing");
        expect(cached).toBeNull();
    });

    it("should fail open and return null if cache entry contains invalid JSON", async () => {
        jest.spyOn(redisService, "get").mockResolvedValue("invalid-json{");

        const cached = await cacheService.get("cache:job:corrupted");
        expect(cached).toBeNull();
    });

    it("should delete cache key", async () => {
        const spyDel = jest.spyOn(redisService, "delete").mockResolvedValue(true);

        const result = await cacheService.delete("cache:job:123");
        expect(result).toBe(true);
        expect(spyDel).toHaveBeenCalledWith("cache:job:123");
    });
});
