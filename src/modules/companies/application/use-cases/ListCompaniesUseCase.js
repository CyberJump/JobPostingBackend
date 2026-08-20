export class ListCompaniesUseCase {
    constructor(companyRepository) {
        this.companyRepository = companyRepository;
    }

    async execute(queryOptions, user) {
        return await this.companyRepository.findAll({
            page: queryOptions.page || 1,
            limit: queryOptions.limit || 10,
            status: queryOptions.status,
            search: queryOptions.search,
            myCompanies: queryOptions.myCompanies,
            userRole: user?.role,
            userId: user?._id,
        });
    }
}

export default ListCompaniesUseCase;
