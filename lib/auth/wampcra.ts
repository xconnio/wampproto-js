import {Buffer} from "buffer";
import {webcrypto} from "crypto";

import {Authenticate, AuthenticateFields} from "../messages/authenticate";
import {Challenge} from "../messages/challenge";
import {ClientAuthenticator} from "./authenticator";

export const cryptoObj: Crypto = (globalThis.crypto ?? webcrypto) as Crypto;

const encoder = new TextEncoder();


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

    async authenticate(challenge: Challenge): Promise<Authenticate> {
        const challengeHex = challenge.extra["challenge"];
        if (!challengeHex) {
            throw new Error("Challenge string missing in extra");
        }

        const salt = challenge.extra["salt"];
        let rawSecret: Uint8Array;

        if (!salt) {
            rawSecret = encoder.encode(this._secret);
        } else {
            const iterations = challenge.extra["iterations"];
            if (typeof iterations !== "number") {
                throw new Error("Iterations missing in extra");
            }

            const keylen = challenge.extra["keylen"];
            if (typeof keylen !== "number") {
                throw new Error("Key length missing in extra");
            }

            rawSecret = await deriveCRAKey(salt, this._secret, iterations, keylen);
        }

        const signed = await signWAMPCRAChallenge(challengeHex, rawSecret);
        return new Authenticate(new AuthenticateFields(signed, {}));
    }
}

async function deriveCRAKey(saltStr: string, secret: string, iterations: number, keyLength: number): Promise<Uint8Array> {
    const effectiveIterations = iterations === 0 ? WAMPCRAAuthenticator.DEFAULT_ITERATIONS : iterations;
    const effectiveKeyLength = keyLength === 0 ? WAMPCRAAuthenticator.DEFAULT_KEY_LENGTH : keyLength;

    const salt = encoder.encode(saltStr);

    const baseKey = await cryptoObj.subtle.importKey(
        "raw",
        encoder.encode(secret),
        {name: "PBKDF2"},
        false,
        ["deriveBits"]
    );

    const bits = await cryptoObj.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: effectiveIterations,
            hash: "SHA-256",
        },
        baseKey,
        effectiveKeyLength * 8
    );

    const base64String = Buffer.from(bits).toString("base64");

    return encoder.encode(base64String);
}

export function generateWAMPCRAChallenge(sessionID: number, authid: string, authrole: string, provider: string): string {
    const nonce = cryptoObj.getRandomValues(new Uint8Array(32)).toString();

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

export async function generateHMAC(keyBytes: Uint8Array, msgBytes: Uint8Array): Promise<string> {
    const key = await cryptoObj.subtle.importKey(
        "raw",
        keyBytes as BufferSource,
        {name: "HMAC", hash: {name: "SHA-256"}},
        false,
        ["sign"]
    );

    const signature = await cryptoObj.subtle.sign("HMAC", key, msgBytes as BufferSource);
    return Buffer.from(signature).toString("base64");
}

export async function signWAMPCRAChallenge(challenge: string, key: Uint8Array): Promise<string> {
    return await generateHMAC(key, encoder.encode(challenge))
}

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }
    return result === 0;
}

export async function verifyWAMPCRASignature(signature: string, challenge: string, key: Buffer): Promise<boolean> {
    const signatureBytes = Buffer.from(signature, 'base64');
    const localSignature = await signWAMPCRAChallenge(challenge, key);
    const localSigBytes = Buffer.from(localSignature, 'base64');
    return timingSafeEqual(signatureBytes, localSigBytes);
}
