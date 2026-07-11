import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/send-response";
import { UnauthorizedError } from "../../errors";
import { reviewService } from "./review.service";
import { listReviewsSchema } from "./review.validation";

class ReviewController {
  create = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    if (!user?.userId) {
      throw new UnauthorizedError("Authentication required");
    }
    const review = await reviewService.create(user.userId, user.role, req.body);
    sendResponse(res, {
      statusCode: 201,
      message: "Review submitted successfully",
      data: review,
    });
  });

  getForGear = catchAsync(async (req: Request, res: Response) => {
    const { query } = listReviewsSchema.parse({ query: req.query });
    const { items, meta } = await reviewService.getGearReviews(
      req.params.id,
      query,
    );
    sendResponse(res, {
      message: "Reviews retrieved successfully",
      meta,
      data: items,
    });
  });
}

export const reviewController = new ReviewController();
