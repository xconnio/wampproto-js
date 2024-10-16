export class SessionDetails {
    constructor(
        public readonly sessionID: number,
        public readonly realm: string,
        public readonly authid: string,
        public readonly authrole: string,
        ) {}
}
