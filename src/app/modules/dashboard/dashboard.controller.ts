import httpStatus from 'http-status';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { dashboardService } from './dashboard.service';

const getDashboardSummary = catchAsync(async (req: any, res: any) => {
  const result = await dashboardService.getSummaryFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard summary retrieved successfully',
    data: result,
  });
});

export const dashboardController = { getDashboardSummary };
