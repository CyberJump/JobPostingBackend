import { jest } from "@jest/globals";
import idempotencyService from "../../src/infrastructure/idempotency/idempotency.service.js";
import redisService from "../../src/infrastructure/redis/redis.service.js";

describe("Idempotency Infrastructure Service", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should reserve idempotency key on first request", async () => {
        jest.spyOn(redisService, "setIfNotExists").mockResolvedValue(true);

        const result = await idempotencyService.reserve("app_submit", "idemp_123");
        expect(result).toEqual({ reserved: true, status: "PROCESSING" });
    });

    it("should return PROCESSING state when identical request arrives concurrently", async () => {
        jest.spyOn(redisService, "setIfNotExists").mockResolvedValue(false);
        jest.spyOn(redisService, "get").mockResolvedValue(JSON.stringify({ status: "PROCESSING" }));

        const result = await idempotencyService.reserve("app_submit", "idemp_123");
        expect(result.reserved).toBe(false);
        expect(result.status).toBe("PROCESSING");
    });

    it("should return COMPLETED state and stored response when duplicate request arrives after completion", async () => {
        const storedResponse = { success: true, applicationId: "app_999" };
        jest.spyOn(redisService, "setIfNotExists").mockResolvedValue(false);
        jest.spyOn(redisService, "get").mockResolvedValue(JSON.stringify({
            status: "COMPLETED",
            response: storedResponse,
        }));

        const result = await idempotencyService.reserve("app_submit", "idemp_123");
        expect(result.reserved).toBe(false);
        expect(result.status).toBe("COMPLETED");
        expect(result.response).toEqual(storedResponse);
    });

    it("should store completed mutation result", async () => {
        const spySet = jest.spyOn(redisService, "set").mockResolvedValue(true);
        const storedResponse = { success: true, applicationId: "app_999" };

        const success = await idempotencyService.storeResult("app_submit", "idemp_123", storedResponse, 86400);
        expect(success).toBe(true);
        expect(spySet).toHaveBeenCalled();
    });

    it("should release reservation on mutation failure", async () => {
        const spyDel = jest.spyOn(redisService, "delete").mockResolvedValue(true);

        const success = await idempotencyService.release("app_submit", "idemp_123");
        expect(success).toBe(true);
        expect(spyDel).toHaveBeenCalledWith("idempotency:app_submit:idemp_123");
    });
});
