import { DataSource } from 'typeorm';
import { Bank } from './entities/bank.entity';
import { Account } from './entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const TOTAL_TRANSACTIONS = 500_000;
const BATCH_SIZE = 5000;

const BANKS_DATA = [
  { code: 'JPM', name: 'JPMorgan Chase & Co.', country: 'United States', swiftCode: 'CHASUS33XXX' },
  { code: 'HSBC', name: 'HSBC Holdings plc', country: 'United Kingdom', swiftCode: 'HSBCGB2LXXX' },
  { code: 'DB', name: 'Deutsche Bank AG', country: 'Germany', swiftCode: 'DEUTDEFFXXX' },
  { code: 'BNP', name: 'BNP Paribas SA', country: 'France', swiftCode: 'BNPAFRPPXXX' },
  { code: 'UBS', name: 'UBS Group AG', country: 'Switzerland', swiftCode: 'UBSWCHZHXXX' },
  { code: 'BARC', name: 'Barclays plc', country: 'United Kingdom', swiftCode: 'BARCGB22XXX' },
  { code: 'CITI', name: 'Citigroup Inc.', country: 'United States', swiftCode: 'CITIUS33XXX' },
  { code: 'SCB', name: 'Standard Chartered plc', country: 'United Kingdom', swiftCode: 'SCBLGB2LXXX' },
  { code: 'MUFG', name: 'Mitsubishi UFJ Financial', country: 'Japan', swiftCode: 'BOTKJPJTXXX' },
  { code: 'ANZ', name: 'ANZ Banking Group', country: 'Australia', swiftCode: 'ANZBAU3MXXX' },
  { code: 'RBC', name: 'Royal Bank of Canada', country: 'Canada', swiftCode: 'ROYCCAT2XXX' },
  { code: 'SAN', name: 'Banco Santander SA', country: 'Spain', swiftCode: 'BSCHESMMXXX' },
  { code: 'ING', name: 'ING Group NV', country: 'Netherlands', swiftCode: 'INGBNL2AXXX' },
  { code: 'GS', name: 'Goldman Sachs Group', country: 'United States', swiftCode: 'GABORUSMXXX' },
  { code: 'MS', name: 'Morgan Stanley', country: 'United States', swiftCode: 'MABORUSMXXX' },
  { code: 'NOM', name: 'Nomura Holdings', country: 'Japan', swiftCode: 'NOMUJPJTXXX' },
  { code: 'CS', name: 'Credit Suisse Group', country: 'Switzerland', swiftCode: 'CRESCHZZXXX' },
  { code: 'BOA', name: 'Bank of America Corp.', country: 'United States', swiftCode: 'BOFAUS3NXXX' },
  { code: 'WF', name: 'Wells Fargo & Company', country: 'United States', swiftCode: 'WFBIUS6SXXX' },
  { code: 'SG', name: 'Société Générale SA', country: 'France', swiftCode: 'SOGEFRPPXXX' },
];

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth',
  'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen',
  'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Ahmed', 'Fatima', 'Wei', 'Yuki', 'Hans', 'Marie', 'Pierre', 'Sofia', 'Carlos', 'Anna',
  'Raj', 'Priya', 'Omar', 'Aisha', 'Kenji', 'Sakura', 'Luca', 'Giulia', 'Erik', 'Ingrid',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Müller', 'Schmidt', 'Tanaka', 'Nakamura', 'Kim', 'Park', 'Dubois', 'Bernard', 'Rossi', 'Ferrari',
  'Singh', 'Patel', 'Al-Rashid', 'Chen', 'Wang', 'Svensson', 'Johansson', 'O\'Brien', 'Campbell', 'Stewart',
];

const COMPANY_NAMES = [
  'Vertex Capital Holdings', 'Atlas Global Trade', 'Meridian Commodities LLC', 'Pinnacle Investments Group',
  'Sterling Financial Corp', 'Pacific Rim Trading Co', 'Northern Star Capital', 'Golden Bridge Enterprises',
  'Sapphire Asset Management', 'Titan Industrial Holdings', 'Quantum Energy Partners', 'Eagle Point Trading',
  'Silverline Logistics', 'Crescent Bay Capital', 'Summit Peak Advisors', 'Ironclad Securities',
  'Bayshore Maritime Ltd', 'Redwood Global Finance', 'Cobalt Mining International', 'Emerald Tech Ventures',
  'Phoenix Rising Capital', 'Opal Financial Services', 'Lighthouse Consulting Group', 'Cascade Valley Fund',
  'Diamond Core Mining', 'Falcon Aerospace Inc', 'Neptune Shipping Group', 'Aurora Borealis Invest',
  'Crimson Shield Holdings', 'Blue Horizon Partners',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'SGD', 'HKD', 'SEK'];
