import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Goodbye, GoodbyeFields} from "../../../lib/messages/goodbye";

function isEqual(msg1: Goodbye, msg2: any): boolean {
    return (
        msg1.reason === msg2.reason &&
        deepEqual(msg1.details, msg2.details)
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const goodbye = new Goodbye(new GoodbyeFields({"new": "detail"}, "timeout"));
        const command = `wampproto message goodbye ${goodbye.reason} -d new=detail --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(goodbye, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const goodbye = new Goodbye(new GoodbyeFields({"new": "detail"}, "timeout"));
        const command = `wampproto message goodbye ${goodbye.reason} -d new=detail --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(goodbye, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const goodbye = new Goodbye(new GoodbyeFields({"new": "detail"}, "timeout"));
        const command = `wampproto message goodbye ${goodbye.reason} -d new=detail --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(goodbye, message)).toBeTruthy();
    });
});
