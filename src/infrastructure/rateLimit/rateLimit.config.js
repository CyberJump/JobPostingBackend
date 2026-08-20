export const rateLimitConfig = {
    login: {
        limit: 5,
        windowSeconds: 60,
    },
    register: {
        limit: 5,
        windowSeconds: 60,
    },
    refreshToken: {
        limit: 20,
        windowSeconds: 60,
    },
    otpRequest: {
        limit: 5,
        windowSeconds: 60,
    },
    otpVerify: {
        limit: 10,
        windowSeconds: 60,
    },
    global: {
        limit: 100,
        windowSeconds: 60,
    },
};

export default rateLimitConfig;
