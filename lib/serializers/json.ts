import {Message} from "../messages/message";
import {Serializer, ToMessage} from "./serializer";


class JSONSerializer implements Serializer {
    serialize(message: Message): string {
        return JSON.stringify(message.marshal());
    }

    deserialize(data: string): Message {
        const wampMsg: any[] = JSON.parse(data)
        return ToMessage(wampMsg)
    }
}

export {
    JSONSerializer
}
