export class AuthPolicy {
    static isValidPassword(password) {
        if (!password || typeof password !== "string") return false;
        return password.length >= 6;
    }

    static isAccountActive(user) {
        if (!user) return false;
        return user.status !== "BLOCKED";
    }

    static canAccessAdmin(user) {
        if (!user) return false;
        return user.role === "ADMIN";
    }
}

export default AuthPolicy;
