import {ClientAuthenticator} from "./authenticator";
import {Authenticate} from "../messages/authenticate";
import {Challenge} from "../messages/challenge";

export class Anonymous implements ClientAuthenticator {
    _authExtra: object;
    _authID: string;
    _authMethod: string = "anonymous";

    constructor(authID: string, authExtra: object) {
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
        return this._authMethod;
    }
}
