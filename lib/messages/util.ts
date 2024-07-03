import ProtocolError from "./exception";
import ValidationSpec from "./validation-spec";

export const MIN_ID: number = 1
export const MAX_ID: number = 2 ** 53
const STRING: string = "string"
const LIST: string = "list"
const DICT: string = "dict"
const NUMBER: string = "number"
const ALLOWED_ROLES: Set<string> = new Set<string>([
    "callee", "caller", "publisher", "subscriber", "dealer", "broker"
]);


class Fields {
    requestID: number | null = null;
    uri: string | null = null;
    args: any[] | null = null;
    kwargs: { [key: string]: any } | null = null;

    sessionID: number | null = null;

    realm: string | null = null;
    authid: string | null = null;
    authrole: string | null = null;
    authmethod: string | null = null;
    authmethods: string[] | null = null;
    authextra: { [key: string]: any } | null = null;
    roles: { [key: string]: any } | null = null;

    messageType: number | null = null;
    signature: string | null = null;
    reason: string | null = null;
    topic: string | null = null;

    extra: { [key: string]: any } | null = null;
    options: { [key: string]: any } | null = null;
    details: { [key: string]: any } | null = null;

    subscriptionID: number | null = null;
    publicationID: number | null = null;

    registrationID: number | null = null;
}

export function sanityCheck(wampMessage: any[], minLength: number, maxLength: number, expectedID: number, name: string){
    if (wampMessage.length < minLength) {
        throw new ProtocolError(`invalid message length ${wampMessage.length}, must be at least ${minLength}`);
    }

    if (wampMessage.length > maxLength) {
        throw new ProtocolError(`invalid message length ${wampMessage.length}, must be at most ${maxLength}`);
    }

    const messageID = wampMessage[0];
    if (messageID !== expectedID) {
        throw new ProtocolError(`invalid message id ${messageID} for ${name}, expected ${expectedID}`);
    }
}

export function validateIntOrRaise(value: any, index: number, message: string): string | null {
    if (typeof value !== 'number' || !Number.isInteger(value)) {
        return `${message}: value at index ${index} must be of type '${NUMBER}' but was ${typeof value}`
    }

    return null;
}

export function validateStringOrRaise(value: any, index: number, message: string): string | null {
    if (typeof value !== "string") {
        return `${message}: value at index ${index} must be of type '${STRING}' but was ${typeof value}`
    }

    return null;
}

export function validateListOrRaise(value: any, index: number, message: string): string | null {
    if (!Array.isArray(value)) {
        return `${message}: value at index ${index} must be of type '${LIST}' but was ${typeof value}`
    }

    return null;
}

export function validateDictOrRaise(value: any, index: number, message: string): string | null {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return `${message}: value at index ${index} must be of type '${DICT}' but was ${typeof value}`
    }

    return null;
}

export function validateIDOrRaise(value: number, index: number, message: string): string | null {
    const error: string | null = validateIntOrRaise(value, index, message);
    if (error !== null) {
        return error;
    } else if (value < MIN_ID || value > MAX_ID) {
        return `${message}: value at index ${index} must be between '${MIN_ID}' and '${MAX_ID}' but was ${value}`
    }

    return null;
}

export function validateRequestID(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateIDOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.requestID = msg[index];
    return null;
}

export function validateUri(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateStringOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.uri = msg[index];
    return null;
}

export function validateArgs(msg: any[], index: number, fields: Fields, message: string): string | null {
    if (msg.length > index) {
        const error: string | null = validateListOrRaise(msg[index], index, message);
        if (error !== null) {
            return error;
        }

        fields.args = msg[index];
    }

    return null;
}

export function validateKwArgs(msg: any[], index: number, fields: Fields, message: string): string | null {
    if (msg.length > index) {
        const error: string | null = validateDictOrRaise(msg[index], index, message);
        if (error !== null) {
            return error;
        }

        fields.kwargs = msg[index];
    }

    return null;
}

export function validateSessionID(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateIDOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.sessionID = msg[index];
    return null;
}

export function validateRealm(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateStringOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.realm = msg[index];
    return null;
}

export function validateAuthID(details: { [key: string]:any}, index: number, fields: Fields, message: string): string | null {
    const authid = details?.authid ?? null;
    if (authid !== null) {
        const error: string | null = validateStringOrRaise(authid, index, message);
        if (error !== null) {
            return `${message}: value at index ${index} for key 'authid' must be of type '${STRING}' 
            but was ${typeof authid}`
        }

        fields.authid = authid;
    }

    return null;
}

export function validateAuthRole(details: { [key: string]:any}, index: number, fields: Fields, message: string): string | null {
    const authrole = details?.authrole ?? null;
    if (authrole !== null) {
        const error: string | null = validateStringOrRaise(authrole, index, message);
        if (error !== null) {
            return `${message}: value at index ${index} for key 'authrole' must be of type '${STRING}' 
            but was ${typeof authrole}`
        }

        fields.authrole = authrole;
    }

    return null;
}

export function validateAuthMethod(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateStringOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.authmethod = msg[index];
    return null;
}

export function validateAuthMethods(details: { [key: string]:any}, index: number, fields: Fields, message: string): string | null {
    const authmethods = details?.authmethods ?? null;
    if (authmethods !== null) {
        const error: string | null = validateListOrRaise(authmethods, index, message);
        if (error !== null) {
            return `${message}: value at index ${index} for key 'authmethods' must be of type '${LIST}' 
            but was ${typeof authmethods}`
        }

        fields.authmethods = authmethods;
    }

    return null;
}

