import {AnonymousAuthenticator} from "./anonymous";
import {Challenge, ChallengeFields} from "../messages/challenge";

describe("Anonymous Authenticator", () => {
    const testAuthID = "foo";

    const authenticator = new AnonymousAuthenticator(testAuthID, null);

    it("constructor", () => {
        expect(authenticator.authID).toEqual(testAuthID);
        expect(authenticator.authMethod).toEqual("anonymous");
        expect(authenticator.authExtra).toEqual({}); // AuthExtra should be an empty map
    });

    it("authenticate", async () => {
        const challenge = new Challenge(new ChallengeFields("anonymous", null));
        await expect(authenticator.authenticate(challenge)).rejects.toThrow(
            "authenticate() must not be called for anonymous authentication"
        );
    });
});
