import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  title: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column()
  role: string;

  @Column({ type: 'varchar', nullable: true })
  specialty: string | null;

  @Column({ type: 'int', nullable: true })
  tier: number | null;

  @Column({ type: 'varchar', default: 'All states' })
  scope: string;

  @Column({ type: 'varchar', nullable: true })
  lga: string | null;

  @Column({ type: 'varchar', nullable: true })
  community: string | null;

  @Column({ type: 'varchar', default: 'active' })
  status: string;

  @Column({ type: 'boolean', default: false })
  isSuperAdmin: boolean;

  @Column({ type: 'jsonb', nullable: true })
  permissions: string[] | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  passwordHash: string | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  pinHash: string | null;

  @Column({ type: 'int', default: 0 })
  pinAttempts: number;

  @Column({ type: 'timestamptz', nullable: true })
  pinLockedUntil: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
