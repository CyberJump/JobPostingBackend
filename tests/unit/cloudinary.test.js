import { extractPublicId } from "../../src/utils/cloudinary.js";

describe("Cloudinary Utility - extractPublicId", () => {
    it("should return public ID from simple Cloudinary image URL", () => {
        const url = "https://res.cloudinary.com/demo/image/upload/v1570979139/sample_image.jpg";
        expect(extractPublicId(url)).toBe("sample_image");
    });

    it("should return folder path and public ID from raw document URL in resumes folder", () => {
        const url = "https://res.cloudinary.com/demo/raw/upload/v1570979139/resumes/my_resume.pdf";
        expect(extractPublicId(url)).toBe("resumes/my_resume");
    });

    it("should return folder path and public ID from document URL in company documents folder", () => {
        const url = "https://res.cloudinary.com/demo/raw/upload/v1570979139/documents/company123/file.pdf";
        expect(extractPublicId(url)).toBe("documents/company123/file");
    });

    it("should return deeply nested folder path and public ID", () => {
        const url = "https://res.cloudinary.com/demo/image/upload/v12345/nested/folder/path/file.png";
        expect(extractPublicId(url)).toBe("nested/folder/path/file");
    });

    it("should return public ID from URL without version prefix", () => {
        const url = "https://res.cloudinary.com/demo/image/upload/resumes/my_resume.pdf";
        expect(extractPublicId(url)).toBe("resumes/my_resume");
    });

    it("should return the original string if it is already a public ID", () => {
        expect(extractPublicId("resumes/my_custom_public_id")).toBe("resumes/my_custom_public_id");
    });

    it("should return null if urlOrPublicId is missing or non-string", () => {
        expect(extractPublicId(null)).toBeNull();
        expect(extractPublicId(undefined)).toBeNull();
        expect(extractPublicId(12345)).toBeNull();
    });
});
