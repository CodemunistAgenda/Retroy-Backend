export function errorResponse(res: any, status: number, message: string, err?: any): void {
  res.status(status).json({ message, err });
}

export function successResponse(res: any, status: number, message: string, data?: any): void {
  res.status(status).json({ message, data });
}
