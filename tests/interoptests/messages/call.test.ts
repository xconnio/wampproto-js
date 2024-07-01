import {Call, CallFields} from "../../../lib/messages/call";
import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";

const TEST_PROCEDURE: string = "io.xconn.test";

function isEqual(msg1: Call, msg2: any): boolean {
    return (
        msg1.requestID === msg2.requestID &&
        msg1.uri === msg2.uri &&
        deepEqual(msg1.options, msg2.options) &&
        deepEqual(msg1.args, msg2.args) &&
        deepEqual(msg1.kwargs, msg2.kwargs) &&
        msg1.payload == msg2.payload &&
        msg1.payloadSerializer == msg2.payloadSerializer
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const call = new Call(new CallFields(1, TEST_PROCEDURE));
        const command = `wampproto message call ${call.requestID} ${call.uri} --serializer json`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');
        const jsonStr = outputBytes.toString('utf-8');

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(jsonStr);

        expect(isEqual(call, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const call = new Call(new CallFields(1, TEST_PROCEDURE));
        const command = `wampproto message call ${call.requestID} ${call.uri} --serializer cbor`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(call, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const call = new Call(new CallFields(1, TEST_PROCEDURE));
        const command = `wampproto message call ${call.requestID} ${call.uri} --serializer msgpack`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(call, message)).toBeTruthy();
    });

    it('JSON Serializer with args, kwargs', async function () {
        const call = new Call(new CallFields(1, TEST_PROCEDURE, ["abc"], {"a": "b"}));
        const command = `wampproto message call ${call.requestID} ${call.uri} abc -k a=b --serializer json`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');
        const jsonStr = outputBytes.toString('utf-8');

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(jsonStr);

        expect(isEqual(call, message)).toBeTruthy();
    });
});
