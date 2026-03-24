import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Account } from './account.entity';

@Entity('transactions')
@Index('idx_tx_date', ['transactionDate'])
@Index('idx_tx_status', ['status'])
@Index('idx_tx_type', ['transactionType'])
@Index('idx_tx_currency', ['currency'])
@Index('idx_tx_reference', ['reference'])
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  reference: string;

  @Column({ type: 'enum', enum: ['WIRE', 'ACH', 'SWIFT', 'SEPA', 'INTERNAL', 'CHECK', 'CARD', 'FX'] })
  transactionType: string;

  @Column({ type: 'enum', enum: ['COMPLETED', 'PENDING', 'FAILED', 'REVERSED', 'ON_HOLD', 'CANCELLED'] })
  status: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  fee: number;

  @Column({ length: 3 })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 6, nullable: true })
  exchangeRate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, nullable: true })
  convertedAmount: number;

  @Column({ length: 3, nullable: true })
  targetCurrency: string;

  @ManyToOne(() => Account, (account) => account.sentTransactions)
  @JoinColumn({ name: 'senderAccountId' })
  senderAccount: Account;

  @Column()
  senderAccountId: number;

  @ManyToOne(() => Account, (account) => account.receivedTransactions)
  @JoinColumn({ name: 'receiverAccountId' })
  receiverAccount: Account;

  @Column()
  receiverAccountId: number;

  @Column({ length: 120 })
  senderName: string;

  @Column({ length: 120 })
  receiverName: string;

  @Column({ length: 100 })
  senderBank: string;

  @Column({ length: 100 })
  receiverBank: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ length: 60, nullable: true })
  category: string;

  @Column({ type: 'datetime' })
  transactionDate: Date;

  @Column({ type: 'datetime', nullable: true })
  valueDate: Date;

  @Column({ type: 'datetime', nullable: true })
  settlementDate: Date;

  @Column({ length: 60, nullable: true })
  region: string;

  @Column({ length: 60, nullable: true })
  branch: string;

  @Column({ length: 50, nullable: true })
  channel: string;

  @Column({ type: 'int', nullable: true })
  riskScore: number;

  @CreateDateColumn()
  createdAt: Date;
}
