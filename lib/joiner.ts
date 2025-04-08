import {Serializer} from "./serializers/serializer";
import {JSONSerializer} from "./serializers/json";
import {AnonymousAuthenticator} from "./auth/anonymous";
import {ClientAuthenticator} from "./auth/authenticator";
import {SessionDetails} from "./types";
import {Hello, HelloFields} from "./messages/hello";
import {Message} from "./messages/message";
import {Welcome} from "./messages/welcome";
import {Challenge} from "./messages/challenge";
import {Abort} from "./messages/abort";
import {ApplicationError, SessionNotReady} from "./exception";
import {Authenticate} from "./messages/authenticate";

export const clientRoles: { [key: string]: { features: { [key: string]: any } } } = {
    caller: {features: {}},
    callee: {features: {}},
    publisher: {features: {}},
    subscriber: {features: {}},
};

export class Joiner {
    static stateNone: number = 0;
    static stateHelloSent: number = 1;
    static stateAuthenticateSent: number = 2;
    static stateJoined: number = 3;

    private _state: number = Joiner.stateNone;
    private _sessionDetails: SessionDetails;

    constructor(
        private readonly _realm: string,
        private readonly _serializer: Serializer = new JSONSerializer(),
        private readonly _authenticator: ClientAuthenticator = new AnonymousAuthenticator("", {})
    ) {
    }

    sendHello(): string | Uint8Array {
        const hello = new Hello(
            new HelloFields(
                this._realm,
                clientRoles,
                this._authenticator.authID,
                [this._authenticator.authMethod],
                this._authenticator.authExtra,
            )
        );

        this._state = Joiner.stateHelloSent;
        return this._serializer.serialize(hello);
    }

    receive(data: string | Uint8Array) {
        const receivedMessage: Message = this._serializer.deserialize(data)
        const toSend: Message = this.receiveMessage(receivedMessage);
        if (toSend !== null && toSend instanceof Authenticate) {
            return this._serializer.serialize(toSend);
        }

        return null;
    }

    receiveMessage(msg: Message): Message | null {
        if (msg instanceof Welcome) {
            if (this._state !== Joiner.stateHelloSent && this._state !== Joiner.stateAuthenticateSent) {
                throw Error("received welcome when it was not expected")
            }

            this._sessionDetails = new SessionDetails(msg.sessionID, this._realm, msg.authID, msg.authrole);
            this._state = Joiner.stateJoined;
            return null;
        } else if (msg instanceof Challenge) {
            if (this._state !== Joiner.stateHelloSent) {
                throw Error("received challenge when it was not expected");
            }

            const authenticate = this._authenticator.authenticate(msg);
            this._state = Joiner.stateAuthenticateSent;
            return authenticate;
        } else if (msg instanceof Abort) {
            throw new ApplicationError(msg.reason, msg.args, msg.kwargs);
        } else {
            throw Error(`received ${msg.type()} message and session is not established yet`)
        }
    }

    getSessionDetails(): SessionDetails {
        if (this._sessionDetails === undefined || this._sessionDetails === null) {
            throw new SessionNotReady("session is not set up yet");
        }

        return this._sessionDetails;
    }
}
