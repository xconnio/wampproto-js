import {pack, Unpackr} from 'msgpackr';

import {Message} from "../messages/message";
import {Serializer, ToMessage} from "./serializer";


class MsgPackSerializer implements Serializer {
    private _unpackr = new Unpackr({"int64AsType": "number", "mapsAsObjects": true});

    serialize(message: Message): Uint8Array {
        return pack(message.marshal());
    }

    deserialize(data: Uint8Array): Message {
        const wampMsg: any[] = this._unpackr.unpack(data);
        return ToMessage(wampMsg)
    }
}

export {
    MsgPackSerializer
}
