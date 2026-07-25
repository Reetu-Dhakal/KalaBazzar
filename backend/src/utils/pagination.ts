import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const getPaginationParams = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

  return { page, limit, skip, sortBy, sortOrder };
};

export const getSortObject = (sortBy: string, sortOrder: 'asc' | 'desc'): Record<string, 1 | -1> => {
  return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
};

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const paginate = async <T>(
  model: any,
  filter: any,
  params: PaginationParams,
  select?: string,
  populate?: string | string[]
): Promise<PaginatedResult<T>> => {
  const { page, limit, skip, sortBy, sortOrder } = params;
  
  const [data, total] = await Promise.all([
    model.find(filter)
      .select(select)
      .populate(populate || '')
      .sort(getSortObject(sortBy, sortOrder))
      .skip(skip)
      .limit(limit)
      .lean(),
    model.countDocuments(filter),
  ]);

  return {
    data: data as T[],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
};