export const oneMinuteAgo = (): Date => {
    return new Date(Date.now() - 20 * 1000);
};
