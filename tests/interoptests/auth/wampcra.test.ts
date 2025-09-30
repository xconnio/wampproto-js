import * as wampCRAAuth from "../../../lib/auth/wampcra";
import {runCommand} from "../helpers";
import {Challenge, ChallengeFields} from "../../../lib/messages/challenge";
import {WAMPCRAAuthenticator} from "../../../lib/auth/wampcra";

describe("WAMP CRA Tests", function () {
    const SESSION_ID = 123;
    const AUTH_ID = "foo";
    const AUTH_ROLE = "admin";
    const PROVIDER = "provider";
    const TEST_SECRET = "secret";
    const SALT = "salt";
    const KEY_LENGTH = 32;
    const ITERATIONS = 1000;
    const CRA_CHALLENGE =
        '{"nonce":"cdcb3b12d56e12825be99f38f55ba43f","authprovider":"provider",' +
        '"authid":"foo","authrole":"admin","authmethod":"wampcra","session":123,"timestamp":"2024-05-07T09:25:13.307Z"}';

    const AUTH_EXTRA = {
        challenge: CRA_CHALLENGE,
        salt: SALT,
        iterations: ITERATIONS,
        keylen: KEY_LENGTH,
    };

    it('Generate challenge', async function () {
        const challenge: string = wampCRAAuth.generateWAMPCRAChallenge(SESSION_ID, AUTH_ID, AUTH_ROLE, PROVIDER);

        const signature: string = await runCommand(
            `wampproto auth cra sign-challenge ${challenge} ${TEST_SECRET}`
        );

        await runCommand(
            `wampproto auth cra verify-signature ${challenge} ${signature.trim()} ${TEST_SECRET}`
        );
    });

    it('Sign CRA Challenge', async function () {
        const challenge: string = await runCommand(
            `wampproto auth cra generate-challenge ${SESSION_ID} ${AUTH_ID} ${AUTH_ROLE} ${PROVIDER}`
        );

        const signature: string = wampCRAAuth.signWAMPCRAChallenge(challenge.trim(), Buffer.from(TEST_SECRET));

        await runCommand(
            `wampproto auth cra verify-signature '${challenge.trim()}' ${signature.trim()} ${TEST_SECRET}`
        );
    });

    it('Verify CRA Signature', async function () {
        const challenge: string = await runCommand(
            `wampproto auth cra generate-challenge ${SESSION_ID} ${AUTH_ID} ${AUTH_ROLE} ${PROVIDER}`
        );

        const signature: string = await runCommand(
            `wampproto auth cra sign-challenge '${challenge.trim()}' ${TEST_SECRET}`
        );

        const isVerified: boolean = wampCRAAuth.verifyWAMPCRASignature(
            signature.trim(),
            challenge.trim(),
            Buffer.from(TEST_SECRET)
        );

        expect(isVerified).toBeTruthy();
    });

    it('Sign WAMPCRA Signature With Salt', async function () {
        const challenge = new Challenge(new ChallengeFields(WAMPCRAAuthenticator.TYPE, AUTH_EXTRA));
        const authenticator = new WAMPCRAAuthenticator(AUTH_ID, TEST_SECRET, AUTH_EXTRA);
        const authenticate = await authenticator.authenticate(challenge);

        const saltSecret = await runCommand(
            `wampproto auth cra derive-key ${SALT} ${TEST_SECRET} -i ${ITERATIONS} -l ${KEY_LENGTH}`
        );

        await runCommand(
            `wampproto auth cra verify-signature '${CRA_CHALLENGE}' ${authenticate.signature} ${saltSecret.trim()}`
        );
    });

    it('Verify WAMPCRA Signature With Salt', async function () {
        const challenge: string = await runCommand(
            `wampproto auth cra generate-challenge ${SESSION_ID} ${AUTH_ID} ${AUTH_ROLE} ${PROVIDER}`
        );

        const saltSecret = await runCommand(
            `wampproto auth cra derive-key ${SALT} ${TEST_SECRET} -i ${ITERATIONS} -l ${KEY_LENGTH}`
        );

        const signature = await runCommand(
            `wampproto auth cra sign-challenge '${challenge.trim()}' ${saltSecret.trim()}`
        );

        const isVerified: boolean = wampCRAAuth.verifyWAMPCRASignature(
            signature.trim(),
            challenge.trim(),
            Buffer.from(saltSecret.trim())
        );

        expect(isVerified).toBeTruthy();
    });
});
