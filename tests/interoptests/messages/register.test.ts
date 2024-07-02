import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Register, RegisterFields} from "../../../lib/messages/register";

const TEST_PROCEDURE: string = "io.xconn.test";

function isEqual(msg1: Register, msg2: any): boolean {
    return (
        msg1.requestID === msg2.requestID &&
        msg1.uri === msg2.uri &&
        deepEqual(msg1.options, msg2.options)
    );
}


describe('Message Serializer', function() {

    it('JSON Serializer', async function() {
        const register = new Register(new RegisterFields(1, TEST_PROCEDURE));
        const command = `wampproto message register ${register.requestID} ${register.uri} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(register, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function() {
        const register = new Register(new RegisterFields(1, TEST_PROCEDURE));
        const command = `wampproto message register ${register.requestID} ${register.uri} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(register, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function() {
        const register = new Register(new RegisterFields(1, TEST_PROCEDURE));
        const command = `wampproto message register ${register.requestID} ${register.uri} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(register, message)).toBeTruthy();
    });
});
