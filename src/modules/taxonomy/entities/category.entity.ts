import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  name: string;

  @Column({ type: 'varchar', default: 'Other' })
  domain: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  subgroups: string[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  responsible: string[];

  @Column({ type: 'varchar', nullable: true })
  lead: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  route: string[];

  @Column({ type: 'varchar', default: 'medium' })
  priority: string;

  @Column({ type: 'boolean', default: false })
  restricted: boolean;

  @Column({ type: 'int', default: 1 })
  startLevel: number;

  @Column({ type: 'boolean', default: false })
  custom: boolean;

  @Column({ type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
