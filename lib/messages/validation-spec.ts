export class ValidationSpec {
    public constructor(
        readonly minLength: number,
        readonly maxLength: number,
        readonly message: string,
        readonly spec: {[key:number]: CallableFunction}) {}
}
