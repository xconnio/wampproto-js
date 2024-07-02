import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Invocation, InvocationFields} from "../../../lib/messages/invocation";

function isEqual(msg1: Invocation, msg2: any): boolean {
    return (
        msg1.requestID === msg2.requestID &&
        msg1.registrationID === msg2.registrationID &&
        deepEqual(msg1.details, msg2.details) &&
        deepEqual(msg1.args, msg2.args) &&
        deepEqual(msg1.kwargs, msg2.kwargs) &&
        msg1.payload == msg2.payload &&
        msg1.payloadSerializer == msg2.payloadSerializer
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const invocation = new Invocation(new InvocationFields(2, 4));
        const command = `wampproto message invocation ${invocation.requestID} ${invocation.registrationID} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(invocation, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const invocation = new Invocation(new InvocationFields(2, 4));
        const command = `wampproto message invocation ${invocation.requestID} ${invocation.registrationID} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(invocation, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const invocation = new Invocation(new InvocationFields(2, 4));
        const command = `wampproto message invocation ${invocation.requestID} ${invocation.registrationID} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(invocation, message)).toBeTruthy();
    });

    it('JSON Serializer with args, kwargs', async function () {
        const invocation = new Invocation(new InvocationFields(2, 4, ["abcd"], {"a": "b"}));
        const command = `wampproto message invocation ${invocation.requestID} ${invocation.registrationID} abcd -k a=b --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(invocation, message)).toBeTruthy();
    });
});
