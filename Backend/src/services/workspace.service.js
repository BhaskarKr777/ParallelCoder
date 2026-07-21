import prisma from "../config/prisma.js";

const MANAGER_ROLES = ["OWNER", "ADMIN"];
const INVITABLE_ROLES = ["ADMIN", "EDITOR", "VIEWER"];

const workspaceSummary = (member) => ({
  id: member.workspace.id,
  name: member.workspace.name,
  role: member.role,
  memberCount: member.workspace._count.members,
  createdAt: member.workspace.createdAt,
});

const memberSummary = (member) => ({
  id: member.id,
  role: member.role,
  userId: member.user.id,
  username: member.user.username,
  email: member.user.email,
  avatar: member.user.avatar,
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

export const assertCanEdit = (member) => {
  if (member.role === "VIEWER") {
    const error = new Error("Viewers don't have edit access to this workspace");
    error.status = 403;
    throw error;
  }
};

export const assertManager = async (userId, workspaceId) => {
  const member = await assertMembership(userId, workspaceId);

  if (!MANAGER_ROLES.includes(member.role)) {
    const error = new Error("Only workspace owners/admins can manage members");
    error.status = 403;
    throw error;
  }

  return member;
};

export const getWorkspaceForUser = async (userId, workspaceId) => {
  const member = await assertMembership(userId, workspaceId);
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });

  if (!workspace) {
    const error = new Error("Workspace not found");
    error.status = 404;
    throw error;
  }

  return {
    id: workspace.id,
    name: workspace.name,
    role: member.role,
    createdAt: workspace.createdAt,
  };
};

export const listMembers = async (workspaceId) => {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { user: { username: "asc" } },
  });

  return members.map(memberSummary);
};

export const getWorkspaceMember = async (workspaceId, memberId) => {
  const member = await prisma.workspaceMember.findUnique({ where: { id: memberId } });

  if (!member || member.workspaceId !== workspaceId) {
    const error = new Error("Member not found");
    error.status = 404;
    throw error;
  }

  return member;
};

export const inviteMemberByEmail = async (workspaceId, email, role) => {
  if (!INVITABLE_ROLES.includes(role)) {
    const error = new Error("Invalid role");
    error.status = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error("No account found for that email");
    error.status = 404;
    throw error;
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
  });

  if (existing) {
    const error = new Error(`${user.username} is already a member of this workspace`);
    error.status = 409;
    throw error;
  }

  const member = await prisma.workspaceMember.create({
    data: { workspaceId, userId: user.id, role },
    include: { user: true },
  });

  return memberSummary(member);
};

export const updateMemberRole = async (workspaceId, memberId, role) => {
  if (!INVITABLE_ROLES.includes(role)) {
    const error = new Error("Invalid role");
    error.status = 400;
    throw error;
  }

  const member = await getWorkspaceMember(workspaceId, memberId);

  if (member.role === "OWNER") {
    const error = new Error("The workspace owner's role can't be changed");
    error.status = 400;
    throw error;
  }

  const updated = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
    include: { user: true },
  });

  return memberSummary(updated);
};

export const removeMember = async (workspaceId, memberId) => {
  const member = await getWorkspaceMember(workspaceId, memberId);

  if (member.role === "OWNER") {
    const error = new Error("The workspace owner can't be removed");
    error.status = 400;
    throw error;
  }

  await prisma.workspaceMember.delete({ where: { id: memberId } });
};

export { MANAGER_ROLES };
