import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {validateAuthMethod, validateExtra, validateMessage} from "./util";

interface IChallengeFields {
    readonly authmethod: string;
    readonly extra: { [key: string]: any };
}

class ChallengeFields implements IChallengeFields {
    private readonly _extra: { [key: string]: any };

    constructor(private readonly _authmethod: string, extra: { [key: string]: any } | null = null) {
        this._extra = extra === null ? {} : extra;
    }

    get authmethod(): string {
        return this._authmethod;
    }

    get extra(): { [key: string]: any } {
        return this._extra;
    }
}

class Challenge implements Message {
    static TYPE: number = 4;
    static TEXT: string = "CHALLENGE";
    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Challenge.TEXT,
        {1: validateAuthMethod, 2: validateExtra},
    )


    constructor(private readonly _fields: IChallengeFields) {}

    get authmethod(): string {
        return this._fields.authmethod;
    }

    get extra(): { [key: string]: any } {
        return this._fields.extra;
    }

    static parse(msg: any[]): Challenge {
        const f = validateMessage(msg, Challenge.TYPE, Challenge.TEXT, Challenge.VALIDATION_SPEC)
        return new Challenge(new ChallengeFields(f.authmethod, f.extra))
    }

    marshal(): any[] {
        return [Challenge.TYPE, this.authmethod, this.extra];
    }

    type(): number {
        return Challenge.TYPE;
    }
}

export {Challenge, ChallengeFields};
