import prisma from '../../../shared/prisma';
import { UserRole, UserStatus, AlertStatus } from '@prisma/client';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { getSocketIo } from '../../../shared/websocket';


const createIntoDb = async (data: any) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const result = await prisma.alert.create({ data });
    getSocketIo().emit('newAlert', result);
    return result;
  });

  return transaction;
};

const getListFromDb = async () => {
  
    const result = await prisma.alert.findMany();
    return result;
};

const getByIdFromDb = async (id: string) => {
  
    const result = await prisma.alert.findUnique({ where: { id } });
    if (!result) {
      throw new Error('Alert not found');
    }
    return result;
  };



const updateIntoDb = async (id: string, data: any) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const result = await prisma.alert.update({
      where: { id },
      data,
    });
    getSocketIo().emit('updateAlert', result);
    return result;
  });

  return transaction;
};

const resolveAlertIntoDb = async (id: string) => {
  const result = await prisma.alert.update({
    where: { id },
    data: { status: AlertStatus.RESOLVED },
  });
  getSocketIo().emit('updateAlert', result);
  return result;
};

const deleteItemFromDb = async (id: string) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const deletedItem = await prisma.alert.delete({
      where: { id },
    });

    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
  });

  return transaction;
};
;

export const alertService = {
createIntoDb,
getListFromDb,
getByIdFromDb,
updateIntoDb,
resolveAlertIntoDb,
deleteItemFromDb,
};