import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Welcome, WelcomeFields} from "../../../lib/messages/welcome";

function isEqual(msg1: Welcome, msg2: any): boolean {
    return (
        msg1.sessionID === msg2.sessionID &&
        deepEqual(msg1.roles, msg2.roles) &&
        msg1.authID === msg2.authID &&
        deepEqual(msg1.authmethod, msg2.authmethod) &&
        deepEqual(msg1.authextra, msg1.authextra)
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const welcome = new Welcome(
            new WelcomeFields(
                1,
                {"callee": {}},
                "john",
                "admin",
                "anonymous",
                {"extra": "foo"},
                )
        );
        const command = `wampproto message welcome ${welcome.sessionID} --roles callee={} -e '{"extra": "foo"}' --authid ${welcome.authID} --authrole ${welcome.authrole} --authmethod ${welcome.authmethod} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(welcome, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const welcome = new Welcome(
            new WelcomeFields(
                987,
                {"callee": {}},
                "john",
                null,
                "anonymous",
                {"extra": "foo"},
                )
        );
        const command = `wampproto message welcome ${welcome.sessionID} --roles callee={} -e '{"extra": "foo"}' --authid ${welcome.authID} --authrole ${welcome.authrole} --authmethod ${welcome.authmethod} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(welcome, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const welcome = new Welcome(
            new WelcomeFields(
                123,
                {"callee": {}},
                "john",
                null,
                "anonymous",
                {"extra": "foo"},
                )
        );
        const command = `wampproto message welcome ${welcome.sessionID} --roles callee={} -e '{"extra": "foo"}' --authid ${welcome.authID} --authrole ${welcome.authrole} --authmethod ${welcome.authmethod} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(welcome, message)).toBeTruthy();
    });
});
