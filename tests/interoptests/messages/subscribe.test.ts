import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Subscribe, SubscribeFields} from "../../../lib/messages/subscribe";

const TEST_TOPIC: string = "io.xconn.test";

function isEqual(msg1: Subscribe, msg2: any): boolean {
    return (
        msg1.requestID === msg2.requestID &&
        msg1.topic === msg2.topic &&
        deepEqual(msg1.options, msg2.options)
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const subscribe = new Subscribe(new SubscribeFields(1, TEST_TOPIC));
        const command = `wampproto message subscribe ${subscribe.requestID} ${subscribe.topic} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(subscribe, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const subscribe = new Subscribe(new SubscribeFields(1, TEST_TOPIC));
        const command = `wampproto message subscribe ${subscribe.requestID} ${subscribe.topic} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(subscribe, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const subscribe = new Subscribe(new SubscribeFields(1, TEST_TOPIC));
        const command = `wampproto message subscribe ${subscribe.requestID} ${subscribe.topic} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(subscribe, message)).toBeTruthy();
    });

    it('JSON Serializer with options', async function () {
        const subscribe = new Subscribe(new SubscribeFields(1, TEST_TOPIC, {"options": "new"}));
        const command = `wampproto message subscribe ${subscribe.requestID} ${subscribe.topic} -o options=new --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(subscribe, message)).toBeTruthy();
    });
});
