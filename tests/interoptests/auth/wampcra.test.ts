import * as wampCRAAuth from '../../../lib/auth/wampcra'
import {runCommand} from "../helpers";


describe('WAMP CRA Tests', function () {
    const TEST_SECRET: string = "private";

    it('Generate challenge', async function () {
        const challenge: string = wampCRAAuth.generateWAMPCRAChallenge(1, "foo", "admin", "static");

        const signature: string = await runCommand(
            `wampproto auth cra sign-challenge ${challenge} ${TEST_SECRET}`
        );

        await runCommand(
            `wampproto auth cra verify-signature ${challenge} ${signature.trim()} ${TEST_SECRET}`
        );
    });

    it('Sign CRA Challenge', async function() {
        const challenge: string = await runCommand('wampproto auth cra generate-challenge 1 foo admin static');

        const signature: string = wampCRAAuth.signWAMPCRAChallenge(challenge.trim(), Buffer.from(TEST_SECRET));

        await runCommand(
            `wampproto auth cra verify-signature '${challenge.trim()}' ${signature.trim()} ${TEST_SECRET}`
        );
    });

    it('Verify CRA Signature', async function() {
        const challenge: string = await runCommand('wampproto auth cra generate-challenge 1 foo admin static');

        const signature: string = await runCommand(
            `wampproto auth cra sign-challenge '${challenge.trim()}' ${TEST_SECRET}`
        );

        const isVerified: boolean = wampCRAAuth.verifyWAMPCRASignature(
            signature.trim(), challenge.trim(), Buffer.from(TEST_SECRET)
        );

        expect(isVerified).toBeTruthy();
    });
});
