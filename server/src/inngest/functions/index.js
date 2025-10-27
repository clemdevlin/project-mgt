import { inngest } from "../client.js";
import { prisma } from "../../lib/prisma.js";

const pickClerkUser = (data) => {
  const primaryId = data?.primary_email_address_id;
  const emails = data?.email_addresses || [];
  const primary = emails.find((e) => e.id === primaryId) || emails[0];
  const email = primary?.email_address || null;
  return {
    id: data?.id,
    email,
    firstName: data?.first_name || null,
    lastName: data?.last_name || null,
    imageUrl: data?.image_url || null,
    createdAt: data?.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data?.updated_at ? new Date(data.updated_at) : new Date(),
  };
};

const clerkUserCreated = inngest.createFunction(
  { id: "clerk.user.created" },
  { event: "clerk/user.created" },
  async ({ event, step }) => {
    return step.run("create-user", async () => {
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
  { id: "clerk.user.updated" },
  { event: "clerk/user.updated" },
  async ({ event, step }) => {
    return step.run("update-user", async () => {
      const user = pickClerkUser(event.data);
      if (!user?.id) return { skipped: true };
      const { id, ...data } = user;
      await prisma.user.updateMany({ where: { id }, data });
      return { id };
    });
  }
);

const clerkUserDeleted = inngest.createFunction(
  { id: "clerk.user.deleted" },
  { event: "clerk/user.deleted" },
  async ({ event, step }) => {
    return step.run("delete-user", async () => {
      const id = event.data?.id;
      if (!id) return { skipped: true };
      await prisma.user.deleteMany({ where: { id } });
      return { id };
    });
  }
);

export const functions = [clerkUserCreated, clerkUserUpdated, clerkUserDeleted];
