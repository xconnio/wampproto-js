import {ClientAuthenticator} from "./authenticator";
import {Authenticate} from "../messages/authenticate";
import {Challenge} from "../messages/challenge";

export class Anonymous implements ClientAuthenticator {
    static TYPE = "anonymous"

    _authExtra: object;
    _authID: string;

    constructor(authID: string, authExtra: object) {
        if (authExtra == null) {
            authExtra = {};
        }
        this._authID = authID;
        this._authExtra = authExtra;
    }

    authenticate(challenge: Challenge): Authenticate {
        throw new Error("authenticate() must not be called for anonymous authentication");
    }

    get authExtra(): object {
        return this._authExtra;
    }

    get authID(): string {
        return this._authID;
    }

    get authMethod(): string {
        return Anonymous.TYPE;
    }
}
