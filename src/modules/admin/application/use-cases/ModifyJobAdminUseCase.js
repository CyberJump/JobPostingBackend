import { AppError } from "../../../../shared/errors/AppError.js";

export class ModifyJobAdminUseCase {
    constructor(moderationRepository) {
        this.moderationRepository = moderationRepository;
    }

    async execute(jobId, updateData) {
        if (!jobId) {
            throw new AppError(400, "Invalid job ID");
        }

        const { title, description, requirements, location, salary, jobType, status, applicationDeadline } = updateData;

        const updateFields = {};
        if (title) updateFields.title = title;
        if (description) updateFields.description = description;
        if (requirements) updateFields.requirements = requirements;
        if (location) updateFields.location = location;
        if (salary) updateFields.salary = salary;
        if (jobType) {
            if (!["FULLTIME", "INTERNSHIP"].includes(jobType)) {
                throw new AppError(400, "Invalid job type");
            }
            updateFields.jobType = jobType;
        }
        if (status) {
            if (!["ACTIVE", "INACTIVE"].includes(status)) {
                throw new AppError(400, "Invalid status");
            }
            updateFields.status = status;
        }
        if (applicationDeadline) updateFields.applicationDeadline = applicationDeadline;

        const updatedJob = await this.moderationRepository.updateJob(jobId, updateFields);
        if (!updatedJob) {
            throw new AppError(404, "Job not found");
        }

        return updatedJob;
    }
}

export default ModifyJobAdminUseCase;
