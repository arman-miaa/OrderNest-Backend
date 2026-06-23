import prisma from '../../../shared/prisma';

const getSummaryFromDb = async () => {
  const totalTables = await prisma.table.count();
  const activeOrders = await prisma.order.count({
    where: { status: { notIn: ['SERVED', 'CANCELLED'] } }
  });
  const pendingAlerts = await prisma.alert.count({
    where: { status: 'PENDING' }
  });

  return {
    totalTables,
    activeOrders,
    pendingAlerts,
  };
};

export const dashboardService = { getSummaryFromDb };
