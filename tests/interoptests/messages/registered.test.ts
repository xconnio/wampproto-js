import {runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Registered, RegisteredFields} from "../../../lib/messages/registered";


function isEqual(msg1: Registered, msg2: any): boolean {
    return (
        msg1.requestID === msg2.requestID &&
        msg1.registrationID === msg2.registrationID
    );
}


describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const registered = new Registered(new RegisteredFields(1, 2));
        const command = `wampproto message registered ${registered.requestID} ${registered.registrationID} --serializer json`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');
        const jsonStr = outputBytes.toString('utf-8');

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(jsonStr);

        expect(isEqual(registered, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const registered = new Registered(new RegisteredFields(1, 2));
        const command = `wampproto message registered ${registered.requestID} ${registered.registrationID} --serializer cbor`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(registered, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const registered = new Registered(new RegisteredFields(1, 2));
        const command = `wampproto message registered ${registered.requestID} ${registered.registrationID} --serializer msgpack`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(registered, message)).toBeTruthy();
    });
});
