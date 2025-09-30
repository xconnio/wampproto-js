import {WAMPCRAAuthenticator, generateWAMPCRAChallenge, signWAMPCRAChallenge, verifyWAMPCRASignature, generateHMAC} from './wampcra';
import {Challenge, ChallengeFields} from '../messages/challenge';

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

    it("authenticate", async () => {
        const challengeData = {challenge: testCRAChallenge};
        const challenge = new Challenge(new ChallengeFields(WAMPCRAAuthenticator.TYPE, challengeData));

        const authenticate = await authenticator.authenticate(challenge);
        const signed = await signWAMPCRAChallenge(testCRAChallenge, Buffer.from(testSecret, 'utf-8'));

        expect(authenticate.signature).toEqual(signed);
    });

    it("should throw if challenge string missing", async () => {
        const challengeData = {salt: "somesalt", iterations: 1000, keylen: 256};
        const challenge = new Challenge(new ChallengeFields("wampcra", challengeData));

        await expect(authenticator.authenticate(challenge)).rejects.toThrow("Challenge string missing in extra");
    });

    it("should throw if iterations missing", async () => {
        const challengeData = {challenge: testCRAChallenge, salt: "somesalt", keylen: 256};
        const challenge = new Challenge(new ChallengeFields("wampcra", challengeData));

        await expect(authenticator.authenticate(challenge)).rejects.toThrow("Iterations missing in extra");
    });

    it("should throw if keylen missing", async () => {
        const challengeData = {challenge: testCRAChallenge, salt: "somesalt", iterations: 1000};
        const challenge = new Challenge(new ChallengeFields("wampcra", challengeData));

        await expect(authenticator.authenticate(challenge)).rejects.toThrow("Key length missing in extra");
    });
});

describe("WAMPCRA utilities", () => {
    it("signCRAChallenge", async () => {
        const key = new TextEncoder().encode(testSecret);
        const signed = await signWAMPCRAChallenge(testCRAChallenge, key);

        const expectedSig = await generateHMAC(key, new TextEncoder().encode(testCRAChallenge));

        expect(signed).toEqual(expectedSig);
    });

    it("verifyWAMPCRASignature", async () => {
        const key = Buffer.from(testSecret, 'utf-8');
        const signature = await signWAMPCRAChallenge(testCRAChallenge, key);

        const valid = await verifyWAMPCRASignature(signature, testCRAChallenge, key);
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
