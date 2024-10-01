import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateMessage,
    validateRegistrationID,
    validateRequestID,
} from "./util";

interface IUnregisterFields {
    readonly requestID: number;
    readonly registrationID: number;
}

class UnregisterFields implements IUnregisterFields {
    constructor (private readonly _requestID: number, private readonly _registrationID: number) {}

    get requestID(): number {
        return this._requestID;
    }

    get registrationID(): number {
        return this._registrationID;
    }
}

class Unregister implements Message {
    static TYPE: number = 66;
    static TEXT: string = "UNREGISTER";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Unregister.TEXT,
        {1: validateRequestID, 2: validateRegistrationID},
    )

    constructor(private readonly _fields: IUnregisterFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get registrationID(): number {
        return this._fields.registrationID;
    }

    static parse(msg: any[]): Unregister {
        const f = validateMessage(msg, Unregister.TYPE, Unregister.TEXT, Unregister.VALIDATION_SPEC)
        return new Unregister(new UnregisterFields(f.requestID, f.registrationID));
    }

    marshal(): any[] {
        return [Unregister.TYPE, this.requestID, this.registrationID];
    }

    type(): number {
        return Unregister.TYPE;
    }
}

export {Unregister, UnregisterFields};
