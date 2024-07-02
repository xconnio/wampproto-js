import {runCommand} from "../helpers";
import {JSONSerializer} from "../../../lib/serializers/json";
import {CBORSerializer} from "../../../lib/serializers/cbor";
import {MsgPackSerializer} from "../../../lib/serializers/msgpack";
import {Published, PublishedFields} from "../../../lib/messages/published";

function isEqual(msg1: Published, msg2: any): boolean {
    return (
        msg1.requestID === msg2.requestID &&
        msg1.publicationID === msg2.publicationID
    );
}

describe('Message Serializer', function () {

    it('JSON Serializer', async function () {
        const published = new Published(new PublishedFields(1, 3));
        const command = `wampproto message published ${published.requestID} ${published.publicationID} --serializer json`;

        const output = await runCommand(command);

        const serializer = new JSONSerializer();
        const message = serializer.deserialize(output);

        expect(isEqual(published, message)).toBeTruthy();
    });

    it('CBOR Serializer', async function () {
        const published = new Published(new PublishedFields(1, 3));
        const command = `wampproto message published ${published.requestID} ${published.publicationID} --serializer cbor --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new CBORSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(published, message)).toBeTruthy();
    });

    it('MsgPack Serializer', async function () {
        const published = new Published(new PublishedFields(1, 3));
        const command = `wampproto message published ${published.requestID} ${published.publicationID} --serializer msgpack --output hex`;

        const output = await runCommand(command);
        const outputBytes = Buffer.from(output, 'hex');

        const serializer = new MsgPackSerializer();
        const message = serializer.deserialize(outputBytes);

        expect(isEqual(published, message)).toBeTruthy();
    });
});
