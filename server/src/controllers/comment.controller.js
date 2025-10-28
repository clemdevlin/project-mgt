/* eslint-disable */

import { logger } from '#config/logger.js';
import { prisma } from '#lib/prisma.js';

// Add comment
export const addComment = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, taskId } = req.body;

    // check if user is project member
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    const project = await prisma.project.findUnique({
      where: { id: task.projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(member => member.userId === userId);

    if (!member) {
      return res
        .status(403)
        .json({ message: 'You are not a member of this project' });
    }

    const comment = await prisma.comment.create({
      data: { taskId, content, userId },
      include: { user: true },
    });

    res.status(201).json({ comment, message: 'Comment added successfully' });
  } catch (error) {
    logger.error('Error creating comment', error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Get comments for task
export const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: { user: true },
    });

    res.json({ comments, message: 'Comments fetched successfully' });
  } catch (error) {
    logger.error('Error getting task comments', error);
    res.status(500).json({ message: error.code || error.message });
  }
};
