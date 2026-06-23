interface IEmail {
    email: string;
    apellido: string;
    name: string;
    token: string;
}
export declare class AuthEmail {
    static sendConfirmationEmail: (user: IEmail) => Promise<void>;
    static sendPasswordResetToken: (user: IEmail) => Promise<void>;
}
export {};
