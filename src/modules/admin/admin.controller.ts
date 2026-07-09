import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { adminService } from "./admin.service";
import {
  listGearSchema,
  listRentalsSchema,
  listUsersSchema,
} from "./admin.validation";

class AdminController {
  getUsers = catchAsync(async (req: Request, res: Response) => {
    const { query } = listUsersSchema.parse({ query: req.query });
    const { items, meta } = await adminService.getUsers(query);
    sendResponse(res, {
      message: "Users retrieved successfully",
      meta,
      data: items,
    });
  });

  updateUserStatus = catchAsync(async (req: Request, res: Response) => {
    const user = await adminService.updateUserStatus(req.params.id, req.body);
    sendResponse(res, {
      message: "User status updated successfully",
      data: user,
    });
  });

  getGear = catchAsync(async (req: Request, res: Response) => {
    const { query } = listGearSchema.parse({ query: req.query });
    const { items, meta } = await adminService.getGear(query);
    sendResponse(res, {
      message: "Gear retrieved successfully",
      meta,
      data: items,
    });
  });

  getRentals = catchAsync(async (req: Request, res: Response) => {
    const { query } = listRentalsSchema.parse({ query: req.query });
    const { items, meta } = await adminService.getRentals(query);
    sendResponse(res, {
      message: "Rental orders retrieved successfully",
      meta,
      data: items,
    });
  });
}

export const adminController = new AdminController();