const TX_TYPES = ['WIRE', 'ACH', 'SWIFT', 'SEPA', 'INTERNAL', 'CHECK', 'CARD', 'FX'] as const;
const STATUSES = ['COMPLETED', 'PENDING', 'FAILED', 'REVERSED', 'ON_HOLD', 'CANCELLED'] as const;
const ACCOUNT_TYPES = ['SAVINGS', 'CHECKING', 'BUSINESS', 'INVESTMENT', 'TRUST'] as const;
const CHANNELS = ['ONLINE', 'MOBILE', 'BRANCH', 'ATM', 'API', 'PHONE', 'SWIFT_NET', 'FIX_PROTOCOL'];
const REGIONS = [
  'North America', 'Europe', 'Asia Pacific', 'Middle East', 'Latin America',
  'Africa', 'South Asia', 'Central Europe', 'Scandinavia', 'Oceania',
];
const BRANCHES = [
  'New York HQ', 'London City', 'Tokyo Central', 'Frankfurt Main', 'Singapore CBD',
  'Hong Kong Central', 'Sydney CBD', 'Toronto Bay', 'Zurich Bahnhof', 'Paris Opera',
  'Dubai DIFC', 'Mumbai BKC', 'Shanghai Lujiazui', 'Seoul Gangnam', 'São Paulo Faria Lima',
];
const CATEGORIES = [
  'Trade Settlement', 'Corporate Payment', 'Interbank Transfer', 'FX Conversion',
  'Loan Disbursement', 'Dividend Payment', 'Bond Coupon', 'Margin Call',
  'Salary Payment', 'Tax Payment', 'Insurance Premium', 'Commodity Purchase',
  'Securities Trade', 'Fund Transfer', 'Letter of Credit', 'Treasury Operation',
];
const DESCRIPTIONS_PREFIX = [
  'Payment for invoice', 'Settlement of trade', 'Transfer per agreement', 'Wire transfer ref',
  'ACH batch payment', 'FX conversion order', 'Loan installment', 'Dividend distribution',
  'Margin requirement', 'Regulatory payment', 'Client withdrawal', 'Deposit from',
  'Recurring payment', 'Standing order', 'Direct debit', 'Treasury sweep',
];

const STATUS_WEIGHTS = [0.65, 0.15, 0.05, 0.03, 0.07, 0.05];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

const random = seededRandom(42);

function pick<T>(arr: readonly T[] | T[]): T {
  return arr[Math.floor(random() * arr.length)];
}

function weightedPick<T>(arr: readonly T[] | T[], weights: number[]): T {
  const r = random();
  let cum = 0;
  for (let i = 0; i < weights.length; i++) {
    cum += weights[i];
    if (r <= cum) return arr[i];
  }
  return arr[arr.length - 1];
}

function randomDate(start: Date, end: Date): Date {
  const s = start.getTime();
  return new Date(s + random() * (end.getTime() - s));
}

function generateAccountNumber(bankCode: string, idx: number): string {
  return `${bankCode}${String(idx).padStart(8, '0')}`;
}

