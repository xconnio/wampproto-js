import Message, {BinaryPayload} from "./message";
import ValidationSpec from "./validation-spec";
import {
    validateArgs,
    validateDetails,
    validateKwArgs,
    validateMessage,
    validateMessageType,
    validateRequestID,
    validateUri,
} from "./util";

interface IErrorFields {
    readonly messageType: number;
    readonly requestID: number;
    readonly uri: string;
    readonly args: string[];
    readonly kwargs: { [key: string]: any }
    readonly details: { [key: string]: any };
    readonly binaryPayload: BinaryPayload;
}

class ErrorFields implements IErrorFields {
    private readonly _details: { [key: string]: any }
    constructor (
        private readonly _messageType: number,
        private readonly _requestID: number,
        private readonly _uri: string,
        private readonly _args: string[] | null = null,
        private readonly _kwargs: { [key: string]: any } | null = null,
        details: { [key: string]: any } | null = null,
        ) {
        this._details = details === null ? {} : details;
    }

    get messageType(): number {
        return this._messageType;
    }

    get requestID(): number {
        return this._requestID;
    }

    get uri(): string {
        return this._uri;
    }

    get args(): string[] {
        return this._args;
    }

    get kwargs(): { [key: string]: any } {
        return this._kwargs;
    }

    get details(): { [key: string]: any } {
        return this._details;
    }

    payloadIsBinary(): boolean {
        return false;
    }

    get payload(): Uint8Array | null {
        return null;
    }

    get payloadSerializer(): number {
        return 0;
    }

    get binaryPayload(): BinaryPayload {
        return this;
    }
}

class Error implements Message {
    static TYPE: number = 8;
    static TEXT: string = "ERROR";

    static VALIDATION_SPEC = new ValidationSpec(
        5,
        7,
        Error.TEXT,
        {
            1: validateMessageType,
            2: validateRequestID,
            3: validateDetails,
            4: validateUri,
            5: validateArgs,
            6: validateKwArgs
        },
    )

    constructor(private readonly _fields: IErrorFields) {}

    get messageType(): number {
        return this._fields.messageType;
    }

    get requestID(): number {
        return this._fields.requestID;
    }

    get uri(): string {
        return this._fields.uri;
    }

    get args(): string[] {
        return this._fields.args;
    }

    get kwargs(): { [key: string]: any } {
        return this._fields.kwargs;
    }

    get details(): { [key: string]: any } {
        return this._fields.details;
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

    static parse(msg: any[]): Error {
        const f = validateMessage(msg, Error.TYPE, Error.TEXT, Error.VALIDATION_SPEC)
        return new Error(new ErrorFields(f.messageType, f.requestID, f.uri, f.args, f.kwargs, f.details));
    }

    marshal(): any[] {
        const message: any[] = [Error.TYPE, this.messageType, this.requestID, this.details, this.uri]
        if (this.args !== null) {
            message.push(this.args)
        }

        if (this.kwargs !== null) {
            if (this.args === null) {
                message.push([]);
            }

            message.push(this.kwargs);
        }

        return message;
    }

    type(): number {
        return Error.TYPE;
    }
}

export {Error, ErrorFields};
