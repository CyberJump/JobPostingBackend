import { jest } from "@jest/globals";
import CreateCompanyUseCase from "../../src/modules/companies/application/use-cases/CreateCompanyUseCase.js";
import GetCompanyUseCase from "../../src/modules/companies/application/use-cases/GetCompanyUseCase.js";
import UpdateCompanyUseCase from "../../src/modules/companies/application/use-cases/UpdateCompanyUseCase.js";
import DeleteCompanyUseCase from "../../src/modules/companies/application/use-cases/DeleteCompanyUseCase.js";
import CompanyPolicy from "../../src/modules/companies/domain/policies/CompanyPolicy.js";

describe("Companies Domain Module Use Cases & Policies", () => {
    let mockCompanyRepo;

    beforeEach(() => {
        mockCompanyRepo = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAll: jest.fn(),
            findMyCompanies: jest.fn(),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("CompanyPolicy should check founder membership and sanitize update fields", () => {
        const company = {
            _id: "comp123",
            founders: [{ userId: { _id: "user123" } }],
        };

        expect(CompanyPolicy.isFounder(company, "user123")).toBe(true);
        expect(CompanyPolicy.isFounder(company, "user456")).toBe(false);

        expect(CompanyPolicy.canModifyCompany({ _id: "admin1", role: "ADMIN" }, company)).toBe(true);
        expect(CompanyPolicy.canModifyCompany({ _id: "user123", role: "COMPANY" }, company)).toBe(true);
        expect(CompanyPolicy.canModifyCompany({ _id: "user456", role: "COMPANY" }, company)).toBe(false);

        const sanitized = CompanyPolicy.sanitizeUpdateFields({
            name: "New Corp",
            status: "ACTIVE",
            approvedBy: "hacked",
        });

        expect(sanitized.name).toBe("New Corp");
        expect(sanitized.status).toBeUndefined();
        expect(sanitized.approvedBy).toBeUndefined();
    });

    it("CreateCompanyUseCase should create a new company with founder ID", async () => {
        mockCompanyRepo.findByEmail.mockResolvedValue(null);
        mockCompanyRepo.create.mockResolvedValue({ _id: "comp123", name: "Acme Corp" });

        const useCase = new CreateCompanyUseCase(mockCompanyRepo);
        const result = await useCase.execute("user123", {
            name: "Acme Corp",
            email: "contact@acme.com",
            description: "Leading technology corporation",
        });

        expect(result._id).toBe("comp123");
        expect(mockCompanyRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "Acme Corp",
                email: "contact@acme.com",
                founders: [{ userId: "user123" }],
            })
        );
    });

    it("GetCompanyUseCase should return company details", async () => {
        mockCompanyRepo.findById.mockResolvedValue({ _id: "comp123", name: "Acme Corp", status: "ACTIVE" });

        const useCase = new GetCompanyUseCase(mockCompanyRepo);
        const result = await useCase.execute("comp123");

        expect(result.name).toBe("Acme Corp");
        expect(mockCompanyRepo.findById).toHaveBeenCalledWith("comp123");
    });

    it("UpdateCompanyUseCase should update company details when authorized", async () => {
        const company = { _id: "comp123", name: "Old Name", founders: [{ userId: "user123" }] };
        mockCompanyRepo.findById.mockResolvedValue(company);
        mockCompanyRepo.update.mockResolvedValue({ _id: "comp123", name: "Updated Name" });

        const useCase = new UpdateCompanyUseCase(mockCompanyRepo);
        const result = await useCase.execute(
            { _id: "user123", role: "COMPANY" },
            "comp123",
            { name: "Updated Name" },
            null
        );

        expect(result.name).toBe("Updated Name");
        expect(mockCompanyRepo.update).toHaveBeenCalledWith("comp123", { name: "Updated Name" });
    });

    it("DeleteCompanyUseCase should delete company when authorized", async () => {
        const company = { _id: "comp123", founders: [{ userId: "user123" }] };
        mockCompanyRepo.findById.mockResolvedValue(company);
        mockCompanyRepo.delete.mockResolvedValue({ _id: "comp123" });

        const useCase = new DeleteCompanyUseCase(mockCompanyRepo);
        const result = await useCase.execute({ _id: "user123", role: "COMPANY" }, "comp123");

        expect(result.success).toBe(true);
        expect(mockCompanyRepo.delete).toHaveBeenCalledWith("comp123");
    });
});
