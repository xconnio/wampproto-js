import Message from "./message";
import ValidationSpec from "./validation-spec";
import {
    validateMessage,
    validateRequestID,
} from "./util";

interface IUnregisteredFields {
    readonly requestID: number;
}

class UnregisteredFields implements IUnregisteredFields {
    constructor (private readonly _requestID: number) {}

    get requestID(): number {
        return this._requestID;
    }
}

class Unregistered implements Message {
    static TYPE: number = 67;
    static TEXT: string = "UNREGISTERED";

    static VALIDATION_SPEC = new ValidationSpec(
        2,
        2,
        Unregistered.TEXT,
        {1: validateRequestID},
    )

    constructor(private readonly _fields: IUnregisteredFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    static parse(msg: any[]): Unregistered {
        const f = validateMessage(msg, Unregistered.TYPE, Unregistered.TEXT, Unregistered.VALIDATION_SPEC)
        return new Unregistered(new UnregisteredFields(f.requestID));
    }

    marshal(): any[] {
        return [Unregistered.TYPE, this.requestID];
    }

    type(): number {
        return Unregistered.TYPE;
    }
}

export {Unregistered, UnregisteredFields};
