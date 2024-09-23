import { decode, encode } from 'cbor-x';

import {Message} from "../messages/message";
import {Serializer, ToMessage} from "./serializer";


class CBORSerializer implements Serializer {
    serialize(message: Message): Uint8Array {
        return encode(message.marshal());
    }

    deserialize(data: Uint8Array): Message {
        const wampMsg: any[] = decode(data);
        return ToMessage(wampMsg)
    }
}

export {
    CBORSerializer
}
