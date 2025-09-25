import HmacSHA256 from "crypto-js/hmac-sha256";
import EncUtf8 from "crypto-js/enc-utf8";
import EncBase64 from "crypto-js/enc-base64";
import PBKDF2 from 'crypto-js/pbkdf2';
import CryptoJS from 'crypto-js';
import {Buffer} from "buffer";

import {Authenticate, AuthenticateFields} from "../messages/authenticate";
import {Challenge} from "../messages/challenge";
import {ClientAuthenticator} from "./authenticator";

export class WAMPCRAAuthenticator implements ClientAuthenticator {
    static TYPE = "wampcra"
    static DEFAULT_ITERATIONS = 1000
    static DEFAULT_KEY_LENGTH = 256

    constructor(
        private readonly _authid: string,
        private readonly _secret: string,
        private readonly _authExtra: { [key: string]: any }
    ) {}

    get authMethod(): string {
        return WAMPCRAAuthenticator.TYPE;
    }

    get authID(): string {
        return this._authid;
    }

    get authExtra(): object {
        return this._authExtra;
    }

    authenticate(challenge: Challenge): Authenticate {
        const challengeHex = challenge.extra["challenge"];
        if (!challengeHex) {
            throw new Error("Challenge string missing in extra");
        }

        const salt = challenge.extra["salt"];
        let rawSecret: Buffer;

        if (!salt) {
            rawSecret = Buffer.from(this._secret, "utf-8");
        } else {
            const iterations = challenge.extra["iterations"];
            if (typeof iterations !== "number") {
                throw new Error("Iterations missing in extra");
            }

            const keylen = challenge.extra["keylen"];
            if (typeof keylen !== "number") {
                throw new Error("Key length missing in extra");
            }

            rawSecret = deriveCRAKey(salt, this._secret, iterations, keylen);
        }

        const signed = signWAMPCRAChallenge(challengeHex, rawSecret);
        return new Authenticate(new AuthenticateFields(signed, {}));
    }
}

function deriveCRAKey(saltStr: string, secret: string, iterations: number, keyLength: number): Buffer {
    const effectiveIterations = iterations === 0 ? WAMPCRAAuthenticator.DEFAULT_ITERATIONS : iterations;
    const effectiveKeyLength = keyLength === 0 ? WAMPCRAAuthenticator.DEFAULT_KEY_LENGTH : keyLength

    const key = deriveKeyPBKDF2(secret, saltStr, effectiveIterations, effectiveKeyLength);
    const base64Encoded = Buffer.from(key).toString('base64');
    return Buffer.from(base64Encoded, 'utf-8');
}

function deriveKeyPBKDF2(secret: string, salt: string, iterations: number, keyLen: number): Uint8Array {
    const derived = PBKDF2(secret, salt, {keySize: keyLen / 4, iterations, hasher: CryptoJS.algo.SHA256});
    return Uint8Array.from(Buffer.from(derived.toString(), 'hex'));
}

export function generateNonce(): string {
    const isBrowser = typeof window !== 'undefined' && !!window.crypto?.getRandomValues;

    if (isBrowser) {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { randomBytes } = require('crypto');
        return randomBytes(16).toString('hex');
    }
}

export function generateWAMPCRAChallenge(sessionID: number, authid: string, authrole: string, provider: string): string {
    const nonce = generateNonce();

    const data = {
        nonce: nonce,
        authprovider: provider,
        authid: authid,
        authrole: authrole,
        authmethod: WAMPCRAAuthenticator.TYPE,
        session: sessionID,
        timestamp: new Date().toISOString()
    };

    return JSON.stringify(data);
}

export function signWAMPCRAChallenge(challenge: string, key: Uint8Array): string {
    const keyStr = EncUtf8.stringify(EncUtf8.parse(new TextDecoder().decode(key)));
    const hash = HmacSHA256(challenge, keyStr);
    return EncBase64.stringify(hash);
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }
    return result === 0;
}

export function verifyWAMPCRASignature(signature: string, challenge: string, key: Buffer): boolean {
    const signatureBytes = Buffer.from(signature, 'base64');
    const localSignature = signWAMPCRAChallenge(challenge, key);
    const localSigBytes = Buffer.from(localSignature, 'base64');
    return timingSafeEqual(signatureBytes, localSigBytes);
}
