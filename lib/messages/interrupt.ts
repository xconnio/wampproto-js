import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {validateMessage, validateOptions, validateRequestID} from "./util";

interface IInterruptFields {
    readonly requestID: number;
    readonly options: { [key: string]: any };
}

class InterruptFields implements IInterruptFields {
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

class Interrupt implements Message {
    static TYPE: number = 69;
    static TEXT: string = "INTERRUPT";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Interrupt.TEXT,
        {1: validateRequestID, 2: validateOptions},
    )

    constructor(private readonly _fields: IInterruptFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get options(): { [key: string]: any } {
        return this._fields.options;
    }

    static parse(msg: any[]): Interrupt {
        const f = validateMessage(msg, Interrupt.TYPE, Interrupt.TEXT, Interrupt.VALIDATION_SPEC)
        return new Interrupt(new InterruptFields(f.requestID, f.options));
    }

    marshal(): any[] {
        return [Interrupt.TYPE, this.requestID, this.options];
    }

    type(): number {
        return Interrupt.TYPE;
    }
}

export {Interrupt, InterruptFields};
