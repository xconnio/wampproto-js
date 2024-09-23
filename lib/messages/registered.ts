import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateMessage,
    validateRegistrationID,
    validateRequestID,
} from "./util";

interface IRegisteredFields {
    readonly requestID: number;
    readonly registrationID: number;
}

class RegisteredFields implements IRegisteredFields {
    constructor (private readonly _requestID: number, private readonly _registrationID: number) {}

    get requestID(): number {
        return this._requestID;
    }

    get registrationID(): number {
        return this._registrationID;
    }
}

class Registered implements Message {
    static TYPE: number = 65;
    static TEXT: string = "REGISTERED";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Registered.TEXT,
        {1: validateRequestID, 2: validateRegistrationID},
    )

    constructor(private readonly _fields: IRegisteredFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get registrationID(): number {
        return this._fields.registrationID;
    }

    static parse(msg: any[]): Registered {
        const f = validateMessage(msg, Registered.TYPE, Registered.TEXT, Registered.VALIDATION_SPEC)
        return new Registered(new RegisteredFields(f.requestID, f.registrationID));
    }

    marshal(): any[] {
        return [Registered.TYPE, this.requestID, this.registrationID];
    }

    type(): number {
        return Registered.TYPE;
    }
}

export {Registered, RegisteredFields};
