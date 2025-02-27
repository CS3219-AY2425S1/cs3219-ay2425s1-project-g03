export interface Topic {
    label: string;
    value: string;
}

export interface TopicResponse {
    status: string;
    message: string;
    data?: string[] | null;
}
