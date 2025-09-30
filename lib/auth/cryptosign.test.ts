import {
    CryptoSignAuthenticator,
    generateCryptoSignChallenge,
    hexToUint8Array,
    signCryptoSignChallenge,
    verifyCryptoSignSignature
} from "./cryptosign";
import {Challenge, ChallengeFields} from "../messages/challenge";
import {Authenticate} from "../messages/authenticate";

describe("CryptoSign Authenticator", (): void => {
    const privateKeyHex: string = "c7e8c1f8f16ec37f53ed153f8afb7f18469b051f1d24dbea2097a2a104b2e9db";
    const publicKeyHex: string = "c53e4f2756a52ca1ed5cd00da108b3ed7bcffe6294e78283521e5102824f52d3";

    const challenge: string = "a1d483092ec08960fedbaed2bc1d411568a59077b794210e251bd3abb1563f7c";
    const signature: string = "01d4b7a515b1023196e2bbb57c5202da72088f99a17eaeed62ba97ebf93381b92a3e8430154667e194d971fb" +
        "41b090a9338b92021c39271e910a8ea072fe950c";

    const authid: string = "authid";
    const authExtra: { [key: string]: any } = {"extra": true};
    const authenticator = new CryptoSignAuthenticator(authid, privateKeyHex, authExtra);

    it("constructor", (): void => {
        expect(authenticator.authID).toEqual(authid);
        expect(authenticator.authMethod).toEqual(CryptoSignAuthenticator.TYPE);
        expect(authenticator.authExtra).toEqual(authExtra)
    });

    it("authenticate", async (): Promise<void> => {
        const authenticate: Authenticate = await authenticator.authenticate(new Challenge(new ChallengeFields(CryptoSignAuthenticator.TYPE, {"challenge": challenge})));
        expect(authenticate.signature).toEqual(signature + challenge);
    });

    it("generateCryptoSignChallenge", (): void => {
        const challenge: string = generateCryptoSignChallenge()
        expect(challenge.length).toEqual(64)
    });

    it("signCryptoSignChallenge", (): void => {
        const signed: string = signCryptoSignChallenge(challenge, privateKeyHex)
        expect(signed).toEqual(signature + challenge)
    });

    it("verifyCryptoSignSignature", (): void => {
        const isValid: boolean = verifyCryptoSignSignature(signature + challenge, hexToUint8Array(publicKeyHex))
        expect(isValid).toBeTruthy()
    });
});
