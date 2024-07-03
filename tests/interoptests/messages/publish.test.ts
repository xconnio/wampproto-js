import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Publish, PublishFields} from "../../../lib/messages/publish";

const TEST_TOPIC: string = "io.xconn.test";

function isEqual(msg1: Publish, msg2: any): boolean {
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
        const publish = new Publish(new PublishFields(1, TEST_TOPIC));
        const command = `wampproto message publish ${publish.requestID} ${publish.uri} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(publish, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const publish = new Publish(new PublishFields(1, TEST_TOPIC));
        const command = `wampproto message publish ${publish.requestID} ${publish.uri} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(publish, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const publish = new Publish(new PublishFields(1, TEST_TOPIC));
        const command = `wampproto message publish ${publish.requestID} ${publish.uri} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(publish, message)).toBeTruthy();
    });

    it('JSON Serializer with args, kwargs', async function () {
        const publish = new Publish(new PublishFields(1, TEST_TOPIC, ["abc"], {"a": "b"}, {"options": "new"}));
        const command = `wampproto message publish ${publish.requestID} ${publish.uri} abc -k a=b -o options=new --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(publish, message)).toBeTruthy();
    });
});
