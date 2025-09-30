import * as ed from "@noble/ed25519";
import {sha512} from "@noble/hashes/sha2.js";
import {getPublicKey} from '@noble/ed25519';
import {Buffer} from "buffer";

import {Authenticate, AuthenticateFields} from "../messages/authenticate";
import {Challenge} from "../messages/challenge";
import {ClientAuthenticator} from "./authenticator";

import {cryptoObj} from "./utils";

ed.hashes.sha512 = sha512;


export class CryptoSignAuthenticator implements ClientAuthenticator {
    static TYPE = "cryptosign";

    constructor(
        private readonly _authid: string,
        private readonly _privateKey: string,
        private readonly _authExtra: { [key: string]: any }
    ) {
        if (!("pubkey" in this._authExtra)) {
            const pubkeyBytes = getPublicKey(hexToUint8Array(this._privateKey));
            this._authExtra["pubkey"] = uint8ArrayToHex(pubkeyBytes);
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

        const signed: string = await signCryptoSignChallenge(challengeHex, this._privateKey);

        return new Authenticate(new AuthenticateFields(signed, {}));
    }
}

export function hexToUint8Array(hex: string): Uint8Array {
    return new Uint8Array(Buffer.from(hex, "hex"));
}

export function uint8ArrayToHex(bytes: Uint8Array): string {
    return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function seedToPkcs8(seed: Uint8Array): ArrayBuffer {
    if (seed.length !== 32) {
        throw new Error("Seed must be 32 bytes");
    }

    const header = Uint8Array.from([
        0x30, 0x2e,
        0x02, 0x01, 0x00,
        0x30, 0x05,
        0x06, 0x03, 0x2b, 0x65, 0x70,
        0x04, 0x22,
        0x04, 0x20
    ]);

    const pkcs8 = new Uint8Array(header.length + seed.length);
    pkcs8.set(header, 0);
    pkcs8.set(seed, header.length);

    return pkcs8.buffer;
}


export async function signCryptoSignChallenge(challenge: string, privateKeyHex: string): Promise<string> {
    if (privateKeyHex.length !== 64) {
        throw new Error("Invalid private key length. Expected 64 hex characters (32 bytes).");
    }

    const seed = hexToUint8Array(privateKeyHex);
    const pkcs8 = seedToPkcs8(seed);

    const privateKey = await cryptoObj.subtle.importKey(
        "pkcs8",
        pkcs8,
        {name: "Ed25519"},
        false,
        ["sign"]
    );
    const challengeBytes = hexToUint8Array(challenge);
    const signatureBuffer = await cryptoObj.subtle.sign(
        "Ed25519",
        privateKey,
        challengeBytes as BufferSource
    );

    const signature = new Uint8Array(signatureBuffer);
    const output = new Uint8Array(signature.length + challengeBytes.length);
    output.set(signature, 0);
    output.set(challengeBytes, signature.length);

    return uint8ArrayToHex(output);
}

export function generateCryptoSignChallenge(): string {
    return uint8ArrayToHex(cryptoObj.getRandomValues(new Uint8Array(32)));
}

export async function verifyCryptoSignSignature(signatureHex: string, publicKey: Uint8Array): Promise<boolean> {
    try {
        const signedMessage = new Uint8Array(Buffer.from(signatureHex, "hex"));

        const signature = signedMessage.slice(0, 64);
        const challenge = signedMessage.slice(64);

        const key = await cryptoObj.subtle.importKey(
            "raw",
            publicKey as BufferSource,
            {name: "Ed25519"},
            false,
            ["verify"]
        );

        return await cryptoObj.subtle.verify("Ed25519", key, signature, challenge);
    } catch {
        return false;
    }
}
