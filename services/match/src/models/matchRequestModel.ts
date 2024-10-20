import { model, Schema, Types } from 'mongoose';
import { oneMinuteAgo } from '../utils/date';

export enum Difficulty {
    Easy = 'Easy',
    Medium = 'Medium',
    Hard = 'Hard',
}

export enum MatchRequestStatus {
    PENDING = 'PENDING',
    TIME_OUT = 'TIME_OUT',
    MATCH_FOUND = 'MATCH_FOUND',
    COLLAB_CREATED = 'COLLAB_CREATED',
}

export interface MatchRequest {
    id: Types.ObjectId;
    userId: Types.ObjectId;
    username: string;
    topics: [string];
    difficulty: Difficulty;
    createdAt: Date;
    updatedAt: Date;
    pairId: Types.ObjectId;
    collabId: Types.ObjectId;
}

const matchRequestSchema = new Schema<MatchRequest>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        topics: {
            type: [String],
            required: true,
        },
        difficulty: {
            type: String,
            required: true,
            enum: ['Easy', 'Medium', 'Hard'],
        },
        pairId: {
            type: Schema.Types.ObjectId,
            required: false,
        },
        collabId: {
            type: Schema.Types.ObjectId,
            required: false,
        },
    },
    { versionKey: false, timestamps: true },
);

export const MatchRequestModel = model<MatchRequest>('MatchRequest', matchRequestSchema);

export function getStatus(matchRequest: MatchRequest): MatchRequestStatus {
    return matchRequest.collabId
        ? MatchRequestStatus.COLLAB_CREATED
        : matchRequest.pairId
          ? MatchRequestStatus.MATCH_FOUND
          : matchRequest.updatedAt >= oneMinuteAgo()
            ? MatchRequestStatus.PENDING
            : MatchRequestStatus.TIME_OUT;
}
