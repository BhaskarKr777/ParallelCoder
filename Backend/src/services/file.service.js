import prisma from "../config/prisma.js";

const DEFAULT_PROJECT_NAME = "main";

export const getOrCreateDefaultProject = async (workspaceId) => {
  const existing = await prisma.project.findFirst({
    where: { workspaceId },
    orderBy: { id: "asc" },
  });

  if (existing) return existing;

  return prisma.project.create({
    data: { workspaceId, name: DEFAULT_PROJECT_NAME },
  });
};

export const listFiles = async (workspaceId) => {
  const project = await getOrCreateDefaultProject(workspaceId);

  const files = await prisma.file.findMany({
    where: { projectId: project.id },
    orderBy: { name: "asc" },
  });

  return { project: { id: project.id, name: project.name }, files };
};

export const createFile = async (workspaceId, { name, path, language }) => {
  const project = await getOrCreateDefaultProject(workspaceId);

  return prisma.file.create({
    data: {
      projectId: project.id,
      name,
      path: path || name,
      language: language || null,
    },
  });
};

export const updateFile = async (fileId, { content, name }) => {
  const data = {};

  if (content !== undefined) data.content = content;
  if (name !== undefined) data.name = name;

  return prisma.file.update({ where: { id: fileId }, data });
};

export const deleteFile = async (fileId) => {
  await prisma.file.delete({ where: { id: fileId } });
};

export const getFileWorkspaceId = async (fileId) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: { project: { select: { workspaceId: true } } },
  });

  if (!file) {
    const error = new Error("File not found");
    error.status = 404;
    throw error;
  }

  return file.project.workspaceId;
};
