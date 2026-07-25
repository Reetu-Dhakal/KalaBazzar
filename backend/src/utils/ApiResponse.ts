export class ApiResponse<T = any> {
  constructor(
    public success: boolean,
    public message: string,
    public data?: T,
    public meta?: any
  ) {}

  static success<T>(data: T, message: string = 'Success', meta?: any): ApiResponse<T> {
    return new ApiResponse(true, message, data, meta);
  }

  static error(message: string, statusCode: number = 400, code?: string, errors?: any[]): ApiResponse<null> {
    const response = new ApiResponse(false, message, null);
    (response as any).statusCode = statusCode;
    if (code) (response as any).code = code;
    if (errors) (response as any).errors = errors;
    return response as any;
  }

  static created<T>(data: T, message: string = 'Created'): ApiResponse<T> {
    const response = new ApiResponse(true, message, data);
    (response as any).statusCode = 201;
    return response as any;
  }

  static paginated<T>(
    data: T[],
    message: string,
    page: number,
    limit: number,
    total: number
  ): ApiResponse<T[]> {
    return new ApiResponse(true, message, data, {
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  }
}