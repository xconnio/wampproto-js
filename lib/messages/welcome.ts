import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {validateMessage, validateSessionID, validateWelcomeDetails} from "./util";

interface IWelcomeFields {
    readonly sessionID: number;
    readonly roles: { [key: string]: any },
    readonly authid: string;
    readonly authrole: string;
    readonly authmethod: string;
    readonly authextra: { [key: string]: any };
}

class WelcomeFields implements IWelcomeFields {
    constructor(
        private readonly _sessionID: number,
        private readonly _roles: { [key: string]: any },
        private readonly _authid: string | null = null,
        private readonly _authrole: string | null = null,
        private readonly _authmethod: string | null = null,
        private readonly _authextra: { [key: string]: any } | null = null
    ) {}

    get sessionID(): number {
        return this._sessionID;
    }

    get roles(): { [key: string]: any } {
        return this._roles;
    }

    get authid(): string {
        return this._authid;
    }

    get authrole(): string {
        return this._authrole;
    }

    get authmethod(): string {
        return this._authmethod;
    }

    get authextra(): { [key: string]: any } {
        return this._authextra;
    }
}

class Welcome implements Message {
    static TYPE: number = 2;
    static TEXT: string = "WELCOME";
    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Welcome.TEXT,
        {1: validateSessionID, 2: validateWelcomeDetails},
    )

    constructor(private readonly _fields: IWelcomeFields) {}

    get sessionID(): number {
        return this._fields.sessionID;
    }

    get roles(): { [key: string]: any } {
        return this._fields.roles;
    }

    get authID(): string {
        return this._fields.authid;
    }

    get authrole(): string {
        return this._fields.authrole;
    }

    get authmethod(): string {
        return this._fields.authmethod;
    }

    get authextra(): { [key: string]: any } {
        return this._fields.authextra;
    }

    static parse(msg: any[]): Welcome {
        const f = validateMessage(msg, Welcome.TYPE, Welcome.TEXT, Welcome.VALIDATION_SPEC)
        return new Welcome(new WelcomeFields(f.sessionID, f.roles, f.authid, f.authrole, f.authmethod, f.authextra));
    }

    marshal(): any[] {
        const details: { [key: string]: any } = {
            "authid": this.authID,
            "authrole": this.authrole,
            "authmethod": this.authmethod,
            "authextra": this.authextra,
        }

        return [Welcome.TYPE, this.sessionID, details]
    }

    type(): number {
        return Welcome.TYPE;
    }
}

export {Welcome, WelcomeFields};
