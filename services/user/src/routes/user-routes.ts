import express from 'express';

import {
    createUser,
    deleteUser,
    getAllUsers,
    getUser,
    updatePassword,
    updateUser,
    updateUsernameAndEmail,
    updateUserPrivilege,
} from '../controller/user-controller';
import { verifyAccessToken, verifyIsAdmin, verifyIsOwnerOrAdmin } from '../middleware/basic-access-control';

const router = express.Router();

router.get('/', verifyAccessToken, verifyIsAdmin, getAllUsers);

router.patch('/:id/privilege', verifyAccessToken, verifyIsAdmin, updateUserPrivilege);

router.post('/', createUser);

router.get('/:id', verifyAccessToken, verifyIsOwnerOrAdmin, getUser);

router.patch('/:id', verifyAccessToken, verifyIsOwnerOrAdmin, updateUser);

router.patch('/username-email/:id', verifyAccessToken, verifyIsOwnerOrAdmin, updateUsernameAndEmail);

router.patch('/password/:id', verifyAccessToken, verifyIsOwnerOrAdmin, updatePassword);

router.delete('/:id', verifyAccessToken, verifyIsOwnerOrAdmin, deleteUser);

export default router;
