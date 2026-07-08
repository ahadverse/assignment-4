import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { categoryService } from "./category.service";

class CategoryController {
  getAll = catchAsync(async (_req: Request, res: Response) => {
    const categories = await categoryService.getAll();
    sendResponse(res, {
      message: "Categories found successfully",
      data: categories,
    });
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body);
    sendResponse(res, {
      statusCode: 201,
      message: "Category created successfully",
      data: category,
    });
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.id, req.body);
    sendResponse(res, {
      message: "Category updated successfully",
      data: category,
    });
  });

  remove = catchAsync(async (req: Request, res: Response) => {
    await categoryService.remove(req.params.id);
    sendResponse(res, {
      message: "Category deleted successfully",
    });
  });
}

export const categoryController = new CategoryController();
