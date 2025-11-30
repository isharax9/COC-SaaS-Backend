import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '@common/entities/base.entity';
import { User } from './user.entity';

/**
 * Player Entity
 * Represents a Clash of Clans player linked to a user account
 */
@Entity('players')
export class Player extends BaseEntity {
  @Column({ unique: true })
  @Index()
  playerTag: string; // CoC Player Tag (e.g., #2PP)

  @Column()
  playerName: string;

  @Column({ type: 'int' })
  townHallLevel: number;

  @Column({ type: 'int', default: 0 })
  expLevel: number;

  @Column({ type: 'int', default: 0 })
  trophies: number;

  @Column({ nullable: true })
  clanTag: string;

  @Column({ nullable: true })
  clanName: string;

  @Column({ type: 'jsonb', nullable: true })
  rawData: any; // Full API response for flexibility

  @Column({ type: 'timestamp' })
  lastSyncedAt: Date;

  @Column({ default: true })
  isVerified: boolean;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;
}