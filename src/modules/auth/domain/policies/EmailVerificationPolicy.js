export class EmailVerificationPolicy {
    static isAlreadyVerified(user) {
        if (!user) return false;
        return user.isVerified === true || user.status === "ACTIVE";
    }

    static isValidPurpose(purpose) {
        return purpose === "email_verification" || purpose === "email_verify";
    }

    static canVerifyEmail(user) {
        if (!user) return false;
        return user.status !== "BLOCKED";
    }
}

export default EmailVerificationPolicy;
