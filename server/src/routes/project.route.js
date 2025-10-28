/* eslint-disable */
import {
  addMember,
  createProject,
  updateProject,
} from '#controllers/project.controller.js';
import express from 'express';

const projectRouter = express.Router();

projectRouter.post('/', createProject);
projectRouter.put('/', updateProject);
projectRouter.post('/:projectId/addMember', addMember);

export default projectRouter;
