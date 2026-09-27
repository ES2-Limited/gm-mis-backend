import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('integration_keys')
export class IntegrationKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  label: string;

  @Index()
  @Column()
  prefix: string;

  @Column()
  keyHash: string;

  @Column({ default: 'create_cases' })
  scope: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  @Column({ type: 'int', default: 0 })
  requests: number;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
