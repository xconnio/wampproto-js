import {runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {UnSubscribe, UnSubscribeFields} from "../../../lib/messages/unsubscribe";

function isEqual(msg1: UnSubscribe, msg2: any): boolean {
    return (
        msg1.requestID === msg2.requestID &&
        msg1.subscriptionID === msg2.subscriptionID
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const unsubscribe = new UnSubscribe((new UnSubscribeFields(1, 5)));
        const command = `wampproto message unsubscribe ${unsubscribe.requestID} ${unsubscribe.subscriptionID} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(unsubscribe, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const unsubscribe = new UnSubscribe(new UnSubscribeFields(1, 3));
        const command = `wampproto message unsubscribe ${unsubscribe.requestID} ${unsubscribe.subscriptionID} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(unsubscribe, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const unsubscribe = new UnSubscribe(new UnSubscribeFields(1, 3));
        const command = `wampproto message unsubscribe ${unsubscribe.requestID} ${unsubscribe.subscriptionID} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(unsubscribe, message)).toBeTruthy();
    });
});
