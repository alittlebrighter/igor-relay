declare module "*.json" {
    const value: any;
    export default value;
}

declare module "axios" {
    function post(
        url : String,
        params : any
    ) : any
    export = post;
}