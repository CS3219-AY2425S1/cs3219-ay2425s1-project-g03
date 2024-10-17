export interface BaseResponse {
    status: string;
    message: string;
}

export interface MessageOnlyResponse extends BaseResponse {
    data: null;
}

export interface QuestionResponse extends BaseResponse {
    data?: Question[] | null;
}

export interface SingleQuestionResponse extends BaseResponse {
    data: Question;
}

export interface Question {
    id: number;
    description: string;
    difficulty: string;
    title: string;
    topics?: string[];
}

export interface QuestionBody {
    description?: string;
    difficulty?: string;
    title?: string;
    topics?: string[];
}
