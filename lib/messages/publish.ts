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

interface IPublishFields {
    readonly requestID: number;
    readonly uri: string;
    readonly args: string[] | null;
    readonly kwargs: { [key: string]: any } | null;
    readonly options: { [key: string]: any };
    readonly binaryPayload: BinaryPayload;
}

class PublishFields implements IPublishFields {
    private readonly _options: { [key: string]: any };
    constructor (
        private readonly _requestID: number,
        private readonly _uri: string,
        private readonly _args: string[] | null = null,
        private readonly _kwargs: { [key: string]: any } | null = null,
        options: { [key: string]: any } | null = null,
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

class Publish implements Message {
    static TYPE: number = 16;
    static TEXT: string = "PUBLISH";

    static VALIDATION_SPEC = new ValidationSpec(
        4,
        6,
        Publish.TEXT,
        {
            1: validateRequestID,
            2: validateOptions,
            3: validateUri,
            4: validateArgs,
            5: validateKwArgs
        },
    )

    constructor(private readonly _fields: IPublishFields) {}

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

    static parse(msg: any[]): Publish {
        const f = validateMessage(msg, Publish.TYPE, Publish.TEXT, Publish.VALIDATION_SPEC)
        return new Publish(new PublishFields(f.requestID, f.uri, f.args, f.kwargs, f.options));
    }

    marshal(): any[] {
        const message: any[] = [Publish.TYPE, this.requestID, this.options, this.uri]
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
        return Publish.TYPE;
    }
}

export {Publish, PublishFields};
