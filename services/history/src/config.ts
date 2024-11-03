import { z } from 'zod';

const envSchema = z
    .object({
        DB_CLOUD_URI: z.string().trim().optional(),
        DB_LOCAL_URI: z.string().trim().optional(),
        BROKER_URL: z.string().url(),
        NODE_ENV: z.enum(['development', 'production']).default('development'),
        CORS_ORIGIN: z.union([z.string().url(), z.literal('*')]).default('*'),
        JWT_SECRET: z.string().trim().min(32),
        PORT: z.coerce.number().min(1024).default(8086),
    })
    .superRefine((data, ctx) => {
        const isUrl = z.string().url();
        const cloudRes = isUrl.safeParse(data.DB_CLOUD_URI);
        const localRes = isUrl.safeParse(data.DB_LOCAL_URI);
        if (data.NODE_ENV === 'production') {
            cloudRes.error?.issues.forEach(i => ctx.addIssue({ ...i, path: ['DB_CLOUD_URI'] }));
        } else if (data.NODE_ENV === 'development') {
            localRes.error?.issues.forEach(i => ctx.addIssue({ ...i, path: ['DB_LOCAL_URI'] }));
        }
    });

const result = envSchema.safeParse(process.env);
if (!result.success) {
    console.error('There is an error with the environment variables:', result.error.issues);
    process.exit(1);
}

const { NODE_ENV, DB_CLOUD_URI, DB_LOCAL_URI } = result.data;
const DB_URI = (NODE_ENV === 'production' ? DB_CLOUD_URI : DB_LOCAL_URI) as string;
const config = { ...result.data, DB_URI };

export default config;
