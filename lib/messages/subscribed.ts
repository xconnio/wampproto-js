import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateMessage,
    validateSubscriptionID,
    validateRequestID,
} from "./util";

interface ISubscribedFields {
    readonly requestID: number;
    readonly subscriptionID: number;
}

class SubscribedFields implements ISubscribedFields {
    constructor (private readonly _requestID: number, private readonly _subscriptionID: number) {}

    get requestID(): number {
        return this._requestID;
    }

    get subscriptionID(): number {
        return this._subscriptionID;
    }
}

class Subscribed implements Message {
    static TYPE: number = 33;
    static TEXT: string = "SUBSCRIBED";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Subscribed.TEXT,
        {1: validateRequestID, 2: validateSubscriptionID},
    )

    constructor(private readonly _fields: ISubscribedFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get subscriptionID(): number {
        return this._fields.subscriptionID;
    }

    static parse(msg: any[]): Subscribed {
        const f = validateMessage(msg, Subscribed.TYPE, Subscribed.TEXT, Subscribed.VALIDATION_SPEC)
        return new Subscribed(new SubscribedFields(f.requestID, f.subscriptionID));
    }

    marshal(): any[] {
        return [Subscribed.TYPE, this.requestID, this.subscriptionID];
    }

    type(): number {
        return Subscribed.TYPE;
    }
}

export {Subscribed, SubscribedFields};