export function validateWelcomeAuthMethod(details: { [key: string]:any}, index: number, fields: Fields, message: string): string | null {
    const authmethod = details?.authmethod ?? null;
    if (authmethod !== null) {
        const error: string | null = validateStringOrRaise(authmethod, index, message);
        if (error !== null) {
            return `${message}: value at index ${index} for key 'authmethod' must be of type '${STRING}' 
            but was ${typeof authmethod}`
        }

        fields.authmethod = authmethod;
    }

    return null;
}

export function validateAuthExtra(details: { [key: string]:any}, index: number, fields: Fields, message: string): string | null {
    const authextra = details?.authextra ?? null;
    if (authextra !== null) {
        const error: string | null = validateDictOrRaise(authextra, index, message);
        if (error !== null) {
            return `${message}: value at index ${index} for key 'authextra' must be of type '${DICT}' 
            but was ${typeof authextra}`
        }

        fields.authextra = authextra;
    }

    return null;
}

export function validateRoles(details: { [key: string]:any}, index: number, fields: Fields, message: string) {
    const roles = details?.roles ?? null;
    const error: string | null = validateDictOrRaise(roles, index, message);
    if (error !== null) {
        return `${message}: value at index ${index} for key 'roles' must be of type '${DICT}' but was ${typeof roles}`
    }

    for (const role of Object.keys(roles)) {
        if (!ALLOWED_ROLES.has(role)) {
            return `${message}: value at index ${index} for roles key must be in ${ALLOWED_ROLES} but was ${role}`
        }
    }

    fields.roles = roles;
    return null;
}

export function validateMessageType(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateIntOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.messageType = msg[index];
    return null;
}

export function validateSignature(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateStringOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.signature = msg[index];
    return null;
}

export function validateReason(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateStringOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.reason = msg[index];
    return null;
}

export function validateTopic(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateStringOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.topic = msg[index];
    return null;
}

export function validateExtra(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateDictOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.extra = msg[index];
    return null;
}

export function validateOptions(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateDictOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.options = msg[index];
    return null;
}

export function validateDetails(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateDictOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.details = msg[index];
    return null;
}

export function validateHelloDetails(msg: any[], index: number, fields: Fields, message: string): string | string[] | null {
    const errors: string[] = [];
    const error: string | null = validateDictOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    const authIDError: string | null = validateAuthID(msg[index], index, fields, message);
    if (authIDError !== null) {
        errors.push(authIDError);
    }

    const authRoleError: string | null = validateAuthRole(msg[index], index, fields, message);
    if (authRoleError !== null) {
        errors.push(authRoleError);
    }

    const authMethodsError: string | null = validateAuthMethods(msg[index], index, fields, message);
    if (authMethodsError !== null) {
        errors.push(authMethodsError);
    }

    const rolesError: string | null = validateRoles(msg[index], index, fields, message);
    if (rolesError !== null) {
        errors.push(rolesError);
    }

    const authExtraError: string | null = validateAuthExtra(msg[index], index, fields, message);
    if (authExtraError !== null) {
        errors.push(authExtraError);
    }

    if (errors.length > 0) {
        return errors
    }

    fields.details = msg[index];
    return null;
}

export function validateWelcomeDetails(msg: any[], index: number, fields: Fields, message: string): string | string[] | null {
    const errors: string[] = [];
    const error: string | null = validateDictOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    const authIDError: string | null = validateAuthID(msg[index], index, fields, message);
    if (authIDError !== null) {
        errors.push(authIDError);
    }

    const authRoleError: string | null = validateAuthRole(msg[index], index, fields, message);
    if (authRoleError !== null) {
        errors.push(authRoleError);
    }

    const rolesError: string | null = validateRoles(msg[index], index, fields, message);
    if (rolesError !== null) {
        errors.push(rolesError);
    }

    const authExtraError: string | null = validateAuthExtra(msg[index], index, fields, message);
    if (authExtraError !== null) {
        errors.push(authExtraError);
    }

    const authMethodError: string | null = validateWelcomeAuthMethod(msg[index], index, fields, message);
    if (authMethodError !== null) {
        errors.push(authMethodError);
    }

    return null;
}

export function validateSubscriptionID(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateIDOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.subscriptionID = msg[index];
    return null;
}

export function validatePublicationID(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateIDOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.publicationID = msg[index];
    return null;
}

export function validateRegistrationID(msg: any[], index: number, fields: Fields, message: string): string | null {
    const error: string | null = validateIDOrRaise(msg[index], index, message);
    if (error !== null) {
        return error;
    }

    fields.registrationID = msg[index];
    return null;
}

export function validateMessage(msg: any[], type: number, name: string, valSpec: ValidationSpec): Fields {
    sanityCheck(msg, valSpec.minLength, valSpec.maxLength, type, name)

    const errors: string[] = [];
    const f = new Fields();
    for (const [idx, func] of Object.entries(valSpec.spec)) {
        const error: string | string[] | null = func(msg, idx, f, valSpec.message)
        if (typeof error === "string") {
            errors.push(error);
        } else if (Array.isArray(error)) {
            errors.push(...error)
        }
    }

    if (errors.length > 0) {
        throw new Error(...errors);
    }

    return f
}
