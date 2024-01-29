import express from "express";
const router = express.Router();
import {
    ReportsController
  } from "../controllers/index.controllers";

router.post("/create", ReportsController.createReport);
router.get("/all", ReportsController.getAllReports);
router.get("/:reportId", ReportsController.getOneReport);

module.exports = router;