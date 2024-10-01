import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {validateExtra, validateMessage, validateSignature} from "./util";

interface IAuthenticateFields {
    readonly signature: string;
    readonly extra: { [key: string]: any };
}

class AuthenticateFields implements IAuthenticateFields {
    private readonly _extra: { [key: string]: any };

    constructor(private readonly _signature: string, extra: { [key: string]: any } | null = null) {
        this._extra = extra === null ? {} : extra;
    }

    get signature(): string {
        return this._signature;
    }

    get extra(): { [key: string]: any } {
        return this._extra;
    }
}

class Authenticate implements Message {
    static TYPE: number = 5;
    static TEXT: string = "AUTHENTICATE";
    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Authenticate.TEXT,
        {1: validateSignature, 2: validateExtra},
    )

    constructor(private readonly _fields: IAuthenticateFields) {}

    get signature(): string {
        return this._fields.signature;
    }

    get extra(): { [key: string]: any } {
        return this._fields.extra;
    }

    static parse(msg: any[]): Authenticate {
        const f = validateMessage(msg, Authenticate.TYPE, Authenticate.TEXT, Authenticate.VALIDATION_SPEC);
        return new Authenticate(new AuthenticateFields(f.signature, f.extra));
    }

    marshal(): any[] {
        return [Authenticate.TYPE, this.signature, this.extra];
    }


    type(): number {
        return Authenticate.TYPE;
    }
}

export {Authenticate, AuthenticateFields};
