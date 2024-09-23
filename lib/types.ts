import {Message} from "./messages/message";

export class SessionDetails {
    constructor(
        public readonly sessionID: number,
        public readonly realm: string,
        public readonly authid: string,
        public readonly authrole: string,
        ) {}
}

export class MessageWithRecipient {
    constructor(public readonly message: Message, public readonly recipient: number) {}
}

export class Registration {
    constructor(
        public readonly id: number,
        public readonly procedure: string,
        public readonly registrants: { [key: number]: number },
        public readonly invocationPolicy?: string,
        ) {}
}

export class Subscription {
    constructor(
        public readonly id: number,
        public readonly topic: string,
        public readonly subscribers: { [key: number]: number },
    ) {
    }
}

export class Publication {
    constructor(
        public event?: Event,
        public recipients?: number[],
        public ack?: MessageWithRecipient,
    ) {}
}
