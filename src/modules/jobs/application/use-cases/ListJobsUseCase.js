import { AppError } from "../../../../shared/errors/AppError.js";

export class ListJobsUseCase {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }

    async execute(queryOptions, user) {
        if (queryOptions.status && !["ACTIVE", "INACTIVE"].includes(queryOptions.status)) {
            throw new AppError(400, "Status must be either ACTIVE or INACTIVE");
        }
        if (queryOptions.jobType && !["FULLTIME", "INTERNSHIP"].includes(queryOptions.jobType)) {
            throw new AppError(400, "Job type must be either FULLTIME or INTERNSHIP");
        }

        return await this.jobRepository.findAll({
            page: queryOptions.page || 1,
            limit: queryOptions.limit || 10,
            status: queryOptions.status,
            sortBy: queryOptions.sortBy,
            jobType: queryOptions.jobType,
            search: queryOptions.search,
            includeExpired: queryOptions.includeExpired,
            userRole: user?.role,
            userId: user?._id,
        });
    }
}

export default ListJobsUseCase;
