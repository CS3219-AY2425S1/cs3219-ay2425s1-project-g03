export interface UServRes {
    message: string;
    data: {
        id: string;
        username: string;
        email: string;
        accessToken: string;
        isAdmin: boolean;
        createdAt: string;
    };
}
