import Message from "./message";
import ValidationSpec from "./validation-spec";
import {
    validateMessage,
    validateRequestID,
} from "./util";

interface IUnsubscribedFields {
    readonly requestID: number;
}

class UnsubscribedFields implements IUnsubscribedFields {
    constructor (private readonly _requestID: number) {}

    get requestID(): number {
        return this._requestID;
    }
}

class Unsubscribed implements Message {
    static TYPE: number = 35;
    static TEXT: string = "UNSUBSCRIBED";

    static VALIDATION_SPEC = new ValidationSpec(
        2,
        2,
        Unsubscribed.TEXT,
        {1: validateRequestID},
    )

    constructor(private readonly _fields: IUnsubscribedFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    static parse(msg: any[]): Unsubscribed {
        const f = validateMessage(msg, Unsubscribed.TYPE, Unsubscribed.TEXT, Unsubscribed.VALIDATION_SPEC)
        return new Unsubscribed(new UnsubscribedFields(f.requestID));
    }

    marshal(): any[] {
        return [Unsubscribed.TYPE, this.requestID];
    }

    type(): number {
        return Unsubscribed.TYPE;
    }
}

export {Unsubscribed, UnsubscribedFields};
