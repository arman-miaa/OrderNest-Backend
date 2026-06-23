import prisma from '../../../shared/prisma';
import { UserRole, UserStatus, OrderStatus } from '@prisma/client';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { getSocketIo } from '../../../shared/websocket';


const createIntoDb = async (data: any) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const result = await prisma.order.create({ data });
    getSocketIo().emit('newOrder', result);
    return result;
  });

  return transaction;
};

const getListFromDb = async () => {
  
    const result = await prisma.order.findMany();
    return result;
};

const getByIdFromDb = async (id: string) => {
  
    const result = await prisma.order.findUnique({ where: { id } });
    if (!result) {
      throw new Error('Order not found');
    }
    return result;
  };



const updateIntoDb = async (id: string, data: any) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const result = await prisma.order.update({
      where: { id },
      data,
    });
    getSocketIo().emit('updateOrder', result);
    return result;
  });

  return transaction;
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
  if (!order) throw new Error('Order not found');

  const statusFlow: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.SERVED
  ];
  const currentIndex = statusFlow.indexOf(order.status as OrderStatus);
  
  if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
    throw new Error('Cannot advance status further from ' + order.status);
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
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const deletedItem = await prisma.order.delete({
      where: { id },
    });

    getSocketIo().emit('deleteOrder', { id });
    return deletedItem;
  });

  return transaction;
};
;

export const orderService = {
createIntoDb,
getListFromDb,
getByIdFromDb,
updateIntoDb,
updateStatusIntoDb,
advanceStatusIntoDb,
deleteItemFromDb,
};