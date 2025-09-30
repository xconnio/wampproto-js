import {ClientAuthenticator} from "./authenticator";
import {Authenticate, AuthenticateFields} from "../messages/authenticate";
import {Challenge} from "../messages/challenge";

export class TicketAuthenticator implements ClientAuthenticator {
    static TYPE = "ticket"

    _authExtra: object;
    _authID: string;
    _ticket: string;

    constructor(authID: string, ticket: string, authExtra: object) {
        this._authID = authID;
        this._authExtra = authExtra;
        this._ticket = ticket;
    }

    async authenticate(challenge: Challenge): Promise<Authenticate> {
        return new Authenticate(new AuthenticateFields(this._ticket))
    }

    get authExtra(): object {
        return this._authExtra;
    }

    get authID(): string {
        return this._authID;
    }

    get authMethod(): string {
        return TicketAuthenticator.TYPE;
    }
}
