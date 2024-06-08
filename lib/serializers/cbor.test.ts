import {CBORSerializer} from "./cbor";
import Hello from "../messages/hello";

describe("cbor", (): void => {
    let serializer: CBORSerializer = new CBORSerializer();

    it("serialize", (): void => {
        let hello: Hello = new Hello("realm1", "authid");
        let payload: Uint8Array = serializer.serialize(hello);
        expect(expect(payload) != null).toBeTruthy()

        let msg: Hello = <Hello>serializer.deserialize(payload)
        expect(msg.type() == Hello.TYPE).toBeTruthy()
        expect(msg.realm).toEqual("realm1")
    });
});
