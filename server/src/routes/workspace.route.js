import {
  addMember,
  getUserWorkspaces,
} from '#controllers/workspace.controller.js';
import express from 'express';

const workspaceRouter = express.Router();

workspaceRouter.get('/', getUserWorkspaces);
workspaceRouter.post('/add-member', addMember);

export default workspaceRouter;
