import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Authenticate, AuthenticateFields} from "../../../lib/messages/authenticate";

function isEqual(msg1: Authenticate, msg2: any): boolean {
    return (
        msg1.signature === msg2.signature &&
        deepEqual(msg1.extra, msg2.extra)
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const authenticate = new Authenticate(new AuthenticateFields("test", {"timeout": 200}));
        const command = `wampproto message authenticate ${authenticate.signature} -e timeout=200 --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(authenticate, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const authenticate = new Authenticate(new AuthenticateFields("test", {"timeout": 200}));
        const command = `wampproto message authenticate ${authenticate.signature} -e timeout=200 --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(authenticate, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const authenticate = new Authenticate(new AuthenticateFields("test", {"timeout": 200}));
        const command = `wampproto message authenticate ${authenticate.signature} -e timeout=200 --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(authenticate, message)).toBeTruthy();
    });
});
