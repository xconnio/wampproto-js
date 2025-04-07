import {WAMPCRAAuthenticator, generateWAMPCRAChallenge, signWAMPCRAChallenge, verifyWAMPCRASignature} from './wampcra';
import {Challenge, ChallengeFields} from '../messages/challenge';
import {createHmac} from 'crypto';

const testAuthID = "authid";
const testSecret = "secret";
const testProvider = "provider";
const testAuthRole = "authrole";
const testSessionID = 12345;
const testCRAChallenge = JSON.stringify({
    authid: testAuthID,
    authmethod: "wampcra",
    authprovider: testProvider,
    authrole: testAuthRole,
    nonce: "VJ/iO7bpl5rCiRGJ7IGuQg==",
    session: testSessionID,
    timestamp: "2024-07-09T14:32:29+0500"
});

describe("WAMPCRA Authenticator", () => {
    const authenticator = new WAMPCRAAuthenticator(testAuthID, testSecret, null);

    it("constructor", () => {
        expect(authenticator.authID).toEqual(testAuthID);
        expect(authenticator.authMethod).toEqual(WAMPCRAAuthenticator.TYPE);
        expect(authenticator.authExtra).toEqual(null);
    });

    it("authenticate", () => {
        const challengeData = {challenge: testCRAChallenge};
        const challenge = new Challenge(new ChallengeFields(WAMPCRAAuthenticator.TYPE, challengeData));

        const authenticate = authenticator.authenticate(challenge);
        const signed = signWAMPCRAChallenge(testCRAChallenge, Buffer.from(testSecret, 'utf-8'));

        expect(authenticate.signature).toEqual(signed);
    });

    it("should throw if challenge string missing", () => {
        const challengeData = {salt: "somesalt", iterations: 1000, keylen: 256};
        const challenge = new Challenge(new ChallengeFields("wampcra", challengeData));

        expect(() => authenticator.authenticate(challenge)).toThrow("Challenge string missing in extra");
    });

    it("should throw if iterations missing", () => {
        const challengeData = {challenge: testCRAChallenge, salt: "somesalt", keylen: 256};
        const challenge = new Challenge(new ChallengeFields("wampcra", challengeData));

        expect(() => authenticator.authenticate(challenge)).toThrow("Iterations missing in extra");
    });

    it("should throw if keylen missing", () => {
        const challengeData = {challenge: testCRAChallenge, salt: "somesalt", iterations: 1000};
        const challenge = new Challenge(new ChallengeFields("wampcra", challengeData));

        expect(() => authenticator.authenticate(challenge)).toThrow("Key length missing in extra");
    });
});

describe("WAMPCRA utilities", () => {
    it("signCRAChallenge", () => {
        const signed = signWAMPCRAChallenge(testCRAChallenge, Buffer.from(testSecret, 'utf-8'));
        const hmac = createHmac('sha256', Buffer.from(testSecret, 'utf-8'));
        hmac.update(testCRAChallenge);
        const expectedSig = hmac.digest('base64');

        expect(signed).toEqual(expectedSig);
    });

    it("verifyWAMPCRASignature", () => {
        const key = Buffer.from(testSecret, 'utf-8');
        const signature = signWAMPCRAChallenge(testCRAChallenge, key);

        const valid = verifyWAMPCRASignature(signature, testCRAChallenge, key);
        expect(valid).toEqual(true);
    });

    it("generateWAMPCRAChallenge", () => {
        const challenge = generateWAMPCRAChallenge(testSessionID, testAuthID, testAuthRole, testProvider);
        const parsedChallenge = JSON.parse(challenge);

        expect(parsedChallenge.session).toEqual(testSessionID);
        expect(parsedChallenge.authid).toEqual(testAuthID);
        expect(parsedChallenge.authrole).toEqual(testAuthRole);
        expect(parsedChallenge.authprovider).toEqual(testProvider);
        expect(parsedChallenge.authmethod).toEqual(WAMPCRAAuthenticator.TYPE);
        expect(parsedChallenge.nonce).toBeDefined();
        expect(parsedChallenge.timestamp).toBeDefined();
    });
});
