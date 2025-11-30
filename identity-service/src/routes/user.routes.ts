import { Router } from 'express';
import { authMiddleware } from '../middlewares/authentication.middleware';
import { authorize } from '../middlewares/authorization.middleware';
import { getUser, getCurrentUser, updateUser, deleteUser, updateUserPassword, getAllUsers } from '../controllers/user.controller';
import { UserRole } from '../enums/roles.enum';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized (no token or invalid token)
 */
router.get('/me', authMiddleware, getCurrentUser);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID (self or admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden (not admin or not self)
 *       404:
 *         description: User not found
 */
router.get('/:id', authMiddleware, authorize([UserRole.ADMIN], true), getUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden (not admin)
 */
router.get('/', authMiddleware, authorize([UserRole.ADMIN]), getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update a user's profile (self or admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden (not self or admin)
 *       404:
 *         description: User not found
 */
router.patch('/:id', authMiddleware, authorize([UserRole.ADMIN], true), updateUser);

/**
 * @swagger
 * /users/{id}/password:
 *   patch:
 *     summary: Update a user's password (self only)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       403:
 *         description: Forbidden (not self)
 *       404:
 *         description: User not found
 */
router.patch('/:id/password', authMiddleware, authorize([], true), updateUserPassword);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user (self or admin)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       403:
 *         description: Forbidden (not self or admin)
 *       404:
 *         description: User not found
 */
router.delete('/:id', authMiddleware, authorize([UserRole.ADMIN], true), deleteUser);

export default router;
