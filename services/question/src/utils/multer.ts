import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';

const storage = multer.memoryStorage();
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const isJson = file.mimetype === 'application/json' && file.originalname.endsWith('.json');
    if (isJson) {
        cb(null, true);
    } else {
        cb(new Error('Only JSON files are allowed!'));
    }
};

export const upload = multer({ storage, fileFilter });
