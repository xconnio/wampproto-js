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
    private _callRequests: Set<number> = new Set();
    private _registerRequests: Set<number> = new Set();
    private _registrations: { [key: number]: number } = {};
    private _invocationRequests: Set<number> = new Set();
    private _unregisterRequests: { [key: number]: number } = {};

    // data structures for PubSub
    private _publishRequests: Set<number> = new Set();
    private _subscribeRequests: Set<number> = new Set();
    private _subscriptions: { [key: number]: number } = {};
    private _unsubscribeRequests: { [key: number]: number } = {};

    constructor(private readonly _serializer: Serializer = new JSONSerializer()) {}

    sendMessage(msg: Message): string | Uint8Array {
        if (msg instanceof Call) {
            this._callRequests.add(msg.requestID);
        } else if (msg instanceof Register) {
            this._registerRequests.add(msg.requestID);
        } else if (msg instanceof Unregister) {
            this._unregisterRequests[msg.requestID] = msg.registrationID;
        } else if (msg instanceof Yield) {
            const isDeleted = this._invocationRequests.delete(msg.requestID);
            if (!isDeleted) {
                throw Error("cannot yield for unknown invocation request");
            }
        } else if (msg instanceof Publish) {
            if (msg.options?.acknowledge ?? false) {
                this._publishRequests.add(msg.requestID);
            }
        } else if (msg instanceof Subscribe) {
            this._subscribeRequests.add(msg.requestID);
        } else if (msg instanceof Unsubscribe) {
            this._unsubscribeRequests[msg.requestID] = msg.subscriptionID;
        } else if (msg instanceof Error_) {
            if (msg.messageType !== Invocation.TYPE) {
                throw Error("send only supported for invocation error");
            }

            this._invocationRequests.delete(msg.requestID);
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
            const isDeleted = this._callRequests.delete(msg.requestID);
            if (!isDeleted) {
                throw Error(`received ${Result.TEXT} for invalid request ID`);
            }
        } else if (msg instanceof Registered) {
            const isDeleted = this._registerRequests.delete(msg.requestID);
            if (!isDeleted) {
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

            this._invocationRequests.add(msg.requestID);
        } else if (msg instanceof Published) {
            const isDeleted = this._publishRequests.delete(msg.requestID);
            if (!isDeleted) {
                throw Error(`received ${Published.TEXT} for invalid registration ID`);
            }
        } else if (msg instanceof Subscribed) {
            const isDeleted = this._subscribeRequests.delete(msg.requestID);
            if (!isDeleted) {
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
                case Call.TYPE: {
                    const isCallDeleted = this._callRequests.delete(msg.requestID);
                    if (!isCallDeleted) {
                        throw Error(`received ${Error_.TEXT} for invalid call request`);
                    }
                    break;
                }
                case Register.TYPE: {
                    const isRegDeleted = this._registerRequests.delete(msg.requestID);
                    if (!isRegDeleted) {
                        throw Error(`received ${Error_.TEXT} for invalid register request`);
                    }
                    break;
                }

                case Unregister.TYPE: {
                    if (!(msg.requestID in this._unregisterRequests)) {
                        throw Error(`received ${Error_.TEXT} for invalid unregister request`);
                    }

                    delete this._unregisterRequests[msg.requestID];
                    break;
                }

                case Subscribe.TYPE: {
                    const isSubDeleted = this._subscribeRequests.delete(msg.requestID);
                    if (!isSubDeleted) {
                        throw Error(`received ${Error_.TEXT} for invalid subscribe request`);
                    }
                    break;
                }

                case Unsubscribe.TYPE: {
                    if (!(msg.requestID in this._unsubscribeRequests)) {
                        throw Error(`received ${Error_.TEXT} for invalid unsubscribe request`);
                    }

                    delete this._unsubscribeRequests[msg.requestID];
                    break;
                }

                case Publish.TYPE: {
                    const isPubDeleted = this._publishRequests.delete(msg.requestID);
                    if (!isPubDeleted) {
                        throw Error(`received ${Error_.TEXT} for invalid publish request`);
                    }
                    break;
                }

                default:
                    throw Error(`unknown error message type ${typeof msg}`)
            }
        } else {
            throw Error(`unknown message ${typeof msg}`)
        }

        return msg;
    }
}
