import prisma from '../../../shared/prisma';
import ApiError from '../../../errors/ApiErrors';
import httpStatus from 'http-status';

const createIntoDb = async (data: any) => {
  // ✅ Only include fields that exist in Prisma schema
  const payload = {
    name: data.name,
    description: data.description || "",
    price: parseFloat(data.price) || 0,  // ✅ Ensure float
    category: data.category || "Starter",
    inStock: data.inStock !== undefined ? data.inStock : true,
    // ❌ Don't include prepTime - it's not in your schema
    // ❌ Don't include image - unless you have it in schema
  };

  console.log("Creating menu item with:", payload); // Debug

  const result = await prisma.menuItem.create({ data: payload });
  return result;
};

const getListFromDb = async () => {
  const result = await prisma.menuItem.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return result;
};

const getByIdFromDb = async (id: string) => {
  const result = await prisma.menuItem.findUnique({ where: { id } });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Menu item not found');
  }
  return result;
};

const updateIntoDb = async (id: string, data: any) => {
  // ✅ Check if item exists
  const existingItem = await prisma.menuItem.findUnique({ where: { id } });
  if (!existingItem) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Menu item not found');
  }

  // ✅ Clean data - only include allowed fields
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.description !== undefined) payload.description = data.description;
  if (data.price !== undefined) payload.price = parseFloat(data.price);
  if (data.category !== undefined) payload.category = data.category;
  if (data.inStock !== undefined) payload.inStock = data.inStock;

  const result = await prisma.menuItem.update({
    where: { id },
    data: payload,
  });
  return result;
};

const toggleStockIntoDb = async (id: string) => {
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Menu item not found');
  }
  const result = await prisma.menuItem.update({
    where: { id },
    data: { inStock: !item.inStock },
  });
  return result;
};

const deleteItemFromDb = async (id: string) => {
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Menu item not found');
  }
  const result = await prisma.menuItem.delete({ where: { id } });
  return result;
};

export const menuItemService = {
  createIntoDb,
  getListFromDb,
  getByIdFromDb,
  updateIntoDb,
  toggleStockIntoDb,
  deleteItemFromDb,
};