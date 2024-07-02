import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Error, ErrorFields} from "../../../lib/messages/error";

function isEqual(msg1: Error, msg2: any): boolean {
    return (
        msg1.messageType === msg2.messageType &&
        msg1.requestID === msg2.requestID &&
        deepEqual(msg1.details, msg2.details) &&
        deepEqual(msg1.args, msg2.args) &&
        deepEqual(msg1.kwargs, msg2.kwargs) &&
        msg1.payload == msg2.payload &&
        msg1.payloadSerializer == msg2.payloadSerializer
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const error = new Error(new ErrorFields(1, 2, "io.xconn.test"));
        const command = `wampproto message error ${error.messageType} ${error.requestID} ${error.uri} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(error, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const error = new Error(new ErrorFields(1, 2, "io.xconn.test"));
        const command = `wampproto message error ${error.messageType} ${error.requestID} ${error.uri} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(error, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const error = new Error(new ErrorFields(1, 2, "io.xconn.test"));
        const command = `wampproto message error ${error.messageType} ${error.requestID} ${error.uri} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(error, message)).toBeTruthy();
    });

    it('JSON Serializer with args, kwargs', async function () {
        const error = new Error(new ErrorFields(1, 3, "io.xconn.test", ["abc"], {"a": "b"}, {"detail": "time"}));
        const command = `wampproto message error ${error.messageType} ${error.requestID} ${error.uri} abc -k a=b -d detail=time --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(error, message)).toBeTruthy();
    });
});
