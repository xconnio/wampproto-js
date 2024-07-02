import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Abort, AbortFields} from "../../../lib/messages/abort";

function isEqual(msg1: Abort, msg2: any): boolean {
    return (
        deepEqual(msg1.details, msg2.details) &&
        msg1.reason === msg2.reason
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const abort = new Abort(new AbortFields({"a": "b"}, "error"));
        const command = `wampproto message abort ${abort.reason} -d a=b --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(abort, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const abort = new Abort(new AbortFields({"a": "b"}, "error"));
        const command = `wampproto message abort ${abort.reason} -d a=b --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(abort, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const abort = new Abort(new AbortFields({"a": "b"}, "error"));
        const command = `wampproto message abort ${abort.reason} -d a=b --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(abort, message)).toBeTruthy();
    });
});
