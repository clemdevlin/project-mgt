/* eslint-disable */
import {
  addComment,
  getTaskComments,
} from '#controllers/comment.controller.js';
import express from 'express';

const commentRouter = express.Router();

commentRouter.post('/', addComment);
commentRouter.get('/:taskId', getTaskComments);

export default commentRouter;
