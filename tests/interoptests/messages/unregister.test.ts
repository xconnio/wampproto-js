import {runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {UnRegister, UnRegisterFields} from "../../../lib/messages/unregister";

function isEqual(msg1: UnRegister, msg2: any): boolean {
    return (
        msg1.requestID === msg2.requestID &&
        msg1.registrationID === msg2.registrationID
    );
}


describe('Message Serializer', function() {

    it('JSON Serializer', async function() {
        const unregister = new UnRegister(new UnRegisterFields(1, 2));
        const command = `wampproto message unregister ${unregister.requestID} ${unregister.registrationID} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(unregister, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function() {
        const unregister = new UnRegister(new UnRegisterFields(1, 2));
        const command = `wampproto message unregister ${unregister.requestID} ${unregister.registrationID} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(unregister, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function() {
        const unregister = new UnRegister(new UnRegisterFields(1, 2));
        const command = `wampproto message unregister ${unregister.requestID} ${unregister.registrationID} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(unregister, message)).toBeTruthy();
    });
});
