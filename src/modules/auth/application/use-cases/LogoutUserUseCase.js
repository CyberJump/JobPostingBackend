export class LogoutUserUseCase {
    constructor(identityRepository) {
        this.identityRepository = identityRepository;
    }

    async execute(userId) {
        await this.identityRepository.updateRefreshToken(userId, undefined);
        return { success: true };
    }
}

export default LogoutUserUseCase;
