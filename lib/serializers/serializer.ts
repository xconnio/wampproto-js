import Message from "../messages/message";
import {Hello} from "../messages/hello";
import {Welcome} from "../messages/welcome";
import {Abort} from "../messages/abort";
import {Challenge} from "../messages/challenge";
import {Authenticate} from "../messages/authenticate";
import {Goodbye} from "../messages/goodbye";
import {Call} from "../messages/call";
import {Invocation} from "../messages/invocation";
import {Yield} from "../messages/yield";
import {Result} from "../messages/result";
import {Register} from "../messages/register";
import {Registered} from "../messages/registered";
import {Unregister} from "../messages/unregister";
import {Unregistered} from "../messages/unregistered";
import {Subscribe} from "../messages/subscribe";
import {Subscribed} from "../messages/subscribed";
import {Unsubscribe} from "../messages/unsubscribe";
import {Unsubscribed} from "../messages/unsubscribed";
import {Publish} from "../messages/publish";
import {Published} from "../messages/published";
import {Event} from "../messages/event";
import {Error as Error_} from "../messages/error";
import {Cancel} from "../messages/cancel";
import {Interrupt} from "../messages/interrupt";

interface Serializer {
    serialize(message: Message): Uint8Array | string;

    deserialize(data: Uint8Array | string): Message;
}

function ToMessage(wampMsg: any[]): Message {
    switch (wampMsg[0]) {
        case Hello.TYPE:
            return Hello.parse(wampMsg);
        case Welcome.TYPE:
            return Welcome.parse(wampMsg);
        case Abort.TYPE:
            return Abort.parse(wampMsg);
        case Challenge.TYPE:
            return Challenge.parse(wampMsg);
        case Authenticate.TYPE:
            return Authenticate.parse(wampMsg);
        case Goodbye.TYPE:
            return Goodbye.parse(wampMsg);
        case Call.TYPE:
            return Call.parse(wampMsg);
        case Invocation.TYPE:
            return Invocation.parse(wampMsg);
        case Yield.TYPE:
            return Yield.parse(wampMsg);
        case Result.TYPE:
            return Result.parse(wampMsg);
        case Register.TYPE:
            return Register.parse(wampMsg);
        case Registered.TYPE:
            return Registered.parse(wampMsg);
        case Unregister.TYPE:
            return Unregister.parse(wampMsg);
        case Unregistered.TYPE:
            return Unregistered.parse(wampMsg);
        case Subscribe.TYPE:
            return Subscribe.parse(wampMsg);
        case Subscribed.TYPE:
            return Subscribed.parse(wampMsg);
        case Unsubscribe.TYPE:
            return Unsubscribe.parse(wampMsg);
        case Unsubscribed.TYPE:
            return Unsubscribed.parse(wampMsg);
        case Publish.TYPE:
            return Publish.parse(wampMsg);
        case Published.TYPE:
            return Published.parse(wampMsg);
        case Event.TYPE:
            return Event.parse(wampMsg);
        case Error_.TYPE:
            return Error_.parse(wampMsg);
        case Cancel.TYPE:
            return Cancel.parse(wampMsg);
        case Interrupt.TYPE:
            return Interrupt.parse(wampMsg);
        default:
            throw new Error("unknown message: " + wampMsg[0]);
    }
}

export {
    Serializer,
    ToMessage
}
