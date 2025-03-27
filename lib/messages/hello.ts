import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {validateHelloDetails, validateMessage, validateRealm} from "./util";

interface IHelloFields {
    readonly realm: string;
    readonly roles: { [key: string]: any },
    readonly authid: string;
    readonly authmethods: string[];
    readonly authextra: { [key: string]: any };
}

class HelloFields implements IHelloFields {
    constructor(
        private readonly _realm: string,
        private readonly _roles: { [key: string]: any },
        private readonly _authid: string | null = null,
        private readonly _authmethods: string[] | null = null,
        private readonly _authextra: { [key: string]: any } | null = null
    ) {}

    get realm(): string {
        return this._realm;
    }

    get roles(): { [key: string]: any } {
        return this._roles;
    }

    get authid(): string {
        return this._authid;
    }

    get authmethods(): string[] {
        return this._authmethods;
    }

    get authextra(): { [key: string]: any } {
        return this._authextra;
    }
}

class Hello implements Message {
    static TYPE: number = 1;
    static TEXT: string = "HELLO";
    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Hello.TEXT,
        {1: validateRealm, 2: validateHelloDetails}
    )

    constructor(private readonly _fields: IHelloFields) {}

    get realm(): string {
        return this._fields.realm;
    }

    get roles(): { [key: string]: any } {
        return this._fields.roles;
    }

    get authID(): string {
        return this._fields.authid;
    }

    get authmethods(): string[] {
        return this._fields.authmethods;
    }

    get authextra(): { [key: string]: any } {
        return this._fields.authextra;
    }

    static parse(msg: any[]): Hello {
        const f = validateMessage(msg, Hello.TYPE, Hello.TEXT, Hello.VALIDATION_SPEC)
        return new Hello(new HelloFields(f.realm, f.roles, f.authid, f.authmethods, f.authextra));
    }

    marshal(): any[] {
        const details: { [key: string]: any} = {"roles": this.roles}
        if (this.authID) {
            details["authid"] = this.authID;
        }
        if (this.authextra) {
            details["authextra"] = this.authextra;
        }

        if (this.authmethods) {
            details["authmethods"] = this.authmethods;
        }

        return [Hello.TYPE, this.realm, details]
    }

    type(): number {
        return Hello.TYPE;
    }
}

export {Hello, HelloFields};
