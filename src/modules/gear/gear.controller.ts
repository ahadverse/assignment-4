import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { gearService } from "./gear.service";

import { gearAvailabilitySchema, listGearSchema } from "./gear.validation";

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

  getBrands = catchAsync(async (_req: Request, res: Response) => {
    const brands = await gearService.getBrands();
    sendResponse(res, {
      message: "Brands retrieved successfully",
      data: brands,
    });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const gear = await gearService.getById(req.params.id);
    sendResponse(res, {
      message: "Gears retrieved successfully",
      data: gear,
    });
  });

  getAvailability = catchAsync(async (req: Request, res: Response) => {
    const { query } = gearAvailabilitySchema.parse({ query: req.query });
    const availability = await gearService.getAvailability(
      req.params.id,
      query,
    );
    sendResponse(res, {
      message: "Gear availability retrieved successfully",
      data: availability,
    });
  });
}

export const gearController = new GearController();
