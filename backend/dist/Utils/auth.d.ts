export declare const HashPassword: (passwd: string) => Promise<string>;
export declare const CheckPassword: (passwd: string, Hash: string) => Promise<boolean>;
