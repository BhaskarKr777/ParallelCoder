ALTER TABLE "WorkspaceInvite"
  ADD COLUMN "usedAt" TIMESTAMP(3),
  ADD COLUMN "acceptedById" TEXT;

ALTER TABLE "WorkspaceInvite"
  ADD CONSTRAINT "WorkspaceInvite_acceptedById_fkey"
  FOREIGN KEY ("acceptedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
