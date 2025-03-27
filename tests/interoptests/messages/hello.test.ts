import {deepEqual, runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Hello, HelloFields} from "../../../lib/messages/hello";

function isEqual(msg1: Hello, msg2: any): boolean {
    return (
        msg1.realm === msg2.realm &&
        deepEqual(msg1.roles, msg2.roles) &&
        msg1.authID === msg2.authID &&
        deepEqual(msg1.authmethods, msg2.authmethods) &&
        deepEqual(msg1.authextra, msg1.authextra)
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const hello = new Hello(
            new HelloFields(
                "realm1",
                {"callee": {}},
                "john",
                ["anonymous"],
                {"extra": "foo"},
                )
        );
        const command = `wampproto message hello ${hello.realm} -r callee={} -e extra=foo --authid ${hello.authID} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(hello, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const hello = new Hello(
            new HelloFields(
                "realm1",
                {"callee": {}},
                "john",
                ["anonymous"],
                {"extra": "foo"},
                )
        );
        const command = `wampproto message hello ${hello.realm} -r callee={} -e extra=foo --authid ${hello.authID} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(hello, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const hello = new Hello(
            new HelloFields(
                "realm1",
                {"callee": {}},
                "john",
                ["anonymous"],
                {"extra": "foo"},
                )
        );
        const command = `wampproto message hello ${hello.realm} -r callee={} -e extra=foo --authid ${hello.authID} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(hello, message)).toBeTruthy();
    });
});
