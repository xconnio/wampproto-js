import {runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Unsubscribed, UnsubscribedFields} from "../../../lib/messages/unsubscribed";

function isEqual(msg1: Unsubscribed, msg2: any): boolean {
    return msg1.requestID === msg2.requestID;
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const unsubscribed = new Unsubscribed((new UnsubscribedFields(1)));
        const command = `wampproto message unsubscribed ${unsubscribed.requestID} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(unsubscribed, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const unsubscribed = new Unsubscribed(new UnsubscribedFields(1));
        const command = `wampproto message unsubscribed ${unsubscribed.requestID} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(unsubscribed, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const unsubscribed = new Unsubscribed(new UnsubscribedFields(1));
        const command = `wampproto message unsubscribed ${unsubscribed.requestID} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(unsubscribed, message)).toBeTruthy();
    });
});
