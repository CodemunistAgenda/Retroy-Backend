export function errorResponse(res: any, status: number, message: string, err?: any): void {
  res.status(status).json({ message, error: err ? err.message : null });
}
