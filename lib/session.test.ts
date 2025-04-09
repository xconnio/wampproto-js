import {WAMPSession} from "./session";
import {JSONSerializer} from "./serializers/json";
import {Call, CallFields} from "./messages/call";
import {Register, RegisterFields} from "./messages/register";
import {Registered, RegisteredFields} from "./messages/registered";
import {Invocation, InvocationFields} from "./messages/invocation";
import {Yield, YieldFields} from "./messages/yield";
import {Unregister, UnregisterFields} from "./messages/unregister";
import {Unregistered, UnregisteredFields} from "./messages/unregistered";
import {Publish, PublishFields} from "./messages/publish";
import {Published, PublishedFields} from "./messages/published";
import {Subscribe, SubscribeFields} from "./messages/subscribe";
import {Subscribed, SubscribedFields} from "./messages/subscribed";
import {Event, EventFields} from "./messages/event";
import {Unsubscribe, UnsubscribeFields} from "./messages/unsubscribe";
import {Unsubscribed, UnsubscribedFields} from "./messages/unsubscribed";
import {Result, ResultFields} from "./messages/result";
import {Error as Error_, ErrorFields} from "./messages/error";

describe("WAMPSession", () => {
    const serializer = new JSONSerializer();
    const session = new WAMPSession(serializer);

    test("send Register and received Registered", () => {
        const register = new Register(new RegisterFields(2, "io.xconn.test"));
        const toSend = session.sendMessage(register);
        expect(toSend).toEqual(JSON.stringify([Register.TYPE, 2, {}, "io.xconn.test"]));

        const registered = new Registered(new RegisteredFields(2, 3));
        const received = session.receive(serializer.serialize(registered));
        expect(received).toEqual(registered);
    });

    test("send Call and receive Result", () => {
        const call = new Call(new CallFields(10, "io.xconn.test"));
        const toSend = session.sendMessage(call);
        expect(toSend).toBe(JSON.stringify([Call.TYPE, 10, {}, "io.xconn.test"]));

        const result = new Result(new ResultFields(10));
        const received = session.receive(serializer.serialize(result));
        expect(received).toEqual(result);
    });

    test("receive Invocation and send Yield", () => {
        // register a procedure
        session.sendMessage(new Register(new RegisterFields(2, "io.xconn.test")));
        session.receive(serializer.serialize(new Registered(new RegisteredFields(2, 3))));

        const invocation = new Invocation(new InvocationFields(4, 3));
        const receivedInvocation = session.receive(serializer.serialize(invocation));
        expect(receivedInvocation).toEqual(invocation);

        const yieldMsg = new Yield(new YieldFields(4));
        const toSend = session.sendMessage(yieldMsg);
        expect(toSend).toBe(JSON.stringify([Yield.TYPE, 4, {}]));
    });

    test("send Unregister and receive Unregistered", () => {
        // register a procedure
        session.sendMessage(new Register(new RegisterFields(2, "io.xconn.test")));
        session.receive(serializer.serialize(new Registered(new RegisteredFields(2, 3))));

        const unregister = new Unregister(new UnregisterFields(3, 3));
        const toSend = session.sendMessage(unregister);
        expect(toSend).toBe(JSON.stringify([Unregister.TYPE, 3, 3]));

        const unregistered = new Unregistered(new UnregisteredFields(3));
        const received = session.receive(serializer.serialize(unregistered));
        expect(received).toEqual(unregistered);
    });

    test("send Publish with acknowledge and receive Published", () => {
        const publish = new Publish(new PublishFields(6, "topic", null, null, {acknowledge: true}));
        const toSend = session.sendMessage(publish);
        expect(toSend).toBe(JSON.stringify([Publish.TYPE, 6, {acknowledge: true}, "topic"]));

        const published = new Published(new PublishedFields(6, 6));
        const received = session.receive(serializer.serialize(published));
        expect(received).toEqual(published);
    });

    test("send Subscribe and receive Subscribed/Event", () => {
        const subscribe = new Subscribe(new SubscribeFields(7, "topic"));
        const toSend = session.sendMessage(subscribe);
        expect(toSend).toBe(JSON.stringify([Subscribe.TYPE, 7, {}, "topic"]));

        const subscribed = new Subscribed(new SubscribedFields(7, 8));
        const received = session.receive(serializer.serialize(subscribed));
        expect(received).toEqual(subscribed);

        const event = new Event(new EventFields(8, 6));
        const receivedEvent = session.receive(serializer.serialize(event));
        expect(receivedEvent).toEqual(event);
    });

    test("send Unsubscribe and receive Unsubscribed", () => {
        // subscribe a topic
        session.sendMessage(new Subscribe(new SubscribeFields(7, "topic")));
        session.receive(serializer.serialize(new Subscribed(new SubscribedFields(7, 8))));

        const unsubscribe = new Unsubscribe(new UnsubscribeFields(9, 8));
        const toSend = session.sendMessage(unsubscribe);
        expect(toSend).toBe(JSON.stringify([Unsubscribe.TYPE, 9, 8]));

        const unsubscribed = new Unsubscribed(new UnsubscribedFields(9));
        const received = session.receive(serializer.serialize(unsubscribed));
        expect(received).toEqual(unsubscribed);
    });

    test("sendError", () => {
        const error = new Error_(new ErrorFields(Invocation.TYPE, 10, "errorProcedureAlreadyExists"));
        const toSend = session.sendMessage(error);
        expect(toSend).toEqual(`[${Error_.TYPE},${Invocation.TYPE},${error.requestID},{},"${error.uri}"]`);
    });

    test('receiveError', () => {
        // send Call message and receive Error for that Call
        const call = new Call(new CallFields(1, "io.xconn.test"));
        session.sendMessage(call);

        const callErr = new Error_(new ErrorFields(Call.TYPE, call.requestID, "errorInvalidArgument"));
        const received = session.receive(serializer.serialize(callErr));
        expect(received).toEqual(callErr);

        // send Register message and receive Error for that Register
        const register = new Register(new RegisterFields(2, "io.xconn.test"));
        session.sendMessage(register);

        const registerErr = new Error_(new ErrorFields(Register.TYPE, register.requestID, "errorInvalidArgument"));
        const receivedRegisterError = session.receive(serializer.serialize(registerErr));
        expect(receivedRegisterError).toEqual(registerErr);

        // send Unregister message and receive Error for that Unregister
        const unregister = new Unregister(new UnregisterFields(3, 3));
        session.sendMessage(unregister);

        const unregisterErr = new Error_(new ErrorFields(Unregister.TYPE, unregister.requestID, "errorInvalidArgument"));
        const receivedUnregisterError = session.receive(serializer.serialize(unregisterErr));
        expect(receivedUnregisterError).toEqual(unregisterErr);

        // send Subscribe message and receive Error for that Subscribe
        const subscribe = new Subscribe(new SubscribeFields(7, "topic"));
        session.sendMessage(subscribe);

        const subscribeError = new Error_(new ErrorFields(Subscribe.TYPE, subscribe.requestID, "errorInvalidArgument"));
        const receivedSubscribedError = session.receive(serializer.serialize(subscribeError))
        expect(receivedSubscribedError).toEqual(subscribeError);

        // send Unsubscribe message and receive Error for that Unsubscribe
        const unsubscribe = new Unsubscribe(new UnsubscribeFields(8, 8));
        session.sendMessage(unsubscribe);

        const unsubscribeError = new Error_(new ErrorFields(Unsubscribe.TYPE, unsubscribe.requestID, "errorInvalidArgument"));
        const receivedUnsubscribeError = session.receive(serializer.serialize(unsubscribeError));
        expect(receivedUnsubscribeError).toEqual(unsubscribeError);

        // send Publish message and receive Error for that Publish
        const publish = new Publish(new PublishFields(6, "topic", null, null, {acknowledge: true}));
        session.sendMessage(publish);

        const publishError = new Error_(new ErrorFields(Publish.TYPE, publish.requestID, "errorInvalidArgument"));
        const receivedPublishError = session.receive(serializer.serialize(publishError));
        expect(receivedPublishError).toEqual(publishError);
    });

    test('exceptions', () => {
        // send Yield for unknown invocation
        const invalidYield = new Yield(new YieldFields(5));
        expect(() => session.sendMessage(invalidYield)).toThrow(Error);

        // send error for invalid message
        const invalidError = new Error_(new ErrorFields(Register.TYPE, 10, "errorProcedureAlreadyExists"));
        expect(() => session.sendMessage(invalidError)).toThrow(Error);

        // send invalid message
        const invalidMessage = new Registered(new RegisteredFields(11, 12));
        expect(() => session.sendMessage(invalidMessage)).toThrow(Error);

        // receive invalid message
        expect(() => session.receive(serializer.serialize(new Register(new RegisterFields(100, "io.xconn.test"))))).toThrow(Error);

        // receive error for invalid message
        expect(() => session.receive(serializer.serialize(new Error_(new ErrorFields(Registered.TYPE, 100, "errorInvalidArgument"))))).toThrow(Error);

        // receive error for invalid Call id
        expect(() => session.receive(serializer.serialize(new Error_(new ErrorFields(Call.TYPE, 100, "errorInvalidArgument"))))).toThrow(Error);

        // receive error for invalid Register id
        expect(() => session.receive(serializer.serialize(new Error_(new ErrorFields(Register.TYPE, 100, "errorInvalidArgument"))))).toThrow(Error);

        // receive error for invalid Unregister id
        expect(() => session.receive(serializer.serialize(new Error_(new ErrorFields(Unregister.TYPE, 100, "errorInvalidArgument"))))).toThrow(Error);

        // receive error for invalid Subscribe id
        expect(() => session.receive(serializer.serialize(new Error_(new ErrorFields(Subscribe.TYPE, 100, "errorInvalidArgument"))))).toThrow(Error);

        // receive error for invalid Unsubscribe id
        expect(() => session.receive(serializer.serialize(new Error_(new ErrorFields(Unsubscribe.TYPE, 100, "errorInvalidArgument"))))).toThrow(Error);

        // receive error invalid Publish id
        expect(() => session.receive(serializer.serialize(new Error_(new ErrorFields(Publish.TYPE, 100, "errorInvalidArgument"))))).toThrow(Error);
    });
});
