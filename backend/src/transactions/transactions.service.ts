import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import {
  GridRequestDto,
  ColumnFilter,
  AggregationRequestDto,
  DistinctValuesRequestDto,
  AdvancedSearchItem,
} from './dto/grid-request.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly txRepo: Repository<Transaction>,
  ) {}

  async getRows(dto: GridRequestDto) {
    const qb = this.txRepo.createQueryBuilder('tx');

    this.applyFilters(qb, dto.filterModel);
    this.applySearch(qb, dto.searchTerm);
    this.applyAdvancedSearch(qb, dto.advancedSearch);

    const totalCount = await qb.getCount();

    if (dto.sortModel?.length) {
      dto.sortModel.forEach((s, i) => {
        const col = this.resolveColumn(s.colId);
        if (i === 0) qb.orderBy(col, s.sort === 'desc' ? 'DESC' : 'ASC');
        else qb.addOrderBy(col, s.sort === 'desc' ? 'DESC' : 'ASC');
      });
    } else {
      qb.orderBy('tx.transactionDate', 'DESC');
    }

    qb.skip(dto.startRow).take(dto.endRow - dto.startRow);

    const rows = await qb.getMany();

    return {
      rows,
      lastRow: totalCount,
    };
  }

  async getAggregations(dto: AggregationRequestDto) {
    const qb = this.txRepo.createQueryBuilder('tx');
    this.applyFilters(qb, dto.filterModel);
    this.applySearch(qb, dto.searchTerm);
    this.applyAdvancedSearch(qb, dto.advancedSearch);

    const result: Record<string, { sum: number; avg: number; min: number; max: number; count: number }> = {};

    for (const col of dto.columns) {
      const resolved = this.resolveColumn(col);
      const agg = await qb
        .clone()
        .select(`SUM(${resolved})`, 'sum')
        .addSelect(`AVG(${resolved})`, 'avg')
        .addSelect(`MIN(${resolved})`, 'min')
        .addSelect(`MAX(${resolved})`, 'max')
        .addSelect(`COUNT(*)`, 'count')
        .getRawOne();

      result[col] = {
        sum: parseFloat(agg.sum) || 0,
        avg: parseFloat(agg.avg) || 0,
        min: parseFloat(agg.min) || 0,
        max: parseFloat(agg.max) || 0,
        count: parseInt(agg.count) || 0,
      };
    }

    return result;
  }

  async getDistinctValues(dto: DistinctValuesRequestDto) {
    const col = this.resolveColumn(dto.column);
    const qb = this.txRepo.createQueryBuilder('tx');

    this.applyFilters(qb, dto.filterModel);

    qb.select(`DISTINCT ${col}`, 'value').orderBy(col, 'ASC');

    if (dto.search) {
      qb.andWhere(`${col} LIKE :search`, { search: `%${dto.search}%` });
    }

    qb.limit(500);

    const rows = await qb.getRawMany();
    return rows.map((r) => r.value).filter((v) => v != null);
  }

  async getFilterValues(column: string) {
    const col = this.resolveColumn(column);
    const qb = this.txRepo.createQueryBuilder('tx');

    if (['senderBank', 'receiverBank'].includes(column)) {
      const bankCol = column === 'senderBank' ? 'tx.senderBank' : 'tx.receiverBank';
      const accountCol = column === 'senderBank' ? 'tx.senderName' : 'tx.receiverName';

      const rows = await qb
        .select(bankCol, 'group')
        .addSelect(`GROUP_CONCAT(DISTINCT ${accountCol} ORDER BY ${accountCol} ASC)`, 'items')
        .groupBy(bankCol)
        .orderBy(bankCol, 'ASC')
        .getRawMany();

      return rows.map((r) => ({
        group: r.group,
        items: r.items ? r.items.split(',') : [],
      }));
    }

    const rows = await qb
      .select(`DISTINCT ${col}`, 'value')
      .orderBy(col, 'ASC')
      .limit(1000)
      .getRawMany();

    return rows.map((r) => r.value).filter((v) => v != null);
  }

  async getDashboardStats() {
    const qb = this.txRepo.createQueryBuilder('tx');

    const [totalResult, statusCounts, typeCounts, volumeByMonth] = await Promise.all([
      qb.clone()
        .select('COUNT(*)', 'totalTransactions')
        .addSelect('SUM(tx.amount)', 'totalVolume')
        .addSelect('AVG(tx.amount)', 'avgAmount')
        .getRawOne(),

      qb.clone()
        .select('tx.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('tx.status')
        .getRawMany(),

      qb.clone()
        .select('tx.transactionType', 'type')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(tx.amount)', 'volume')
        .groupBy('tx.transactionType')
        .getRawMany(),

      qb.clone()
        .select("DATE_FORMAT(tx.transactionDate, '%Y-%m')", 'month')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(tx.amount)', 'volume')
        .groupBy('month')
        .orderBy('month', 'DESC')
        .limit(12)
        .getRawMany(),
    ]);

    return {
      totalTransactions: parseInt(totalResult.totalTransactions),
      totalVolume: parseFloat(totalResult.totalVolume),
      avgAmount: parseFloat(totalResult.avgAmount),
      statusBreakdown: statusCounts,
      typeBreakdown: typeCounts,
      volumeByMonth,
    };
  }

  private applyFilters(qb: SelectQueryBuilder<Transaction>, filterModel?: Record<string, ColumnFilter>) {
    if (!filterModel) return;

    Object.entries(filterModel).forEach(([field, filter]) => {
      if (filter.operator && filter.conditions) {
        const conditions = filter.conditions.map((c, i) => this.buildCondition(field, c, `${field}_${i}`));
        const params = {};
        filter.conditions.forEach((c, i) => Object.assign(params, this.buildParams(field, c, `${field}_${i}`)));

        if (filter.operator === 'AND') {
          qb.andWhere(`(${conditions.join(' AND ')})`, params);
        } else {
          qb.andWhere(`(${conditions.join(' OR ')})`, params);
        }
      } else if (filter.filterType === 'set' && filter.values) {
        const col = this.resolveColumn(field);
        qb.andWhere(`${col} IN (:...${field}_vals)`, { [`${field}_vals`]: filter.values });
      } else {
        const condition = this.buildCondition(field, filter, field);
        const params = this.buildParams(field, filter, field);
        if (condition) qb.andWhere(condition, params);
      }
    });
  }

  private buildCondition(field: string, filter: ColumnFilter, paramKey: string): string {
    const col = this.resolveColumn(field);

    switch (filter.filterType) {
      case 'text':
        switch (filter.type) {
          case 'equals': return `${col} = :${paramKey}`;
          case 'notEqual': return `${col} != :${paramKey}`;
          case 'contains': return `${col} LIKE :${paramKey}`;
          case 'notContains': return `${col} NOT LIKE :${paramKey}`;
          case 'startsWith': return `${col} LIKE :${paramKey}`;
          case 'endsWith': return `${col} LIKE :${paramKey}`;
          case 'blank': return `${col} IS NULL OR ${col} = ''`;
          case 'notBlank': return `${col} IS NOT NULL AND ${col} != ''`;
          default: return `${col} LIKE :${paramKey}`;
        }

      case 'number':
        switch (filter.type) {
          case 'equals': return `${col} = :${paramKey}`;
          case 'notEqual': return `${col} != :${paramKey}`;
          case 'greaterThan': return `${col} > :${paramKey}`;
          case 'greaterThanOrEqual': return `${col} >= :${paramKey}`;
          case 'lessThan': return `${col} < :${paramKey}`;
          case 'lessThanOrEqual': return `${col} <= :${paramKey}`;
          case 'inRange': return `${col} BETWEEN :${paramKey}_from AND :${paramKey}_to`;
          default: return `${col} = :${paramKey}`;
        }

      case 'date':
        switch (filter.type) {
          case 'equals': return `DATE(${col}) = :${paramKey}`;
          case 'notEqual': return `DATE(${col}) != :${paramKey}`;
          case 'greaterThan': return `DATE(${col}) > :${paramKey}`;
          case 'lessThan': return `DATE(${col}) < :${paramKey}`;
          case 'inRange': return `DATE(${col}) BETWEEN :${paramKey}_from AND :${paramKey}_to`;
          default: return `DATE(${col}) = :${paramKey}`;
        }

      case 'set':
        return `${col} IN (:...${paramKey}_vals)`;

      default:
        return `${col} LIKE :${paramKey}`;
    }
  }

  private buildParams(field: string, filter: ColumnFilter, paramKey: string): Record<string, any> {
    const params: Record<string, any> = {};

    if (filter.filterType === 'set' && filter.values) {
      params[`${paramKey}_vals`] = filter.values;
      return params;
    }

    if (filter.type === 'blank' || filter.type === 'notBlank') return params;

    if (filter.type === 'inRange') {
      if (filter.filterType === 'date') {
        params[`${paramKey}_from`] = filter.dateFrom;
        params[`${paramKey}_to`] = filter.dateTo;
      } else {
        params[`${paramKey}_from`] = filter.filter;
        params[`${paramKey}_to`] = filter.filterTo;
      }
      return params;
    }

    if (filter.filterType === 'date') {
      params[paramKey] = filter.dateFrom;
    } else if (filter.filterType === 'text') {
      switch (filter.type) {
        case 'contains':
        case 'notContains':
          params[paramKey] = `%${filter.filter}%`;
          break;
        case 'startsWith':
          params[paramKey] = `${filter.filter}%`;
          break;
        case 'endsWith':
          params[paramKey] = `%${filter.filter}`;
          break;
        default:
          params[paramKey] = filter.filter;
      }
    } else {
      params[paramKey] = filter.filter;
    }

    return params;
  }

  private applySearch(qb: SelectQueryBuilder<Transaction>, searchTerm?: string) {
    if (!searchTerm?.trim()) return;

    const term = `%${searchTerm.trim()}%`;
    qb.andWhere(
      `(tx.reference LIKE :term OR tx.senderName LIKE :term OR tx.receiverName LIKE :term
        OR tx.senderBank LIKE :term OR tx.receiverBank LIKE :term
        OR tx.description LIKE :term OR tx.category LIKE :term
        OR tx.status LIKE :term OR tx.transactionType LIKE :term
        OR tx.currency LIKE :term OR tx.channel LIKE :term
        OR CAST(tx.amount AS CHAR) LIKE :term)`,
      { term },
    );
  }

  private applyAdvancedSearch(qb: SelectQueryBuilder<Transaction>, items?: AdvancedSearchItem[]) {
    if (!items?.length) return;

    items.forEach((item, i) => {
      const col = this.resolveColumn(item.column);
      const pk = `adv_${i}`;

      switch (item.operator) {
        case 'equals':
          qb.andWhere(`${col} = :${pk}`, { [pk]: item.value });
          break;
        case 'contains':
          qb.andWhere(`${col} LIKE :${pk}`, { [pk]: `%${item.value}%` });
          break;
        case 'greaterThan':
          qb.andWhere(`${col} > :${pk}`, { [pk]: item.value });
          break;
        case 'lessThan':
          qb.andWhere(`${col} < :${pk}`, { [pk]: item.value });
          break;
        case 'between':
          qb.andWhere(`${col} BETWEEN :${pk}_from AND :${pk}_to`, {
            [`${pk}_from`]: item.value,
            [`${pk}_to`]: item.valueTo,
          });
          break;
        case 'startsWith':
          qb.andWhere(`${col} LIKE :${pk}`, { [pk]: `${item.value}%` });
          break;
      }
    });
  }

  private resolveColumn(field: string): string {
    const map: Record<string, string> = {
      id: 'tx.id',
      reference: 'tx.reference',
      transactionType: 'tx.transactionType',
      status: 'tx.status',
      amount: 'tx.amount',
      fee: 'tx.fee',
      currency: 'tx.currency',
      exchangeRate: 'tx.exchangeRate',
      convertedAmount: 'tx.convertedAmount',
      targetCurrency: 'tx.targetCurrency',
      senderName: 'tx.senderName',
      receiverName: 'tx.receiverName',
      senderBank: 'tx.senderBank',
      receiverBank: 'tx.receiverBank',
      description: 'tx.description',
      category: 'tx.category',
      transactionDate: 'tx.transactionDate',
      valueDate: 'tx.valueDate',
      settlementDate: 'tx.settlementDate',
      region: 'tx.region',
      branch: 'tx.branch',
      channel: 'tx.channel',
      riskScore: 'tx.riskScore',
      createdAt: 'tx.createdAt',
    };
    return map[field] || `tx.${field}`;
  }
}
