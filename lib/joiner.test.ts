import {Joiner} from "./joiner";
import {Welcome, WelcomeFields} from "./messages/welcome";
import {Challenge, ChallengeFields} from "./messages/challenge";
import {Abort, AbortFields} from "./messages/abort";
import {SessionNotReady, ApplicationError} from "./exception";
import {JSONSerializer} from "./serializers/json";
import {Hello} from "./messages/hello";
import {clientRoles} from "./joiner";
import {TicketAuthenticator} from "./auth/ticket";
import {Authenticate} from "./messages/authenticate";

const testRealm = "test.realm";
const testSessionID = 12345;
const testAuthID = "test_authid";
const testAuthRole = "test_role";
const testAuthMethod = "anonymous";

describe("Joiner", () => {
    test("sendHello", () => {
        const joiner = new Joiner(testRealm);
        const serialized = joiner.sendHello();

        const deserialized = new JSONSerializer().deserialize(serialized as string);
        expect(deserialized).toBeInstanceOf(Hello);

        const hello = deserialized as Hello;
        expect(hello.realm).toEqual(testRealm);
        expect(hello.authmethods[0]).toEqual("anonymous");
        expect(hello.roles).toEqual(clientRoles);
    });

    test("receiveWelcomeMessage", async () => {
        const joiner = new Joiner(testRealm);
        joiner.sendHello();

        const welcome = new Welcome(new WelcomeFields(testSessionID, clientRoles, testAuthID, testAuthRole, testAuthMethod));
        const serialized = new JSONSerializer().serialize(welcome);

        const result = await joiner.receive(serialized);
        expect(result).toBeNull();

        const session = joiner.getSessionDetails();
        expect(session.sessionID).toEqual(testSessionID);
        expect(session.realm).toEqual(testRealm);
        expect(session.authid).toEqual(testAuthID);
        expect(session.authrole).toEqual(testAuthRole);
    });

    test("receiveChallengeMessage", async () => {
        const authenticator = new TicketAuthenticator(testAuthID, "test", {});
        const joiner = new Joiner(testRealm, new JSONSerializer(), authenticator);
        joiner.sendHello();

        const challenge = new Challenge(new ChallengeFields("ticket", {challenge: "123456"}));
        const serializedChallenge = new JSONSerializer().serialize(challenge);

        const result = await joiner.receive(serializedChallenge);
        expect(result).not.toBeNull();

        const deserializedResult = new JSONSerializer().deserialize(result! as string);
        expect(deserializedResult).toBeInstanceOf(Authenticate);

        expect(() => joiner.getSessionDetails()).toThrow(SessionNotReady);

        const welcome = new Welcome(new WelcomeFields(testSessionID, clientRoles, testAuthID, testAuthRole, testAuthMethod));
        const serializedWelcome = new JSONSerializer().serialize(welcome);
        const finalResult = await joiner.receive(serializedWelcome);
        expect(finalResult).toBeNull();

        const session = joiner.getSessionDetails();
        expect(session.sessionID).toEqual(testSessionID);
        expect(session.realm).toEqual(testRealm);
        expect(session.authid).toEqual(testAuthID);
        expect(session.authrole).toEqual(testAuthRole);
    });

    test("receiveAbortMessage", async () => {
        const joiner = new Joiner(testRealm);
        joiner.sendHello();

        const abort = new Abort(new AbortFields({}, "some.reason"));
        const serialized = new JSONSerializer().serialize(abort);

        await expect(joiner.receive(serialized)).rejects.toThrow(ApplicationError);
    });
});
