/* eslint-disable */
import {
  createTask,
  deleteTask,
  updateTask,
} from '#controllers/task.controller.js';
import express from 'express';

const taskRouter = express.Router();

taskRouter.post('/', createTask);
taskRouter.put('/:id', updateTask);
taskRouter.post('/delete', deleteTask);

export default taskRouter;
