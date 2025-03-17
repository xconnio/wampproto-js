export class ProtocolError extends Error {
    constructor(public message: string) {
        super(message);
    }
}

export class SessionNotReady extends Error {
    constructor(public message: string) {
        super(message);
    }
}

export class ApplicationError extends Error {
    args?: any[];
    kwargs?: { [key: string]: any };

    constructor(message: string, args?: any[], kwargs?: { [key: string]: any }) {
        super(message);
        this.args = args;
        this.kwargs = kwargs;
    }

    toString(): string {
        let errStr = this.message;

        if (this.args?.length) {
            errStr += `: ${this.args.map(arg => arg.toString()).join(", ")}`;
        }

        if (this.kwargs && Object.keys(this.kwargs).length) {
            errStr += `: ${Object.entries(this.kwargs)
                .map(([key, value]) => `${key}=${value}`)
                .join(", ")}`;
        }

        return errStr;
    }
}

