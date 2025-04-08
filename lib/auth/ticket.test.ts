import { TicketAuthenticator } from "./ticket";
import { Challenge, ChallengeFields } from "../messages/challenge";

describe("Ticket Authenticator", () => {
    const testAuthID = "foo";
    const ticket = "ticket";

    const authenticator = new TicketAuthenticator(testAuthID, null, ticket);

    it("constructor", () => {
        expect(authenticator.authID).toEqual(testAuthID);
        expect(authenticator.authMethod).toEqual(TicketAuthenticator.TYPE);
        expect(authenticator.authExtra).toBeNull();
    });

    it("authenticate", () => {
        const challenge = new Challenge(new ChallengeFields("ticket", null));
        const authenticate = authenticator.authenticate(challenge);
        expect(authenticate.signature).toEqual(ticket);
    });
});
