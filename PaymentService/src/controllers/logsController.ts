import type { Request, Response, NextFunction } from "express";
import { logsService } from "../services/logsService.js";

/**
 * Logs Controller for PaymentService
 * Handles log persistence endpoints
 */
export class LogsController {
  /**
   * POST /logs/save - Save all logs from RabbitMQ to database
   */
  async saveLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await logsService.saveLogsFromQueue();
      
      res.status(200).json({
        message: "Logs saved successfully",
        saved: result.saved,
        errors: result.errors,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /logs - Get logs between dates
   * Query params: startDate, endDate, level?, correlationId?
   */
  async getLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { startDate, endDate, level, correlationId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          error: "startDate and endDate query parameters are required",
        });
        return;
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          error: "Invalid date format. Use ISO 8601 format (e.g., 2026-01-13T00:00:00Z)",
        });
        return;
      }

      const logs = await logsService.getLogsBetweenDates(
        start,
        end,
        level as string | undefined,
        correlationId as string | undefined
      );

      res.status(200).json({
        count: logs.length,
        logs,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /logs - Delete all logs from database
   */
  async deleteLogs(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const count = await logsService.deleteAllLogs();
      
      res.status(200).json({
        message: "All logs deleted successfully",
        deletedCount: count,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const logsController = new LogsController();
