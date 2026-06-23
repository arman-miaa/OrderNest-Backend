import prisma from '../../../shared/prisma';
import { UserRole, UserStatus } from '@prisma/client';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';


const createIntoDb = async (data: any) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const result = await prisma.menuItem.create({ data });
    return result;
  });

  return transaction;
};

const getListFromDb = async () => {
  
    const result = await prisma.menuItem.findMany();
    return result;
};

const getByIdFromDb = async (id: string) => {
  
    const result = await prisma.menuItem.findUnique({ where: { id } });
    if (!result) {
      throw new Error('MenuItem not found');
    }
    return result;
  };



const updateIntoDb = async (id: string, data: any) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const result = await prisma.menuItem.update({
      where: { id },
      data,
    });
    return result;
  });

  return transaction;
};

const toggleStockIntoDb = async (id: string) => {
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) {
    throw new Error('MenuItem not found');
  }
  const result = await prisma.menuItem.update({
    where: { id },
    data: { inStock: !item.inStock },
  });
  return result;
};

const deleteItemFromDb = async (id: string) => {
  const transaction = await prisma.$transaction(async (prisma: any) => {
    const deletedItem = await prisma.menuItem.delete({
      where: { id },
    });

    // Add any additional logic if necessary, e.g., cascading deletes
    return deletedItem;
  });

  return transaction;
};
;

export const menuItemService = {
createIntoDb,
getListFromDb,
getByIdFromDb,
updateIntoDb,
toggleStockIntoDb,
deleteItemFromDb,
};