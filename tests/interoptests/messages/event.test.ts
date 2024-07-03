import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Event, EventFields} from "../../../lib/messages/event";

function isEqual(msg1: Event, msg2: any): boolean {
    return (
        msg1.subscriptionID === msg2.subscriptionID &&
        msg1.publicationID === msg2.publicationID &&
        deepEqual(msg1.details, msg2.details) &&
        deepEqual(msg1.args, msg2.args) &&
        deepEqual(msg1.kwargs, msg2.kwargs) &&
        msg1.payload == msg2.payload &&
        msg1.payloadSerializer == msg2.payloadSerializer
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const event = new Event(new EventFields(1, 3));
        const command = `wampproto message event ${event.subscriptionID} ${event.publicationID} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(event, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const event = new Event(new EventFields(1, 3));
        const command = `wampproto message event ${event.subscriptionID} ${event.publicationID} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(event, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const event = new Event(new EventFields(1, 3));
        const command = `wampproto message event ${event.subscriptionID} ${event.publicationID} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(event, message)).toBeTruthy();
    });

    it('JSON Serializer with args, kwargs', async function () {
        const event = new Event(new EventFields(1, 3, ["abc"], {"a": "b"}, {"a": "b"}));
        const command = `wampproto message event ${event.subscriptionID} ${event.publicationID} abc -k a=b -d a=b --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(event, message)).toBeTruthy();
    });
});
