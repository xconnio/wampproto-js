import {ClientAuthenticator} from "./authenticator";
import {Authenticate, AuthenticateFields} from "../messages/authenticate";
import {Challenge} from "../messages/challenge";

export class Ticket implements ClientAuthenticator {
    _authExtra: object;
    _authID: string;
    _authMethod: string = "ticket";
    _ticket: string;

    constructor(authID: string, authExtra: object, ticket: string) {
        this._authID = authID;
        this._authExtra = authExtra;
        this._ticket = ticket;
    }

    authenticate(challenge: Challenge): Authenticate {
        return new Authenticate(new AuthenticateFields(this._ticket))
    }

    get authExtra(): object {
        return this._authExtra;
    }

    get authID(): string {
        return this._authID;
    }

    get authMethod(): string {
        return this._authMethod;
    }
}
