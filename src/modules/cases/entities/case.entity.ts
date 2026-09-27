import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export interface CaseNote { id: string; body: string; by: string; role?: string; at: string; status?: string }
export interface CaseEscalation { id: string; from: number; to: number; reason: string; by: string; at: string; to_officer?: string | null; stageBefore?: string }
export interface CaseReferral { id: string; body: string; bodyType?: string | null; reason: string; consent?: boolean | null; riskLevel?: string | null; safetyNote?: string | null; by: string; at: string }
export interface CaseActivity { type: string; note: string; by?: string; at: string }
export interface CorrectiveAction { id: string; action: string; responsible?: string; dueDate?: string; status: string; completedAt?: string | null }
export interface Appeal { id: string; ref: string; grounds: string; desiredOutcome?: string; by: string; at: string; decision?: string | null }

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  code: string;

  @Column()
  complainant: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', nullable: true })
  email: string | null;

  @Column({ type: 'boolean', default: false })
  anonymous: boolean;

  @Index()
  @Column()
  state: string;

  @Column({ type: 'varchar', nullable: true })
  lga: string | null;

  @Column({ type: 'varchar', nullable: true })
  community: string | null;

  @Column({ type: 'float', nullable: true })
  lat: number | null;

  @Column({ type: 'float', nullable: true })
  lng: number | null;

  @Index()
  @Column()
  category: string;

  @Column({ type: 'varchar', nullable: true })
  subcategory: string | null;

  @Column()
  channel: string;

  @Column({ type: 'varchar', nullable: true })
  channelDetail: string | null;

  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Index()
  @Column({ type: 'varchar', default: 'received' })
  status: string;

  @Column({ type: 'int', default: 1 })
  tier: number;

  @Column({ type: 'timestamptz', name: 'tier_since', nullable: true })
  tierSince: Date | null;

  @Column({ type: 'varchar', nullable: true })
  responsibleUnit: string | null;

  @Column({ type: 'varchar', nullable: true })
  assignedOfficer: string | null;

  @Column({ type: 'varchar', nullable: true })
  screening: string | null;

  @Column({ type: 'boolean', default: false })
  legacy: boolean;

  @Column({ type: 'text', nullable: true })
  narrative: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamptz', name: 'due_at', nullable: true })
  dueAt: Date | null;

  @Column({ type: 'timestamptz', name: 'resolved_at', nullable: true })
  resolvedAt: Date | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  notes: CaseNote[];

  @Column({ type: 'jsonb', nullable: true })
  investigation: Record<string, any> | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  correctiveActions: CorrectiveAction[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  appeals: Appeal[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  escalations: CaseEscalation[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  referrals: CaseReferral[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  activity: CaseActivity[];

  @Column({ type: 'jsonb', nullable: true })
  satisfaction: Record<string, any> | null;

  @Column({ type: 'boolean', default: false })
  autoEscalated: boolean;

  @Column({ type: 'varchar', nullable: true })
  registeredBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
