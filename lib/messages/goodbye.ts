import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {validateDetails, validateMessage, validateReason} from "./util";

interface IGoodbyeFields {
    readonly details: { [key: string]: any };
    readonly reason: string;
}

class GoodbyeFields implements IGoodbyeFields {
    constructor (private readonly _details: { [key: string]: any }, private readonly _reason: string) {}

    get details(): { [key: string]: any } {
        return this._details;
    }

    get reason(): string {
        return this._reason;
    }
}

class Goodbye implements Message {
    static TYPE: number = 6;
    static TEXT: string = "GOODBYE";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Goodbye.TEXT,
        {1: validateDetails, 2: validateReason},
    )

    constructor(private readonly _fields: IGoodbyeFields) {}

    get details(): { [key: string]: any } {
        return this._fields.details;
    }

    get reason(): string {
        return this._fields.reason;
    }

    static parse(msg: any[]): Goodbye {
        const f = validateMessage(msg, Goodbye.TYPE, Goodbye.TEXT, Goodbye.VALIDATION_SPEC)
        return new Goodbye(new GoodbyeFields(f.details, f.reason));
    }

    marshal(): any[] {
        return [Goodbye.TYPE, this.details, this.reason];
    }

    type(): number {
        return Goodbye.TYPE;
    }
}

export {Goodbye, GoodbyeFields};
