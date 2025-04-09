import {ApplicationError} from "./exception";

describe("ApplicationError", () => {
    it("should return message only", () => {
        const error = new ApplicationError("Unexpected error");
        expect(error.toString()).toEqual("Unexpected error");
    });

    it("should return message with args", () => {
        const error = new ApplicationError("Authentication failed", ["username", "password"]);
        expect(error.toString()).toEqual("Authentication failed: username, password");
    });

    it("should return message with kwargs", () => {
        const error = new ApplicationError("Permission denied", null, {user: "admin", role: "guest"});
        expect(error.toString()).toEqual("Permission denied: user=admin, role=guest");
    });

    it("should return message with args and kwargs", () => {
        const error = new ApplicationError("Something went wrong", [42, "test"], {
            code: 500,
            reason: "Internal Server error"
        });
        expect(error.toString()).toEqual("Something went wrong: 42, test: code=500, reason=Internal Server error");
    });

    it("should return message with empty args and kwargs", () => {
        const error = new ApplicationError("Some error", [], {});
        expect(error.toString()).toEqual("Some error");
    });
});
