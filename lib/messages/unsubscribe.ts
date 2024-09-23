import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateMessage,
    validateSubscriptionID,
    validateRequestID,
} from "./util";

interface IUnsubscribeFields {
    readonly requestID: number;
    readonly subscriptionID: number;
}

class UnsubscribeFields implements IUnsubscribeFields {
    constructor (private readonly _requestID: number, private readonly _subscriptionID: number) {}

    get requestID(): number {
        return this._requestID;
    }

    get subscriptionID(): number {
        return this._subscriptionID;
    }
}

class Unsubscribe implements Message {
    static TYPE: number = 34;
    static TEXT: string = "UNSUBSCRIBE";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Unsubscribe.TEXT,
        {1: validateRequestID, 2: validateSubscriptionID},
    )

    constructor(private readonly _fields: IUnsubscribeFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get subscriptionID(): number {
        return this._fields.subscriptionID;
    }

    static parse(msg: any[]): Unsubscribe {
        const f = validateMessage(msg, Unsubscribe.TYPE, Unsubscribe.TEXT, Unsubscribe.VALIDATION_SPEC)
        return new Unsubscribe(new UnsubscribeFields(f.requestID, f.subscriptionID));
    }

    marshal(): any[] {
        return [Unsubscribe.TYPE, this.requestID, this.subscriptionID];
    }

    type(): number {
        return Unsubscribe.TYPE;
    }
}

export {Unsubscribe, UnsubscribeFields};
