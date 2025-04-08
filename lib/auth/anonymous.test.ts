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

    it("authenticate", () => {
        const challenge = new Challenge(new ChallengeFields("anonymous", null));
        expect(() => authenticator.authenticate(challenge)).toThrow(
            "authenticate() must not be called for anonymous authentication"
        );
    });
});
