import {Message} from "./message";
import {ValidationSpec} from "./validation-spec";
import {
    validateMessage,
    validatePublicationID,
    validateRequestID,
} from "./util";

interface IPublishedFields {
    readonly requestID: number;
    readonly publicationID: number;
}

class PublishedFields implements IPublishedFields {
    constructor (private readonly _requestID: number, private readonly _publicationID: number) {}

    get requestID(): number {
        return this._requestID;
    }

    get publicationID(): number {
        return this._publicationID;
    }
}

class Published implements Message {
    static TYPE: number = 17;
    static TEXT: string = "PUBLISHED";

    static VALIDATION_SPEC = new ValidationSpec(
        3,
        3,
        Published.TEXT,
        {1: validateRequestID, 2: validatePublicationID},
    )

    constructor(private readonly _fields: IPublishedFields) {}

    get requestID(): number {
        return this._fields.requestID;
    }

    get publicationID(): number {
        return this._fields.publicationID;
    }

    static parse(msg: any[]): Published {
        const f = validateMessage(msg, Published.TYPE, Published.TEXT, Published.VALIDATION_SPEC)
        return new Published(new PublishedFields(f.requestID, f.publicationID));
    }

    marshal(): any[] {
        return [Published.TYPE, this.requestID, this.publicationID];
    }

    type(): number {
        return Published.TYPE;
    }
}

export {Published, PublishedFields};
