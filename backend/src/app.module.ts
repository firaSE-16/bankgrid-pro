import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bank } from './entities/bank.entity';
import { Account } from './entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const mysqlUrl = config.get<string>('MYSQL_URL') || config.get<string>('DATABASE_URL');

        if (mysqlUrl) {
          return {
            type: 'mysql',
            url: mysqlUrl,
            entities: [Bank, Account, Transaction],
            synchronize: true,
            logging: false,
            ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : undefined,
          };
        }

        return {
          type: 'mysql',
          host: config.get('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username: config.get('DB_USERNAME', 'root'),
          password: config.get('DB_PASSWORD', 'root'),
          database: config.get('DB_DATABASE', 'bank_grid'),
          entities: [Bank, Account, Transaction],
          synchronize: true,
          logging: false,
        };
      },
    }),
    TransactionsModule,
  ],
})
export class AppModule {}
