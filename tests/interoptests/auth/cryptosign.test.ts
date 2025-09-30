import * as cryptoSignAuth from '../../../lib/auth/cryptosign'
import {runCommand} from "../helpers";


describe('Cryptosign Tests', function () {
    const TEST_PUBLIC_KEY: string = "2b7ec216daa877c7f4c9439db8a722ea2340eacad506988db2564e258284f895";
    const TEST_PRIVATE_KEY: string = "022b089bed5ab78808365e82dd12c796c835aeb98b4a5a9e099d3e72cb719516";

    it('Generate challenge', async function () {
        const challenge: string = cryptoSignAuth.generateCryptoSignChallenge();

        const signature: string = await runCommand(
            `wampproto auth cryptosign sign-challenge ${challenge} ${TEST_PRIVATE_KEY}`
        );

        await runCommand(
            `wampproto auth cryptosign verify-signature ${signature.trim()} ${TEST_PUBLIC_KEY}`
        );
    });

    it('Sign CryptoSign Challenge', async function() {
        const challenge: string = await runCommand('wampproto auth cryptosign generate-challenge');

        const signature: string = await cryptoSignAuth.signCryptoSignChallenge(challenge.trim(), TEST_PRIVATE_KEY);

        await runCommand(
            `wampproto auth cryptosign verify-signature ${signature} ${TEST_PUBLIC_KEY}`
        );
    });

    it('Verify CryptoSign Signature', async function() {
        const challenge: string = await runCommand('wampproto auth cryptosign generate-challenge');

        const signature: string = await runCommand(
            `wampproto auth cryptosign sign-challenge ${challenge.trim()} ${TEST_PRIVATE_KEY}`
        );

        const isVerified: boolean = await cryptoSignAuth.verifyCryptoSignSignature(
            signature.trim(), cryptoSignAuth.hexToUint8Array(TEST_PUBLIC_KEY)
        );

        expect(isVerified).toBeTruthy();
    });
});
