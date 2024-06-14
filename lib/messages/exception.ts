class ProtocolError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProtocolError';
    }
}

export default ProtocolError;
