import { logger } from '#config/logger.js';
import { prisma } from '#lib/prisma.js';

// Create Project
export const createProject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      team_members,
      team_lead,
      progress,
      priority,
    } = req.body;

    // check if user has admin role for workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { include: { user: true } } },
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (
      !workspace.members.some(
        member => member.userId === userId && member.role === 'ADMIN'
      )
    ) {
      return res.status(403).json({
        message:
          'You do not have permission to create projects in this workspace',
      });
    }

    // Get Team Lead using email
    const teamLead = await prisma.user.findUnique({
      where: { email: team_lead },
      select: { id: true },
    });

    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        description,
        status,
        priority,
        progress,
        team_lead: teamLead?.id,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    // Add Members to project if they are in the workspace
    if (team_members?.length > 0) {
      const membersToAdd = [];
      workspace.members.forEach(member => {
        if (team_members.includes(member.user.email)) {
          membersToAdd.push(member.user.id);
        }
      });

      await prisma.projectMember.createMany({
        data: membersToAdd.map(memberId => ({
          projectId: project.id,
          userId: memberId,
        })),
      });
    }

    const projectWithMembers = await prisma.project.findUnique({
      where: { id: project.id },
      include: {
        members: { include: { user: true } },
        tasks: {
          include: { assignee: true, comments: { include: { user: true } } },
        },
        owner: true,
      },
    });

    res.json({
      project: projectWithMembers,
      message: 'Project created successfully',
    });
  } catch (error) {
    logger.log('Error Creating Project', error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Update Project
export const updateProject = async (req, res) => {
  try {
    const { userId } = await req.auth();
    const {
      id,
      workspaceId,
      description,
      name,
      status,
      start_date,
      end_date,
      progress,
      priority,
    } = req.body;

    // check if user has admin role for workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { members: { include: { user: true } } },
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (
      !workspace.members.some(
        member => member.userId === userId && member.role === 'ADMIN'
      )
    ) {
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project) {
        return status(404).json({ message: 'Project not found' });
      } else if (project.team_lead !== userId) {
        return status(403).json({
          message:
            'You do not have permission to update projects in this workspace',
        });
      }
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        workspaceId,
        description,
        name,
        status,
        priority,
        progress,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
      },
    });

    res.json({
      project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    logger.log('Error Updating Project', error);
    res.status(500).json({ message: error.code || error.message });
  }
};

// Add Member to Project
export const addMember = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { projectId } = req.params;
    const { email } = req.body;

    // check if user is project lead
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.team_lead !== userId) {
      return res.status(403).json({
        message: 'Inadequate permissions. Only project leaders can add members',
      });
    }

    // check if user is already a member
    const existingMember = project.members.find(
      member => member.email === email
    );

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId,
      },
    });

    res.json({ member, message: 'Member added successfully' });
  } catch (error) {
    logger.log('Error Adding Member', error);
    res.status(500).json({ message: error.code || error.message });
  }
};