function generateName(): string {
  if (random() > 0.6) return pick(COMPANY_NAMES);
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function generateRef(idx: number): string {
  const prefix = pick(['TXN', 'WIR', 'ACH', 'SWF', 'SEP', 'INT', 'CHK', 'CRD']);
  const date = new Date(2024, 0, 1 + Math.floor(idx / 1500));
  const ds = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  return `${prefix}-${ds}-${String(idx).padStart(7, '0')}`;
}

async function seed() {
  const dbUrl = process.env.DATABASE_URL;

  const dsOptions = dbUrl
    ? {
        type: 'postgres' as const,
        url: dbUrl,
        entities: [Bank, Account, Transaction],
        synchronize: true,
        logging: false,
        ssl: dbUrl.includes('render.com') ? { rejectUnauthorized: false } : undefined,
      }
    : {
        type: 'postgres' as const,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'bank_grid',
        entities: [Bank, Account, Transaction],
        synchronize: true,
        logging: false,
      };

  const ds = new DataSource(dsOptions);

  await ds.initialize();
  console.log('Connected to database');

  const txRepo = ds.getRepository(Transaction);
  const existingCount = await txRepo.count();
  if (existingCount >= TOTAL_TRANSACTIONS) {
    console.log(`Already have ${existingCount} transactions. Skipping seed.`);
    await ds.destroy();
    return;
  }

  console.log('Clearing existing data...');
  await txRepo.query('TRUNCATE TABLE transactions CASCADE');
  await txRepo.query('TRUNCATE TABLE accounts CASCADE');
  await txRepo.query('TRUNCATE TABLE banks CASCADE');

  console.log('Seeding banks...');
  const bankRepo = ds.getRepository(Bank);
  const banks: Bank[] = [];
  for (const bd of BANKS_DATA) {
    const bank = bankRepo.create(bd);
    banks.push(await bankRepo.save(bank));
  }
  console.log(`  Created ${banks.length} banks`);

  console.log('Seeding accounts...');
  const accountRepo = ds.getRepository(Account);
  const accounts: Account[] = [];
  let accIdx = 1;
  for (const bank of banks) {
    const numAccounts = 20 + Math.floor(random() * 30);
    for (let i = 0; i < numAccounts; i++) {
      const acc = accountRepo.create({
        accountNumber: generateAccountNumber(bank.code, accIdx++),
        accountHolder: generateName(),
        currency: pick(CURRENCIES),
        accountType: pick(ACCOUNT_TYPES),
        balance: parseFloat((random() * 5_000_000 + 10_000).toFixed(2)),
        status: 'ACTIVE',
        bankId: bank.id,
      });
      accounts.push(await accountRepo.save(acc));
    }
  }
  console.log(`  Created ${accounts.length} accounts`);

  console.log(`Seeding ${TOTAL_TRANSACTIONS.toLocaleString()} transactions...`);
  const startDate = new Date('2023-01-01');
  const endDate = new Date('2026-03-24');

  let created = 0;
  while (created < TOTAL_TRANSACTIONS) {
    const batchSize = Math.min(BATCH_SIZE, TOTAL_TRANSACTIONS - created);
    const batch: Partial<Transaction>[] = [];

    for (let i = 0; i < batchSize; i++) {
      const txIdx = created + i;
      const senderAcc = pick(accounts);
      let receiverAcc = pick(accounts);
      while (receiverAcc.id === senderAcc.id) receiverAcc = pick(accounts);

      const senderBank = banks.find((b) => b.id === senderAcc.bankId)!;
      const receiverBank = banks.find((b) => b.id === receiverAcc.bankId)!;
      const txType = pick(TX_TYPES);
      const status = weightedPick(STATUSES, STATUS_WEIGHTS);
      const currency = pick(CURRENCIES);
      const txDate = randomDate(startDate, endDate);

      let amount: number;
      const r = random();
      if (r < 0.4) amount = parseFloat((random() * 5000 + 100).toFixed(2));
      else if (r < 0.75) amount = parseFloat((random() * 100_000 + 5000).toFixed(2));
      else if (r < 0.92) amount = parseFloat((random() * 1_000_000 + 100_000).toFixed(2));
      else amount = parseFloat((random() * 10_000_000 + 1_000_000).toFixed(2));

      const fee = parseFloat((amount * (random() * 0.005 + 0.0001)).toFixed(2));
      const isFx = txType === 'FX' || (random() > 0.7 && currency !== senderAcc.currency);
      const targetCurrency = isFx ? pick(CURRENCIES.filter((c) => c !== currency)) : undefined;
      const exchangeRate = isFx ? parseFloat((0.5 + random() * 1.5).toFixed(6)) : undefined;
      const convertedAmount = isFx && exchangeRate ? parseFloat((amount * exchangeRate).toFixed(2)) : undefined;

      const valueDate = new Date(txDate);
      valueDate.setDate(valueDate.getDate() + Math.floor(random() * 3));
      const settlementDate = new Date(valueDate);
      settlementDate.setDate(settlementDate.getDate() + Math.floor(random() * 2) + 1);

      batch.push({
        reference: generateRef(txIdx),
        transactionType: txType,
        status,
        amount,
        fee,
        currency,
        exchangeRate,
        convertedAmount,
        targetCurrency,
        senderAccountId: senderAcc.id,
        receiverAccountId: receiverAcc.id,
        senderName: senderAcc.accountHolder,
        receiverName: receiverAcc.accountHolder,
        senderBank: senderBank.name,
        receiverBank: receiverBank.name,
        description: `${pick(DESCRIPTIONS_PREFIX)} #${String(txIdx).padStart(6, '0')}`,
        category: pick(CATEGORIES),
        transactionDate: txDate,
        valueDate,
        settlementDate: status === 'COMPLETED' ? settlementDate : undefined,
        region: pick(REGIONS),
        branch: pick(BRANCHES),
        channel: pick(CHANNELS),
        riskScore: Math.floor(random() * 100),
      });
    }

    await txRepo
      .createQueryBuilder()
      .insert()
      .into(Transaction)
      .values(batch)
      .execute();

    created += batchSize;
    if (created % 50_000 === 0 || created === TOTAL_TRANSACTIONS) {
      const pct = ((created / TOTAL_TRANSACTIONS) * 100).toFixed(1);
      console.log(`  ${created.toLocaleString()} / ${TOTAL_TRANSACTIONS.toLocaleString()} (${pct}%)`);
    }
  }

  console.log('Seed completed successfully!');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
