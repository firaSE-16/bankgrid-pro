import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Bank } from './bank.entity';
import { Transaction } from './transaction.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30, unique: true })
  accountNumber: string;

  @Column({ length: 100 })
  accountHolder: string;

  @Column({ length: 3 })
  currency: string;

  @Column({ length: 20 })
  accountType: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  balance: number;

  @Column({ length: 20, default: 'ACTIVE' })
  status: string;

  @ManyToOne(() => Bank, (bank) => bank.accounts)
  @JoinColumn({ name: 'bankId' })
  bank: Bank;

  @Column()
  bankId: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Transaction, (tx) => tx.senderAccount)
  sentTransactions: Transaction[];

  @OneToMany(() => Transaction, (tx) => tx.receiverAccount)
  receivedTransactions: Transaction[];
}
