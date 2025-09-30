import * as nodeCrypto from "crypto";

let cryptoObj: Crypto;

if (typeof globalThis.crypto !== "undefined") {
    cryptoObj = globalThis.crypto as Crypto;
} else if ("webcrypto" in nodeCrypto) {
    cryptoObj = (nodeCrypto as any).webcrypto as Crypto;
} else {
    throw new Error("No crypto implementation available in this environment");
}

export { cryptoObj };
