import prisma from '../../../shared/prisma';
import { UserRole, UserStatus } from '@prisma/client';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
import { getSocketIo } from '../../../shared/websocket';


const createIntoDb = async (data: any) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const result = await prisma.table.create({ data });
    return result;
  });

  return transaction;
};

const getListFromDb = async () => {
  
    const result = await prisma.table.findMany();
    return result;
};

const getByIdFromDb = async (id: string) => {
  
    const result = await prisma.table.findUnique({ where: { id } });
    if (!result) {
      throw new Error('Table not found');
    }
    return result;
  };



const updateIntoDb = async (id: string, data: any) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const result = await prisma.table.update({
      where: { id },
      data,
    });
    getSocketIo().emit('table_updated', result);
    return result;
  });

  return transaction;
};

const updateStatusIntoDb = async (id: string, status: any) => {
  const result = await prisma.table.update({
    where: { id },
    data: { status },
  });
  getSocketIo().emit('table_updated', result);
  return result;
};

const deleteItemFromDb = async (id: string) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const deletedItem = await prisma.table.delete({
      where: { id },
    });

    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
  });

  return transaction;
};
;

export const tableService = {
createIntoDb,
getListFromDb,
getByIdFromDb,
updateIntoDb,
updateStatusIntoDb,
deleteItemFromDb,
};