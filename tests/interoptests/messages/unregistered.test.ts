import {runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {UnRegistered, UnRegisteredFields} from "../../../lib/messages/unregistered";


function isEqual(msg1: UnRegistered, msg2: any): boolean {
    return msg1.requestID === msg2.requestID;
}


describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const unregistered = new UnRegistered(new UnRegisteredFields(1));
        const command = `wampproto message unregistered ${unregistered.requestID} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(unregistered, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const unregistered = new UnRegistered(new UnRegisteredFields(1));
        const command = `wampproto message unregistered ${unregistered.requestID} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(unregistered, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const unregistered = new UnRegistered(new UnRegisteredFields(1));
        const command = `wampproto message unregistered ${unregistered.requestID} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(unregistered, message)).toBeTruthy();
    });
});
