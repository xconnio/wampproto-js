import {Message, BinaryPayload} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateArgs,
    validateKwArgs,
    validateMessage,
    validateOptions,
    validateRequestID,
} from "./util";

interface IResultFields {
    readonly requestID: number;
    readonly options: { [key: string]: any };
    readonly args: string[] | null;
    readonly kwargs: { [key: string]: any } | null
    readonly binaryPayload: BinaryPayload;
}

class ResultFields implements IResultFields {
    private readonly _options: { [key: string]: any }
    constructor (
        private readonly _requestID: number,
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

    get options(): { [key: string]: any } {
        return this._options;
    }

    get args(): string[] | null {
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

class Result implements Message {
    static TYPE: number = 50;
    static TEXT: string = "RESULT";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        5,
        Result.TEXT,
        {
            1: validateRequestID,
            2: validateOptions,
            3: validateArgs,
            4: validateKwArgs
        },
    )

    constructor(private readonly _fields: IResultFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get options(): { [key: string]: any } {
        return this._fields.options;
    }

    get args(): string[] | null {
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

    static parse(msg: any[]): Result {
        const f = validateMessage(msg, Result.TYPE, Result.TEXT, Result.VALIDATION_SPEC)
        return new Result(new ResultFields(f.requestID, f.args, f.kwargs, f.options));
    }

    marshal(): any[] {
        const message: any[] = [Result.TYPE, this.requestID, this.options]
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
        return Result.TYPE;
    }
}

export {Result, ResultFields};
