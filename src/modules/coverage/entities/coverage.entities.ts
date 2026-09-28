import { Column, Entity, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('coverage_states')
@Index('IDX_coverage_states_name', ['name'], { unique: true })
export class CoverageState {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: true })
  active!: boolean;
}

@Entity('coverage_lgas')
@Unique('UQ_coverage_lgas', ['state', 'name'])
@Index('IDX_coverage_lgas_state', ['state'])
export class CoverageLga {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  state!: string;

  @Column()
  name!: string;

  @Column({ default: true })
  covered!: boolean;
}

@Entity('communities')
@Unique('UQ_communities', ['state', 'lga', 'name'])
@Index('IDX_communities_state', ['state'])
@Index('IDX_communities_lga', ['lga'])
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  state!: string;

  @Column()
  lga!: string;

  @Column()
  name!: string;
}