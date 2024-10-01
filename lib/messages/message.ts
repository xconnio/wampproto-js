
export interface Message {
    marshal(): any[];
    type(): number
}

export interface BinaryPayload {
    payloadIsBinary(): boolean;
    readonly payload: Uint8Array | null;
    readonly payloadSerializer: number;
}
