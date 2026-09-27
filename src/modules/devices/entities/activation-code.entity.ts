import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('activation_codes')
export class ActivationCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  code: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string | null;

  @Column()
  userEmail: string;

  @Column({ type: 'varchar', nullable: true })
  userName: string | null;

  @Index()
  @Column({ type: 'varchar', nullable: true })
  state: string | null;

  @Column({ type: 'varchar', nullable: true })
  role: string | null;

  @Column({ type: 'int', nullable: true })
  tier: number | null;

  @Column({ type: 'varchar', nullable: true })
  issuedBy: string | null;

  @Column({ type: 'int', default: 10 })
  maxOfflineDays: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  deviceId: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  activatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
