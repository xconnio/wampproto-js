import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { utf8ToBytes } from '@noble/hashes/utils';
import { pbkdf2Sync } from 'pbkdf2';
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
    const salt = Buffer.from(saltStr, 'utf-8');

    const effectiveIterations = iterations === 0 ? WAMPCRAAuthenticator.DEFAULT_ITERATIONS : iterations;
    const effectiveKeyLength = keyLength === 0 ? WAMPCRAAuthenticator.DEFAULT_KEY_LENGTH : keyLength

    const key = pbkdf2Sync(secret, salt, effectiveIterations, effectiveKeyLength, 'sha256');
    const base64Encoded = Buffer.from(key).toString('base64');
    return Buffer.from(base64Encoded, 'utf-8');
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
    const result = hmac(sha256, key, utf8ToBytes(challenge));
    return Buffer.from(result).toString('base64');
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
