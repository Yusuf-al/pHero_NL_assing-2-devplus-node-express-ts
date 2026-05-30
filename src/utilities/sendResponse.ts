import { Response } from "express";

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  error?: any;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    message: data.message,
    success: data.success,
    data: data.data,
    error: data.error,
  });
};

export default sendResponse;
