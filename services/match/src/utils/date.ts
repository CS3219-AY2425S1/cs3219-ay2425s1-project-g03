export const oneMinuteAgo = (): Date => {
    return new Date(Date.now() - 60 * 1000);
};
