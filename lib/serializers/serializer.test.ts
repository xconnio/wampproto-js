import {CBORSerializer} from "./cbor";
import {JSONSerializer} from "./json";
import {MsgPackSerializer} from "./msgpack";
import {Hello, HelloFields} from "../messages/hello";

describe("serializers", () => {
    const serializers = [
        {serializer: new CBORSerializer(), name: "CBORSerializer"},
        {serializer: new JSONSerializer(), name: "JSONSerializer"},
        {serializer: new MsgPackSerializer(), name: "MsgPackSerializer"}
    ];

    function testSerializer(serializer: any, name: string) {
        testSerializeAndDeserialize(serializer, name);
        testInvalidMessage(serializer, name);
        testInvalidData(serializer, name);
    }

    function testSerializeAndDeserialize(serializer: any, name: string) {
        it(`${name}: serialize and deserialize`, () => {
            const hello = new Hello(new HelloFields("realm1", {"callee": {}}, "test", ["anonymous"]));

            const serializedHello = serializer.serialize(hello);
            expect(serializedHello).not.toBeNull();

            const deserializedHello = serializer.deserialize(serializedHello) as Hello;
            expect(deserializedHello.type()).toBe(Hello.TYPE);
            expect(deserializedHello.realm).toEqual(hello.realm);
            expect(deserializedHello.authID).toEqual(hello.authID);
            expect(deserializedHello.roles).toEqual(hello.roles);
            expect(deserializedHello.authmethods).toEqual(hello.authmethods);
        });
    }

    function testInvalidMessage(serializer: any, name: string) {
        it(`${name}: should throw error on invalid message`, () => {
            expect(() => serializer.deserialize(123)).toThrow();
        });
    }

    function testInvalidData(serializer: any, name: string) {
        it(`${name}: should throw error on invalid data`, () => {
            expect(() => serializer.deserialize("invalid")).toThrow();
        });
    }

    serializers.forEach(({serializer, name}) => testSerializer(serializer, name));
});
