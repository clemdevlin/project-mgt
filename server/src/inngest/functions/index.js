import { inngest } from '../client.js';
import { prisma } from '../../lib/prisma.js';

const pickClerkUser = data => {
  const primaryId = data?.primary_email_address_id;
  const emails = data?.email_addresses || [];
  const primary = emails.find(e => e.id === primaryId) || emails[0];
  const email = primary?.email_address || null;
  return {
    id: data?.id,
    email,
    name: data?.first_name || 'user',
    firstName: data?.first_name || null,
    lastName: data?.last_name || null,
    imageUrl: data?.image_url || null,
    createdAt: data?.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data?.updated_at ? new Date(data.updated_at) : new Date(),
  };
};

const clerkUserCreated = inngest.createFunction(
  { id: 'clerk.user.created' },
  { event: 'clerk/user.created' },
  async ({ event, step }) => {
    return step.run('create-user', async () => {
      const user = pickClerkUser(event.data);
      if (!user?.id || !user?.email) return { skipped: true };
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: user,
      });
      return { id: user.id };
    });
  }
);

const clerkUserUpdated = inngest.createFunction(
  { id: 'clerk.user.updated' },
  { event: 'clerk/user.updated' },
  async ({ event, step }) => {
    return step.run('update-user', async () => {
      const user = pickClerkUser(event.data);
      if (!user?.id) return { skipped: true };
      const { id, ...data } = user;
      await prisma.user.updateMany({ where: { id }, data });
      return { id };
    });
  }
);

const clerkUserDeleted = inngest.createFunction(
  { id: 'clerk.user.deleted' },
  { event: 'clerk/user.deleted' },
  async ({ event, step }) => {
    return step.run('delete-user', async () => {
      const id = event.data?.id;
      if (!id) return { skipped: true };
      await prisma.user.deleteMany({ where: { id } });
      return { id };
    });
  }
);

const syncWorkspaceCreation = inngest.createFunction(
  { id: 'sync-workspace-from-clerk' },
  { event: 'clerk/organization.created' },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url,
      },
    });

    // Add creator as admin member
    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by,
        workspaceId: data.id,
        role: 'ADMIN',
      },
    });
  }
);

// Inngest function to update workspace data in database
const syncWorkspaceUpdation = inngest.createFunction(
  { id: 'sync-workspace-update' },
  { event: 'clerk/organization.updated' },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      },
    });
  }
);

// Inngest Function to delete workspace from database
const syncWorkspaceDeletion = inngest.createFunction(
  { id: 'delete-worskpace-with-clerk' },
  { event: 'clerk/organization.deleted' },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspace.delete({
      where: { id: data.id },
    });
  }
);

// Inngest function to save workspace member data to database
const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: 'sync-workspace-member-from-clerk' },
  { event: 'clerk/organizationInvitation.accepted' },
  async ({ event }) => {
    const { data } = event;
    await prisma.workspaceMember.create({
      data: {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name).toUpperCase(),
      },
    });
  }
);

export const functions = [
  clerkUserCreated,
  clerkUserUpdated,
  clerkUserDeleted,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
];
