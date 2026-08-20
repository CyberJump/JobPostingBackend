import { asynchandler } from "../../../../utils/asynchandler.js";
import { ApiResponse } from "../../../../utils/ApiResponse.js";

import MongoCompanyRepository from "../../infrastructure/repositories/MongoCompanyRepository.js";
import CreateCompanyUseCase from "../../application/use-cases/CreateCompanyUseCase.js";
import GetCompanyUseCase from "../../application/use-cases/GetCompanyUseCase.js";
import UpdateCompanyUseCase from "../../application/use-cases/UpdateCompanyUseCase.js";
import DeleteCompanyUseCase from "../../application/use-cases/DeleteCompanyUseCase.js";
import ListCompaniesUseCase from "../../application/use-cases/ListCompaniesUseCase.js";
import ListMyCompaniesUseCase from "../../application/use-cases/ListMyCompaniesUseCase.js";

const companyRepo = new MongoCompanyRepository();

const createCompanyUseCase = new CreateCompanyUseCase(companyRepo);
const getCompanyUseCase = new GetCompanyUseCase(companyRepo);
const updateCompanyUseCase = new UpdateCompanyUseCase(companyRepo);
const deleteCompanyUseCase = new DeleteCompanyUseCase(companyRepo);
const listCompaniesUseCase = new ListCompaniesUseCase(companyRepo);
const listMyCompaniesUseCase = new ListMyCompaniesUseCase(companyRepo);

export const RegisterCompany = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { name, email, description, website, Logo } = req.body;

    const company = await createCompanyUseCase.execute(userId, { name, email, description, website, Logo });

    return res.status(201).json(
        new ApiResponse(201, company, "Company registered successfully")
    );
});

export const UpdateCompanyDetails = asynchandler(async (req, res) => {
    const { companyId } = req.params;
    const { name, email, description, website, Logo } = req.body;
    const logoFilePath = req.file?.path;

    const updatedCompany = await updateCompanyUseCase.execute(
        req.user,
        companyId,
        { name, email, description, website, Logo },
        logoFilePath
    );

    return res.status(200).json(
        new ApiResponse(200, updatedCompany, "Company details updated successfully")
    );
});

export const WithdrawCompany = asynchandler(async (req, res) => {
    const { companyId } = req.params;
    await deleteCompanyUseCase.execute(req.user, companyId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Company withdrawn successfully")
    );
});

export const GetCompanyDetails = asynchandler(async (req, res) => {
    const { companyId } = req.params;
    const company = await getCompanyUseCase.execute(companyId);

    return res.status(200).json(
        new ApiResponse(200, company, "Company details fetched successfully")
    );
});

export const GetAllCompanies = asynchandler(async (req, res) => {
    const { page, limit, status, search, myCompanies } = req.query;

    const companies = await listCompaniesUseCase.execute(
        { page, limit, status, search, myCompanies },
        req.user
    );

    return res.status(200).json(
        new ApiResponse(200, companies, "Companies fetched successfully")
    );
});

export const GetMyCompanies = asynchandler(async (req, res) => {
    const userId = req.user?._id;
    const { page, limit } = req.query;

    const companies = await listMyCompaniesUseCase.execute(userId, { page, limit });

    return res.status(200).json(
        new ApiResponse(200, companies, "Your companies fetched successfully")
    );
});
