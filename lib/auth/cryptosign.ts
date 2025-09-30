import * as nacl from 'tweetnacl';

import {Authenticate, AuthenticateFields} from "../messages/authenticate";
import {Challenge} from "../messages/challenge";
import {ClientAuthenticator} from "./authenticator";

export class CryptoSignAuthenticator implements ClientAuthenticator {
    static TYPE = "cryptosign"

    constructor(
        private readonly _authid: string,
        private readonly _privateKey: string,
        private readonly _authExtra: { [key: string]: any }
    ) {
        if (!("pubkey" in this._authExtra)) {
            const keyPair = nacl.sign.keyPair.fromSeed(hexToUint8Array(this._privateKey));
            this._authExtra["pubkey"] = uint8ArrayToString(keyPair.publicKey);
        }
    }

    get authMethod(): string {
        return CryptoSignAuthenticator.TYPE;
    }

    get authID(): string {
        return this._authid;
    }

    get authExtra(): object {
        return this._authExtra;
    }

    async authenticate(challenge: Challenge): Promise<Authenticate> {
        if (!("challenge" in challenge.extra)) {
            throw new Error("challenge string missing in extra");
        }
        const challengeHex: string = challenge.extra["challenge"];

        const signed: string = signCryptoSignChallenge(challengeHex, this._privateKey);

        return new Authenticate(new AuthenticateFields(signed, {}));
    }
}

export function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(Buffer.from(hex, 'hex'));
}

export function uint8ArrayToString(bytes: Uint8Array): string {
    return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}


export function signCryptoSignChallenge(challenge: string, privateKeyHex: string): string {
    let privateKey: Uint8Array;
    if (privateKeyHex.length == 64) {
        const key = hexToUint8Array(privateKeyHex);
        const keyPair = nacl.sign.keyPair.fromSeed(hexToUint8Array(privateKeyHex));
        const publicKey = keyPair.publicKey;

        // combine private & public keys
        privateKey = new Uint8Array(64);
        privateKey.set(key);
        privateKey.set(publicKey, 32);
    } else {
        throw new Error("invalid private key length")
    }

    const rawChallenge = hexToUint8Array(challenge);
    const signature = nacl.sign(rawChallenge, privateKey);

    return uint8ArrayToString(signature);
}

export function generateCryptoSignChallenge(): string {
    const rawBytes: Uint8Array = nacl.randomBytes(32);
    return uint8ArrayToString(rawBytes);
}

export function verifyCryptoSignSignature(signature: string, publicKey: Uint8Array): boolean {
    try {
        const signedMessage = new Uint8Array(Buffer.from(signature, 'hex'));

        const message = nacl.sign.open(signedMessage, publicKey);
        return message !== null;
    } catch (e) {
        return false;
    }
}
