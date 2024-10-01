import {Serializer} from "./serializers/serializer";
import {JSONSerializer} from "./serializers/json";
import {Message} from "./messages/message";
import {Call} from "./messages/call";
import {Register} from "./messages/register";
import {Unregister} from "./messages/unregister";
import {Yield} from "./messages/yield";
import {Publish} from "./messages/publish";
import {Subscribe} from "./messages/subscribe";
import {Unsubscribe} from "./messages/unsubscribe";
import {Error as Error_} from "./messages/error";
import {Invocation} from "./messages/invocation";
import {Result} from "./messages/result";
import {Registered} from "./messages/registered";
import {Unregistered} from "./messages/unregistered";
import {Published} from "./messages/published";
import {Subscribed} from "./messages/subscribed";
import {Unsubscribed} from "./messages/unsubscribed";
import {Event} from "./messages/event";

export class WAMPSession {
    // data structures for RPC
    private _callRequests: { [key: number]: number } = {};
    private _registerRequests: { [key: number]: number } = {};
    private _registrations: { [key: number]: number } = {};
    private _invocationRequests: { [key: number]: number } = {};
    private _unregisterRequests: { [key: number]: number } = {};

    // data structures for PubSub
    private _publishRequests: { [key: number]: number } = {};
    private _subscribeRequests: { [key: number]: number } = {};
    private _subscriptions: { [key: number]: number } = {};
    private _unsubscribeRequests: { [key: number]: number } = {};

    constructor(private readonly _serializer: Serializer = new JSONSerializer()) {}

    sendMessage(msg: Message): string | Uint8Array {
        if (msg instanceof Call) {
            this._callRequests[msg.requestID] = msg.requestID;
        } else if (msg instanceof Register) {
            this._registerRequests[msg.requestID] = msg.requestID;
        } else if (msg instanceof Unregister) {
            this._unregisterRequests[msg.requestID] = msg.registrationID;
        } else if (msg instanceof Yield) {
            if (!(msg.requestID in this._invocationRequests)) {
                throw Error("cannot yield for unknown invocation request");
            }

            delete this._invocationRequests[msg.requestID];
        } else if (msg instanceof Publish) {
            if (msg.options?.acknowledge ?? false) {
                this._publishRequests[msg.requestID] = msg.requestID;
            }
        } else if (msg instanceof Subscribe) {
            this._subscribeRequests[msg.requestID] = msg.requestID;
        } else if (msg instanceof Unsubscribe) {
            this._unsubscribeRequests[msg.requestID] = msg.subscriptionID;
        } else if (msg instanceof Error_) {
            if (msg.messageType !== Invocation.TYPE) {
                throw Error("send only supported for invocation error");
            }

            delete this._invocationRequests[msg.requestID];
        } else {
            throw Error(`unknown message type ${typeof msg}`);
        }

        return this._serializer.serialize(msg);
    }

    receive(data: string | Uint8Array) {
        const msg = this._serializer.deserialize(data);
        return this.receiveMessage(msg);
    }

    receiveMessage(msg: Message): Message {
        if (msg instanceof Result) {
            try {
                delete this._callRequests[msg.requestID];
            } catch (e) {
                throw Error(`received ${Result.TEXT} for invalid request ID`);
            }
        } else if (msg instanceof Registered) {
            try {
                delete this._registerRequests[msg.requestID];
            } catch (e) {
                throw Error(`received ${Registered.TEXT} for invalid request ID`);
            }

            this._registrations[msg.registrationID] = msg.registrationID;
        } else if (msg instanceof Unregistered) {
            const registrationID: number = this._unregisterRequests[msg.requestID];
            if (registrationID === undefined) {
                throw Error(`received ${Unregistered.TEXT} for invalid request ID`);
            }
            delete this._unregisterRequests[msg.requestID];

            try {
                delete this._registrations[registrationID];
            } catch (e) {
                throw Error(`received ${Unregistered.TEXT} for invalid registration ID`);
            }
        } else if (msg instanceof Invocation) {
            if (!(msg.registrationID in this._registrations)) {
                throw Error(`received ${Invocation.TEXT} for invalid registration ID`);
            }

            this._invocationRequests[msg.requestID] = msg.requestID;
        } else if (msg instanceof Published) {
            try {
                delete this._publishRequests[msg.requestID];
            } catch (e) {
                throw Error(`received ${Published.TEXT} for invalid registration ID`);
            }
        } else if (msg instanceof Subscribed) {
            try {
                delete this._subscribeRequests[msg.requestID];
            } catch (e) {
                throw Error(`received ${Subscribed.TEXT} for invalid request ID`);
            }
            this._subscriptions[msg.subscriptionID] = msg.subscriptionID;
        } else if (msg instanceof Unsubscribed) {
            const subscriptionID: number = this._unsubscribeRequests[msg.requestID];
            if (subscriptionID === undefined) {
                throw Error(`received ${Unsubscribed.TEXT} for invalid request ID`);
            }
            delete this._unsubscribeRequests[msg.requestID];

            try {
                delete this._subscriptions[subscriptionID];
            } catch (e) {
                throw Error(`received ${Unsubscribed.TEXT} for invalid subscription ID`);
            }
        } else if (msg instanceof Event) {
            if (!(msg.subscriptionID in this._subscriptions)) {
                throw Error(`received ${Event.TEXT} for invalid subscription ID`);
            }
        } else if (msg instanceof Error_) {
            switch (msg.messageType) {
                case Call.TYPE:
                    try {
                        delete this._callRequests[msg.requestID];
                    } catch (e) {
                        throw Error(`received ${Error_.TEXT} for invalid call request`);
                    }
                    break;
                case Register.TYPE:
                    try {
                        delete this._registerRequests[msg.requestID];
                    } catch (e) {
                        throw Error(`received ${Error_.TEXT} for invalid register request`);
                    }
                    break;

                case Unregister.TYPE:
                    try {
                        delete this._unregisterRequests[msg.requestID];
                    } catch (e) {
                        throw Error(`received ${Error_.TEXT} for invalid unregister request`);
                    }
                    break;

                case Subscribe.TYPE:
                    try {
                        delete this._subscribeRequests[msg.requestID];
                    } catch (e) {
                        throw Error(`received ${Error_.TEXT} for invalid subscribe request`);
                    }
                    break;

                case Unsubscribe.TYPE:
                    try {
                        delete this._unsubscribeRequests[msg.requestID];
                    } catch (e) {
                        throw Error(`received ${Error_.TEXT} for invalid unsubscribe request`);
                    }
                    break;

                case Publish.TYPE:
                    try {
                        delete this._publishRequests[msg.requestID];
                    } catch (e) {
                        throw Error(`received ${Error_.TEXT} for invalid publish request`);
                    }
                    break;

                default:
                    throw Error(`unknown error message type ${typeof msg}`)
            }
        } else {
            throw Error(`unknown message ${typeof msg}`)
        }

        return msg;
    }
}
