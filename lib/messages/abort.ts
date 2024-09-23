import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {validateArgs, validateDetails, validateKwArgs, validateMessage, validateReason} from "./util";

interface IAbortFields {
    readonly details: { [key: string]: any };
    readonly reason: string;
    readonly args: string[] | null;
    readonly kwargs: { [key: string]: any } | null;
}

class AbortFields implements IAbortFields {
    constructor (
        private readonly _details: { [key: string]: any },
        private readonly _reason: string,
        private readonly _args: string[] | null = null,
        private readonly _kwargs: { [key: string]: any } | null = null,
        ) {}

    get details(): { [key: string]: any } {
        return this._details;
    }

    get reason(): string {
        return this._reason;
    }

    get args(): string[] | null {
        return this._args;
    }

    get kwargs(): { [key: string]: any } | null {
        return this._kwargs;
    }
}

class Abort implements Message {
    static TYPE: number = 3;
    static TEXT: string = "ABORT";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        5,
        Abort.TEXT,
        {1: validateDetails, 2: validateReason, 3: validateArgs, 4: validateKwArgs},
    )

    constructor(private readonly _fields: IAbortFields) {}

    get details(): { [key: string]: any } {
        return this._fields.details;
    }

    get reason(): string {
        return this._fields.reason;
    }

    get args(): string[] | null {
        return this._fields.args;
    }

    get kwargs(): { [key: string]: any } | null {
        return this._fields.kwargs;
    }

    static parse(msg: any[]): Abort {
        const f = validateMessage(msg, Abort.TYPE, Abort.TEXT, Abort.VALIDATION_SPEC)
        return new Abort(new AbortFields(f.details, f.reason, f.args, f.kwargs));
    }

    marshal(): any[] {
        return [Abort.TYPE, this.details, this.reason];
    }

    type(): number {
        return Abort.TYPE;
    }
}

export {Abort, AbortFields};
