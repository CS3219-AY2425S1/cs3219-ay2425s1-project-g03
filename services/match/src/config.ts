import { z } from 'zod';

const envSchema = z
    .object({
        DB_USERNAME: z.string().trim().min(1),
        DB_PASSWORD: z.string().trim().min(1),
        DB_CLOUD_URI: z.string().trim().optional(),
        DB_LOCAL_URI: z.string().trim().optional(),
        BROKER_URL: z.string().url(),
        NODE_ENV: z.enum(['development', 'production']).default('development'),
        CORS_ORIGIN: z.union([z.string().url(), z.literal('*')]).default('*'),
        PORT: z.coerce.number().min(1024).default(8083),
    })
    .refine(
        data => {
            const isUrl = z.string().url();

            if (data.NODE_ENV === 'production') {
                return isUrl.safeParse(data.DB_CLOUD_URI).success;
            } else {
                return isUrl.safeParse(data.DB_LOCAL_URI).success;
            }
        },
        {
            message: 'Database URI must be provided',
            path: ['DB_CLOUD_URI', 'DB_LOCAL_URI'],
        },
    );

const result = envSchema.safeParse(process.env);
if (!result.success) {
    console.error('There is an error with the environment variables:', result.error.issues);
    process.exit(1);
}
const config = result.data;

export default config;
