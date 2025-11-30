// This file is kept for backward compatibility
// Prisma handles base fields automatically via schema.prisma

export abstract class BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}