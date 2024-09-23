import {Message, BinaryPayload} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateArgs,
    validateKwArgs,
    validateMessage,
    validateOptions,
    validateRequestID,
    validateUri,
} from "./util";

interface ICallFields {
    readonly requestID: number;
    readonly uri: string;
    readonly args: string[] | null;
    readonly kwargs: { [key: string]: any } | null;
    readonly options: { [key: string]: any };
    readonly binaryPayload: BinaryPayload;
}

class CallFields implements ICallFields {
    private readonly _options: { [key: string]: any };
    constructor (
        private readonly _requestID: number,
        private readonly _uri: string,
        private readonly _args: string[] | null = null,
        private readonly _kwargs: { [key: string]: any } | null = null,
        options: { [key: string]: any } | null = null,

        private readonly _serializer: number | null = null,
        private readonly _payload: Uint8Array | null = null,
        ) {
        this._options = options === null ? {} : options;
    }

    get requestID(): number {
        return this._requestID;
    }

    get uri(): string {
        return this._uri;
    }

    get args(): string[] | null {
        return this._args;
    }

    get kwargs(): { [key: string]: any } | null {
        return this._kwargs;
    }

    get options(): { [key: string]: any } {
        return this._options;
    }

    payloadIsBinary(): boolean {
        return this._serializer != 0;
    }

    get payload(): Uint8Array | null {
        return this._payload;
    }

    get payloadSerializer(): number {
        return this._serializer;
    }

    get binaryPayload(): BinaryPayload {
        return this;
    }
}

class Call implements Message {
    static TYPE: number = 48;
    static TEXT: string = "CALL";

    static VALIDATION_SPEC = new ValidationSpec(
        4,
        6,
        Call.TEXT,
        {
            1: validateRequestID,
            2: validateOptions,
            3: validateUri,
            4: validateArgs,
            5: validateKwArgs
        },
    )

    constructor(private readonly _fields: ICallFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get uri(): string {
        return this._fields.uri;
    }

    get args(): string[] | null {
        return this._fields.args;
    }

    get kwargs(): { [key: string]: any } | null {
        return this._fields.kwargs;
    }

    get options(): { [key: string]: any } {
        return this._fields.options;
    }

    payloadIsBinary(): boolean {
        return this._fields.binaryPayload.payloadIsBinary();
    }

    get payload(): Uint8Array | null {
        return this._fields.binaryPayload.payload;
    }

    get payloadSerializer(): number {
        return this._fields.binaryPayload.payloadSerializer;
    }

    static parse(msg: any[]): Call {
        const f = validateMessage(msg, Call.TYPE, Call.TEXT, Call.VALIDATION_SPEC)
        return new Call(new CallFields(f.requestID, f.uri, f.args, f.kwargs, f.options));
    }

    marshal(): any[] {
        const message: any[] = [Call.TYPE, this.requestID, this.options, this.uri]
        if (this.args !== null) {
            message.push(this.args)
        }

        if (this.kwargs !== null) {
            if (this.args !== null) {
                message.push([]);
            }

            message.push(this.kwargs);
        }

        return message;
    }

    type(): number {
        return Call.TYPE;
    }
}

export {Call, CallFields};
