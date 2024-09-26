import Message, {BinaryPayload} from "./message";
import ValidationSpec from "./validation-spec";
import {
    validateArgs, validateDetails,
    validateKwArgs,
    validateMessage,
    validateRegistrationID,
    validateRequestID,
} from "./util";

interface IInvocationFields {
    readonly requestID: number;
    readonly registrationID: number;
    readonly args: string[] | null;
    readonly kwargs: { [key: string]: any } | null
    readonly details: { [key: string]: any };
    readonly binaryPayload: BinaryPayload;
}

class InvocationFields implements IInvocationFields {
    private readonly _details: { [key: string]: any }
    constructor (
        private readonly _requestID: number,
        private readonly _registrationID: number,
        private readonly _args: string[] | null = null,
        private readonly _kwargs: { [key: string]: any } | null = null,
        details: { [key: string]: any } | null = null,

        private readonly _serializer: number | null = null,
        private readonly _payload: Uint8Array | null = null,
        ) {
        this._details = details === null ? {} : details;
    }

    get requestID(): number {
        return this._requestID;
    }

    get registrationID(): number {
        return this._registrationID;
    }

    get args(): string[] | null {
        return this._args;
    }

    get kwargs(): { [key: string]: any } | null {
        return this._kwargs;
    }

    get details(): { [key: string]: any } {
        return this._details;
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

class Invocation implements Message {
    static TYPE: number = 68;
    static TEXT: string = "INVOCATION";

    static VALIDATION_SPEC = new ValidationSpec(
        4,
        6,
        Invocation.TEXT,
        {
            1: validateRequestID,
            2: validateRegistrationID,
            3: validateDetails,
            4: validateArgs,
            5: validateKwArgs
        },
    )

    constructor(private readonly _fields: IInvocationFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get registrationID(): number {
        return this._fields.registrationID;
    }

    get args(): string[] | null {
        return this._fields.args;
    }

    get kwargs(): { [key: string]: any } | null {
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

    static parse(msg: any[]): Invocation {
        const f = validateMessage(msg, Invocation.TYPE, Invocation.TEXT, Invocation.VALIDATION_SPEC)
        return new Invocation(new InvocationFields(f.requestID, f.registrationID, f.args, f.kwargs, f.details));
    }

    marshal(): any[] {
        const message: any[] = [Invocation.TYPE, this.requestID, this.registrationID, this.details]
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
        return Invocation.TYPE;
    }
}

export {Invocation, InvocationFields};
