import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {validateMessage, validateOptions, validateRequestID} from "./util";

interface ICancelFields {
    readonly requestID: number;
    readonly options: { [key: string]: any };
}

class CancelFields implements ICancelFields {
    private readonly _options: { [key: string]: any }
    constructor (private readonly _requestID: number, options: { [key: string]: any }) {
        this._options = options === null ? {} : options;
    }

    get requestID(): number {
        return this._requestID;
    }

    get options(): { [key: string]: any } {
        return this._options;
    }
}

class Cancel implements Message {
    static TYPE: number = 49;
    static TEXT: string = "CANCEL";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Cancel.TEXT,
        {1: validateRequestID, 2: validateOptions},
    )

    constructor(private readonly _fields: ICancelFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get options(): { [key: string]: any } {
        return this._fields.options;
    }

    static parse(msg: any[]): Cancel {
        const f = validateMessage(msg, Cancel.TYPE, Cancel.TEXT, Cancel.VALIDATION_SPEC)
        return new Cancel(new CancelFields(f.requestID, f.options));
    }

    marshal(): any[] {
        return [Cancel.TYPE, this.requestID, this.options];
    }

    type(): number {
        return Cancel.TYPE;
    }
}

export {Cancel, CancelFields};
