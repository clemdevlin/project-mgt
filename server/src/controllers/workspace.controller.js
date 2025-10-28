import { logger } from '#config/logger.js';
import { prisma } from '#lib/prisma.js';

// Get all workspaces for user
export const getUserWorkspaces = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: { include: { user: true } },
        projects: {
          include: {
            tasks: {
              include: {
                assignee: true,
                comments: { include: { user: true } },
              },
            },
            members: { include: { user: true } },
          },
        },
        owner: true,
      },
    });

    res.json({
      message: `Workspace data fetched for user ${userId} successfully`,
      workspaces,
    });
  } catch (error) {
    logger.error('Error getting user workspaces', error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Add member to workspace
export const addMember = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const { email, role, workspaceId, message } = req.body;

    // check if user exist
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!workspaceId || !role) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    if (!['ADMIN', 'MEMBER'].includes(role)) {
      return res.status(400).json({ message: 'Inavlid role' });
    }

    // Fetch workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: true },
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // check creator has admin role
    if (
      !workspace.members.find(
        member => member.userId === userId && member.role === 'ADMIN'
      )
    ) {
      return res
        .status(401)
        .json({ message: 'You do not have admin priviledges' });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find(
      member => member.userId === userId
    );

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a memeber' });
    }

    const member = await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role,
        message,
      },
    });

    res.status(201).json({ message: 'Member added successfully', member });
  } catch (error) {
    logger.error('Error adding member to workspace', error);
    res.status(500).json({ message: error.code || error.message });
  }
};
