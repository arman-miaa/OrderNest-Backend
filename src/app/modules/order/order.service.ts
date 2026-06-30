import prisma from '../../../shared/prisma';
import { OrderStatus } from '@prisma/client';
import ApiError from '../../../errors/ApiErrors';
import httpStatus from 'http-status';
import { getSocketIo } from '../../../shared/websocket';

const createIntoDb = async (data: any) => {
  // ✅ Find table by tableNumber (frontend sends tableId as table number)
  const table = await prisma.table.findFirst({
    where: { tableNumber: String(data.tableId) }
  });

  if (!table) {
    throw new ApiError(httpStatus.NOT_FOUND, `Table number ${data.tableId} not found`);
  }

  const { totalPrice, subtotal, tax, tableId, isVip, ...rest } = data;

  const result = await prisma.order.create({
    data: {
      ...rest,
      tableId: table.id,  // ✅ Use MongoDB ObjectId, not table number
      totalAmount: totalPrice || 0,  // ✅ Map totalPrice → totalAmount
      status: 'PENDING',
      paymentStatus: 'PENDING',
    },
  });

  // Update table status to OCCUPIED
  await prisma.table.update({
    where: { id: table.id },
    data: { status: 'OCCUPIED' }
  });

  getSocketIo().emit('newOrder', result);
  return result;
};

const getListFromDb = async () => {
  const result = await prisma.order.findMany({
    include: { table: true },
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const getByIdFromDb = async (id: string) => {
  const result = await prisma.order.findUnique({
    where: { id },
    include: { table: true },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  }
  return result;
};

const updateIntoDb = async (id: string, data: any) => {
  const payload: any = { ...data };
  
  // Map totalPrice → totalAmount if present
  if (payload.totalPrice !== undefined) {
    payload.totalAmount = payload.totalPrice;
    delete payload.totalPrice;
  }
  
  // Don't allow updating tableId directly
  delete payload.tableId;

  const result = await prisma.order.update({
    where: { id },
    data: payload,
  });
  getSocketIo().emit('updateOrder', result);
  return result;
};

const updateStatusIntoDb = async (id: string, status: any) => {
  const result = await prisma.order.update({
    where: { id },
    data: { status },
  });
  getSocketIo().emit('updateOrder', result);
  return result;
};

const advanceStatusIntoDb = async (id: string) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');

  const statusFlow: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.SERVED,
  ];
  const currentIndex = statusFlow.indexOf(order.status as OrderStatus);

  if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot advance status further from ' + order.status);
  }

  const nextStatus = statusFlow[currentIndex + 1];

  const result = await prisma.order.update({
    where: { id },
    data: { status: nextStatus },
  });
  getSocketIo().emit('updateOrder', result);
  return result;
};

const deleteItemFromDb = async (id: string) => {
  const deletedItem = await prisma.order.delete({ where: { id } });
  getSocketIo().emit('deleteOrder', { id });
  return deletedItem;
};

export const orderService = {
  createIntoDb,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  updateStatusIntoDb,
  advanceStatusIntoDb,
  deleteItemFromDb,
};