import prisma from "../config/prisma.js";

const workspaceSummary = (member) => ({
  id: member.workspace.id,
  name: member.workspace.name,
  role: member.role,
  memberCount: member.workspace._count.members,
  createdAt: member.workspace.createdAt,
});

export const createWorkspace = async (userId, name) => {
  const workspace = await prisma.workspace.create({
    data: {
      name,
      ownerId: userId,
      members: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  return {
    id: workspace.id,
    name: workspace.name,
    role: "OWNER",
    memberCount: 1,
    createdAt: workspace.createdAt,
  };
};

export const listWorkspacesForUser = async (userId) => {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { workspace: { createdAt: "desc" } },
  });

  return memberships.map(workspaceSummary);
};

export const assertMembership = async (userId, workspaceId) => {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  if (!member) {
    const error = new Error("You don't have access to this workspace");
    error.status = 403;
    throw error;
  }

  return member;
};
