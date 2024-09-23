import {Message, BinaryPayload} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateArgs,
    validateDetails,
    validateKwArgs,
    validateMessage,
    validatePublicationID,
    validateSubscriptionID,
} from "./util";

interface IEventFields {
    readonly subscriptionID: number;
    readonly publicationID: number;
    readonly args: string[] | null;
    readonly kwargs: { [key: string]: any } | null;
    readonly details: { [key: string]: any };
    readonly binaryPayload: BinaryPayload;
}

class EventFields implements IEventFields {
    private readonly _details: { [key: string]: any };
    constructor (
        private readonly _subscriptionID: number,
        private readonly _publicationID: number,
        private readonly _args: string[] | null = null,
        private readonly _kwargs: { [key: string]: any } | null = null,
        details: { [key: string]: any } | null = null,
        ) {
        this._details = details === null ? {} : details;
    }

    get subscriptionID(): number {
        return this._subscriptionID;
    }

    get publicationID(): number {
        return this._publicationID;
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

class Event implements Message {
    static TYPE: number = 36;
    static TEXT: string = "EVENT";

    static VALIDATION_SPEC = new ValidationSpec(
        4,
        6,
        Event.TEXT,
        {
            1: validateSubscriptionID,
            2: validatePublicationID,
            3: validateDetails,
            4: validateArgs,
            5: validateKwArgs
        },
    )

    constructor(private readonly _fields: IEventFields) {}

    get subscriptionID(): number {
        return this._fields.subscriptionID;
    }

    get publicationID(): number {
        return this._fields.publicationID;
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

    static parse(msg: any[]): Event {
        const f = validateMessage(msg, Event.TYPE, Event.TEXT, Event.VALIDATION_SPEC)
        return new Event(new EventFields(f.subscriptionID, f.publicationID, f.args, f.kwargs, f.details));
    }

    marshal(): any[] {
        const message: any[] = [Event.TYPE, this.subscriptionID, this.publicationID, this.details]
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
        return Event.TYPE;
    }
}

export {Event, EventFields};
