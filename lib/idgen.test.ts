import {generateSessionID, SessionScopeIDGenerator} from "./idgen";

const ID_MAX = Math.pow(2, 32);
const MAX_SCOPE = Math.pow(2, 53);

describe("Session ID Generation", () => {
    test("generateSessionID should return a number within the valid range", () => {
        const sessionID = generateSessionID();
        expect(sessionID).toBeGreaterThan(0);
        expect(sessionID).toBeLessThan(ID_MAX);
    });

    test("SessionScopeIDGenerator should increment IDs correctly", () => {
        const generator = new SessionScopeIDGenerator();

        const firstID = generator.next();
        const secondID = generator.next();
        const thirdID = generator.next();

        expect(secondID).toEqual(firstID + 1);
        expect(thirdID).toEqual(secondID + 1);
    });

    test("SessionScopeIDGenerator should reset after reaching MAX_SCOPE", () => {
        const generator = new SessionScopeIDGenerator();

        // Force private `id` for test purposes
        // @ts-expect-error: Accessing private member for test
        generator.id = MAX_SCOPE - 1;

        const idAtMax = generator.next();
        const idAfterReset = generator.next();

        expect(idAtMax).toEqual(MAX_SCOPE);
        expect(idAfterReset).toEqual(1);
    });
});
