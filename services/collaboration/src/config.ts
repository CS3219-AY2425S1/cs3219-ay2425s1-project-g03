import { z } from 'zod';

const envSchema = z
    .object({
        COLLAB_DB_CLOUD_URI: z.string().trim().optional(),
        COLLAB_DB_LOCAL_URI: z.string().trim().optional(),
        YJS_DB_CLOUD_URI: z.string().trim().optional(),
        YJS_DB_LOCAL_URI: z.string().trim().optional(),
        BROKER_URL: z.string().url(),
        QUESTION_SERVICE_URL: z.string().url(),
        NODE_ENV: z.enum(['development', 'production']).default('development'),
        CORS_ORIGIN: z.union([z.string().url(), z.literal('*')]).default('*'),
        PORT: z.coerce.number().min(1024).default(8084),
        JWT_SECRET: z.string().trim().min(32),
    })
    .superRefine((data, ctx) => {
        const isUrl = z.string().url();
        const cloudRes = isUrl.safeParse(data.COLLAB_DB_CLOUD_URI);
        const localRes = isUrl.safeParse(data.COLLAB_DB_LOCAL_URI);
        if (data.NODE_ENV === 'production') {
            cloudRes.error?.issues.forEach(i => ctx.addIssue({ ...i, path: ['COLLAB_DB_CLOUD_URI'] }));
        } else if (data.NODE_ENV === 'development') {
            localRes.error?.issues.forEach(i => ctx.addIssue({ ...i, path: ['COLLAB_DB_LOCAL_URI'] }));
        }
    })
    .superRefine((data, ctx) => {
        const isUrl = z.string().url();
        const cloudRes = isUrl.safeParse(data.YJS_DB_CLOUD_URI);
        const localRes = isUrl.safeParse(data.YJS_DB_LOCAL_URI);
        if (data.NODE_ENV === 'production') {
            cloudRes.error?.issues.forEach(i => ctx.addIssue({ ...i, path: ['YJS_DB_CLOUD_URI'] }));
        } else if (data.NODE_ENV === 'development') {
            localRes.error?.issues.forEach(i => ctx.addIssue({ ...i, path: ['YJS_DB_LOCAL_URI'] }));
        }
    });

const result = envSchema.safeParse(process.env);
if (!result.success) {
    console.error('There is an error with the environment variables:', result.error.issues);
    process.exit(1);
}

const { NODE_ENV, COLLAB_DB_CLOUD_URI, COLLAB_DB_LOCAL_URI, YJS_DB_CLOUD_URI, YJS_DB_LOCAL_URI } = result.data;
const COLLAB_DB_URI = (NODE_ENV === 'production' ? COLLAB_DB_CLOUD_URI : COLLAB_DB_LOCAL_URI) as string;
const YJS_DB_URI = (NODE_ENV === 'production' ? YJS_DB_CLOUD_URI : YJS_DB_LOCAL_URI) as string;
const config = { ...result.data, COLLAB_DB_URI, YJS_DB_URI };

export default config;
