import {createHmac, randomBytes, timingSafeEqual, pbkdf2Sync} from 'crypto';

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


export function generateWAMPCRAChallenge(sessionID: number, authid: string, authrole: string, provider: string): string {
    const nonce = randomBytes(16).toString('hex');

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

export function signWAMPCRAChallenge(challenge: string, key: Buffer): string {
    const hmac = createHmac('sha256', key);
    hmac.update(challenge);
    return hmac.digest('base64');
}

export function verifyWAMPCRASignature(signature: string, challenge: string, key: Buffer): boolean {
    const signatureBytes = Buffer.from(signature, 'base64');
    const localSignature = signWAMPCRAChallenge(challenge, key);
    const localSigBytes = Buffer.from(localSignature, 'base64');
    return timingSafeEqual(signatureBytes, localSigBytes);
}
