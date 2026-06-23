import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { userRoutes } from "../modules/User/user.route";
import { tableRoutes } from "../modules/table/table.routes";
import { menuItemRoutes } from "../modules/menuItem/menuItem.routes";
import { orderRoutes } from "../modules/order/order.routes";
import { alertRoutes } from "../modules/alert/alert.routes";
import { dashboardRoutes } from "../modules/dashboard/dashboard.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/tables",
    route: tableRoutes,
  },
  {
    path: "/menu-items",
    route: menuItemRoutes,
  },
  {
    path: "/orders",
    route: orderRoutes,
  },
  {
    path: "/alerts",
    route: alertRoutes,
  },
  {
    path: "/dashboard",
    route: dashboardRoutes,
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
export default router;
