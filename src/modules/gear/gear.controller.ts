import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { gearService } from "./gear.service";

import { listGearSchema } from "./gear.validation";

class GearController {
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { query } = listGearSchema.parse({ query: req.query });
    const { items, meta } = await gearService.getAll(query);
    sendResponse(res, {
      message: "Gears retrieved successfully",
      meta,
      data: items,
    });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const gear = await gearService.getById(req.params.id);
    sendResponse(res, {
      message: "Gears retrieved successfully",
      data: gear,
    });
  });
}

export const gearController = new GearController();
