import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateMessage,
    validateOptions,
    validateRequestID,
    validateUri
} from "./util";

interface IRegisterFields {
    readonly requestID: number;
    readonly uri: string;
    readonly options: { [key: string]: any };
}

class RegisterFields implements IRegisterFields {
    private readonly _options: { [key: string]: any };
    constructor (
        private readonly _requestID: number,
        private readonly _uri: string,
        options: { [key: string]: any } | null = null
    ) {
        this._options = options === null ? {} : options
    }

    get requestID(): number {
        return this._requestID;
    }

    get uri(): string {
        return this._uri;
    }

    get options(): { [key: string]: any } {
        return this._options;
    }
}

class Register implements Message {
    static TYPE: number = 64;
    static TEXT: string = "REGISTER";

    static VALIDATION_SPEC = new ValidationSpec(
        4,
        4,
        Register.TEXT,
        {1: validateRequestID, 2: validateOptions, 3: validateUri},
    )

    constructor(private readonly _fields: IRegisterFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get uri(): string {
        return this._fields.uri;
    }

    get options(): { [key: string]: any } {
        return this._fields.options;
    }

    static parse(msg: any[]): Register {
        const f = validateMessage(msg, Register.TYPE, Register.TEXT, Register.VALIDATION_SPEC)
        return new Register(new RegisterFields(f.requestID, f.uri, f.options));
    }

    marshal(): any[] {
        return [Register.TYPE, this.requestID, this.options, this.uri];
    }

    type(): number {
        return Register.TYPE;
    }
}

export {Register, RegisterFields};
