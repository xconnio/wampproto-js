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
    caller: {features: {progressive_call_invocations: true}},
    callee: {features: {progressive_call_invocations: true, progressive_call_results: true, call_canceling: true}},
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

    async receive(data: string | Uint8Array) {
        const receivedMessage: Message = this._serializer.deserialize(data)
        const toSend: Message = await this.receiveMessage(receivedMessage);
        if (toSend !== null && toSend.type() === Authenticate.TYPE) {
            return this._serializer.serialize(toSend);
        }

        return null;
    }

    async receiveMessage(msg: Message): Promise<Message | null> {
        switch (msg.type()) {
            case Welcome.TYPE: {
                const welcome = msg as Welcome;

                if (this._state !== Joiner.stateHelloSent &&
                    this._state !== Joiner.stateAuthenticateSent) {
                    throw Error("received welcome when it was not expected");
                }

                this._sessionDetails = new SessionDetails(
                    welcome.sessionID,
                    this._realm,
                    welcome.authID,
                    welcome.authrole
                );

                this._state = Joiner.stateJoined;
                return null;
            }

            case Challenge.TYPE: {
                const challenge = msg as Challenge;

                if (this._state !== Joiner.stateHelloSent) {
                    throw Error("received challenge when it was not expected");
                }

                const authenticate = await this._authenticator.authenticate(challenge);
                this._state = Joiner.stateAuthenticateSent;
                return authenticate;
            }

            case Abort.TYPE: {
                const abort = msg as Abort;
                throw new ApplicationError(abort.reason, abort.args, abort.kwargs);
            }

            default:
                throw Error(`received ${msg.type()} message and session is not established yet`);
        }
    }

    getSessionDetails(): SessionDetails {
        if (this._sessionDetails === undefined || this._sessionDetails === null) {
            throw new SessionNotReady("session is not set up yet");
        }

        return this._sessionDetails;
    }
}
