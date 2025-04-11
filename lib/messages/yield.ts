import {Message, BinaryPayload} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateArgs,
    validateKwArgs,
    validateMessage,
    validateOptions,
    validateRequestID,
} from "./util";

interface IYieldFields {
    readonly requestID: number;
    readonly options: { [key: string]: any };
    readonly args: any[] | null;
    readonly kwargs: { [key: string]: any } | null
    readonly binaryPayload: BinaryPayload;
}

class YieldFields implements IYieldFields {
    private readonly _options: { [key: string]: any }
    constructor (
        private readonly _requestID: number,
        private readonly _args: any[] | null = null,
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

    get options(): { [key: string]: any } {
        return this._options;
    }

    get args(): any[] | null {
        return this._args;
    }
    get kwargs(): { [key: string]: any } | null {
        return this._kwargs;
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

class Yield implements Message {
    static TYPE: number = 70;
    static TEXT: string = "YIELD";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        5,
        Yield.TEXT,
        {
            1: validateRequestID,
            2: validateOptions,
            3: validateArgs,
            4: validateKwArgs
        },
    )

    constructor(private readonly _fields: IYieldFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get options(): { [key: string]: any } {
        return this._fields.options;
    }

    get args(): any[] | null {
        return this._fields.args;
    }

    get kwargs(): { [key: string]: any } | null {
        return this._fields.kwargs;
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

    static parse(msg: any[]): Yield {
        const f = validateMessage(msg, Yield.TYPE, Yield.TEXT, Yield.VALIDATION_SPEC)
        return new Yield(new YieldFields(f.requestID, f.args, f.kwargs, f.options));
    }

    marshal(): any[] {
        const message: any[] = [Yield.TYPE, this.requestID, this.options]
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
        return Yield.TYPE;
    }
}

export {Yield, YieldFields};
