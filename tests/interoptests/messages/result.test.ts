import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Result, ResultFields} from "../../../lib/messages/result";

function isEqual(msg1: Result, msg2: any): boolean {
    return (
        msg1.requestID === msg2.requestID &&
        deepEqual(msg1.options, msg2.options) &&
        deepEqual(msg1.args, msg2.args) &&
        deepEqual(msg1.kwargs, msg2.kwargs) &&
        msg1.payload == msg2.payload &&
        msg1.payloadSerializer == msg2.payloadSerializer
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const result = new Result(new ResultFields(1));
        const command = `wampproto message result ${result.requestID} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(result, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const result = new Result(new ResultFields(2));
        const command = `wampproto message result ${result.requestID} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(result, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const result = new Result(new ResultFields(2));
        const command = `wampproto message result ${result.requestID} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(result, message)).toBeTruthy();
    });

    it('JSON Serializer with args, kwargs', async function () {
        const result = new Result(new ResultFields(2,  ["abcd"], {"a": "b"}));
        const command = `wampproto message result ${result.requestID} abcd -k a=b --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(result, message)).toBeTruthy();
    });
});
