import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'timestamptz', name: 'at' })
  at: Date;

  @Column()
  actor: string;

  @Column({ type: 'varchar', nullable: true })
  role: string | null;

  @Column({ type: 'varchar', nullable: true })
  scope: string | null;

  @Index()
  @Column()
  action: string;

  @Column({ type: 'varchar', nullable: true })
  label: string | null;

  @Column({ type: 'varchar', nullable: true })
  target: string | null;

  @Column({ type: 'text', nullable: true })
  detail: string | null;

  @Column({ type: 'varchar', nullable: true })
  ip: string | null;

  @Column({ type: 'varchar', default: 'normal' })
  severity: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
