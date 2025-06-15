const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { protectCustomer } = require("../utils/authMiddleware");
const { protectDriver } = require("../utils/authMiddleware");

router.post("/create-job", protectCustomer, jobController.createJob);
router.get("/get-jobs", protectCustomer, jobController.getJobs);
router.patch("/update-job/:id", protectCustomer, jobController.updateJob);
router.delete("/delete-job/:id", protectCustomer, jobController.deleteJob);

router.post("/apply", protectDriver, jobController.applyForJob);
router.get("/available-jobs", protectDriver, jobController.getAvailableJobs);
router.post(
  "/mark-done/:applicationId",
  protectDriver,
  jobController.markJobDone
);

router.get(
  "/:jobId/applications",
  protectCustomer,
  jobController.getJobApplications
);

router.post(
  "/accept-application/:applicationId",
  protectCustomer,
  jobController.acceptApplication
);

module.exports = router;
