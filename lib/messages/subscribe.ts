import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateMessage,
    validateOptions,
    validateRequestID,
    validateTopic,
} from "./util";

interface ISubscribeFields {
    readonly requestID: number;
    readonly options: { [key: string]: any };
    readonly topic: string;
}

class SubscribeFields implements ISubscribeFields {
    private readonly _options: { [key: string]: any }

    constructor (
        private readonly _requestID: number,
        private readonly _topic: string,
        options: { [key: string]: any } | null = null,
    ) {
        this._options = options === null ? {} : options;
    }

    get requestID(): number {
        return this._requestID;
    }

    get options(): { [key: string]: any } {
        return this._options;
    }

    get topic(): string {
        return this._topic;
    }
}

class Subscribe implements Message {
    static TYPE: number = 32;
    static TEXT: string = "SUBSCRIBE";

    static VALIDATION_SPEC = new ValidationSpec(
        4,
        4,
        Subscribe.TEXT,
        {1: validateRequestID, 2: validateOptions, 3: validateTopic},
    )

    constructor(private readonly _fields: ISubscribeFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get options(): { [key: string]: any } {
        return this._fields.options;
    }

    get topic(): string {
        return this._fields.topic;
    }

    static parse(msg: any[]): Subscribe {
        const f = validateMessage(msg, Subscribe.TYPE, Subscribe.TEXT, Subscribe.VALIDATION_SPEC)
        return new Subscribe(new SubscribeFields(f.requestID, f.topic, f.options));
    }

    marshal(): any[] {
        return [Subscribe.TYPE, this.requestID, this.options, this.topic];
    }

    type(): number {
        return Subscribe.TYPE;
    }
}

export {Subscribe, SubscribeFields};
