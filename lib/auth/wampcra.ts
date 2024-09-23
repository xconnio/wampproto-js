import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

import { Authenticate, AuthenticateFields } from "../messages/authenticate";
import {Challenge} from "../messages/challenge";
import {ClientAuthenticator} from "./authenticator";

export class WAMPCRAAuthenticator implements ClientAuthenticator {
    static TYPE = "wampcra"

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
        const signed = signWAMPCRAChallenge(challenge.extra["challenge"], Buffer.from(this._secret, 'utf-8'));
        return new Authenticate(new AuthenticateFields(signed, {}));
    }
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
