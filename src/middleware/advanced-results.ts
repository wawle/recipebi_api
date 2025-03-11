import { Request, NextFunction } from "express";
import { Document, Model } from "mongoose";

// `advancedResults` fonksiyonu TypeScript ile
const advancedResults =
  (model: Model<Document>, populate?: any) =>
  async (req: Request, res: any, next: NextFunction): Promise<void> => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Handle 'like' operator in the query
    Object.keys(reqQuery).forEach((key) => {
      if (
        reqQuery[key] &&
        typeof reqQuery[key] === "object" &&
        (reqQuery[key] as any)?.like
      ) {
        const value = (reqQuery[key] as any)?.like; // Get the value of 'like' (e.g., 'aap')
        reqQuery[key] = { $regex: value, $options: "i" }; // Apply a regex search
      }
    });

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = model.find(JSON.parse(queryStr));

    // Select Fields
    if (req.query.select) {
      const fields = (req.query.select as string).split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    if (populate) {
      query = query.populate(populate);
    }

    // Executing query
    const results = await query;

    // Pagination result
    const pagination: {
      next?: { page: number; limit: number };
      prev?: { page: number; limit: number };
    } = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.advancedResults = {
      success: true,
      total,
      pagination,
      data: results,
    };

    next();
  };

export default advancedResults;
