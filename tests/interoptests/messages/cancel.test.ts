import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Cancel, CancelFields} from "../../../lib/messages/cancel";

function isEqual(msg1: Cancel, msg2: any): boolean {
    return (
        msg1.requestID === msg2.requestID &&
        deepEqual(msg1.options, msg2.options)
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const cancel = new Cancel(new CancelFields(1, {"a": "b"}));
        const command = `wampproto message cancel ${cancel.requestID} -o a=b --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(cancel, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const cancel = new Cancel(new CancelFields(1, {"a": "b"}));
        const command = `wampproto message cancel ${cancel.requestID} -o a=b --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(cancel, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const cancel = new Cancel(new CancelFields(1, {"a": "b"}));
        const command = `wampproto message cancel ${cancel.requestID} -o a=b --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(cancel, message)).toBeTruthy();
    });
});
