import { inngest } from '../client.js';
import { prisma } from '../../lib/prisma.js';
import { sendEmail } from '#config/nodemailer.js';

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

// Inngest Function to Send Email on task Creation
const sendTaskAssignmentEmail = inngest.createFunction(
  { id: 'send-task-assignment-mail' },
  { event: 'app/task.assigned' },
  async ({ event, step }) => {
    const { taskId, origin } = event.data;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { assignee: true, project: true },
    });

    await sendEmail({
      to: task.assignee.email,
      subject: `New Task Assignment in ${task.project.name}`,
      body: `<div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="color: #2563eb; margin: 0; font-size: 24px;">TaskFlow</h2>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 4px;">Your collaborative project management hub</p>
                </div>

                <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #e5e7eb;">
                  <h3 style="color: #111827; font-size: 18px; margin-bottom: 10px;">🆕 New Task Assigned to You</h3>

                  <p style="color: #374151; font-size: 15px; margin-bottom: 8px;">
                    Hello <strong>${task.assignee.name}</strong>,
                  </p>

                  <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
                    A new task titled <strong style="color: #111827;">“${task.title}”</strong> has been created in the project <strong>${origin}</strong>.
                    <br>
                    Please make sure to review and complete it before the due date.
                  </p>

                  <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
                    <p style="margin: 6px 0;"><strong>Description: </strong> ${task.description}</p>
                  </div>

                  <div style="margin-top: 16px; padding: 12px 16px; background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #2563eb;">
                    <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                      <strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div style="margin-top: 20px; text-align: center;">
                    <a href='${origin}' style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 14px; font-weight: bold;">
                      View Task
                    </a>
                  </div>
                </div>

                <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                  © 2025 TaskFlow. All rights reserved.
                </p>
              </div>
              `,
    });

    if (
      new Date(task.due_date).toLocaleDateString() !== new Date().toDateString()
    ) {
      await step.sleepUntil('wait-for-the-due-date', new Date(task.due_date));

      await step.run('check-if-task-is-completed', async () => {
        const task = await prisma.task.findUnique({
          where: { id: taskId },
          include: { assignee: true, project: true },
        });

        if (!task) return;

        if (task && task.status !== 'DONE') {
          await step.run('send-task-reminder-mail', async () => {
            await sendEmail({
              to: task.assignee.email,
              subject: `Reminder for ${task.project.name}`,
              body: `
                    <div style="font-family: Arial, sans-serif; background-color: #fef2f2; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #fecaca;">
                      <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #dc2626; margin: 0; font-size: 24px;">TaskFlow</h2>
                        <p style="color: #991b1b; font-size: 14px; margin-top: 4px;">Project Management Reminder</p>
                      </div>

                      <div style="background-color: #ffffff; padding: 20px; border-radius: 6px; border: 1px solid #fecaca;">
                        <h3 style="color: #b91c1c; font-size: 18px; margin-bottom: 10px;">⏰ Task Due Date Passed</h3>

                        <p style="color: #374151; font-size: 15px; margin-bottom: 8px;">
                          Hello <strong>${task.assignee.name}</strong>,
                        </p>

                        <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
                          This is a friendly reminder that your assigned task <strong style="color: #111827;">“${task.title}”</strong> from the project <strong>${origin}</strong> was due on <strong>${new Date(task.due_date).toLocaleDateString()}</strong>.
                          <br><br>
                          Please review and complete it as soon as possible to keep the project on track.
                        </p>

                        <div style="margin-top: 16px; padding: 12px 16px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
                          <p style="margin: 0; color: #991b1b; font-size: 14px; line-height: 1.5;">
                            <strong>Task Details:</strong><br>
                            ${task.description}
                          </p>
                        </div>

                        <div style="margin-top: 20px; text-align: center;">
                          <a href="${origin}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 14px; font-weight: bold;">
                            Review Task
                          </a>
                        </div>
                      </div>

                      <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 20px;">
                        © 2025 TaskFlow. All rights reserved.
                      </p>
                    </div>
                    `,
            });
          });
        }
      });
    }
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
  sendTaskAssignmentEmail,
];
