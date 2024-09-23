import {Challenge} from "../messages/challenge";
import {Authenticate} from "../messages/authenticate";


export interface ClientAuthenticator {
    get authMethod(): string
    get authID(): string
    get authExtra(): object
    authenticate(challenge: Challenge): Authenticate
}
