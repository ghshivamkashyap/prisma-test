const Job = require("../models/job");
const Application = require("../models/application");
const User = require("../models/user");

exports.createJob = async (req, res) => {
  try {
    const { title, amount, pickLocation, dropLocation, distance } = req.body;
    if (!title || !amount || !pickLocation || !dropLocation || !distance) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (typeof amount !== "number" || amount < 0) {
      return res
        .status(400)
        .json({ message: "Amount must be a positive number." });
    }
    if (typeof distance !== "number" || distance < 0) {
      return res
        .status(400)
        .json({ message: "Distance must be a positive number." });
    }
    const job = new Job({
      title,
      amount,
      pickLocation,
      dropLocation,
      distance,
      customer: req.user._id,
    });
    await job.save();
    res.status(201).json({ message: "Job created successfully", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const filter = { customer: req.user._id };
    if (req.query.incomplete === "true") {
      filter.isCompleted = false;
    }
    const jobs = await Job.find(filter);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findOne({ _id: id, customer: req.user._id });
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or not authorized." });
    }
    const { title, amount, pickLocation, dropLocation, distance } = req.body;
    if (title !== undefined) job.title = title;
    if (amount !== undefined) {
      if (typeof amount !== "number" || amount < 0) {
        return res
          .status(400)
          .json({ message: "Amount must be a positive number." });
      }
      job.amount = amount;
    }
    if (pickLocation !== undefined) job.pickLocation = pickLocation;
    if (dropLocation !== undefined) job.dropLocation = dropLocation;
    if (distance !== undefined) {
      if (typeof distance !== "number" || distance < 0) {
        return res
          .status(400)
          .json({ message: "Distance must be a positive number." });
      }
      job.distance = distance;
    }
    await job.save();
    res.json({ message: "Job updated successfully", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findOneAndDelete({ _id: id, customer: req.user._id });
    if (!job) {
      return res
        .status(404)
        .json({ message: "Job not found or not authorized." });
    }
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: "Job ID is required." });
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });

    const existing = await Application.findOne({
      job: jobId,
      driver: req.user._id,
    });
    if (existing)
      return res.status(400).json({ message: "Already applied to this job." });
    const application = new Application({
      job: jobId,
      driver: req.user._id,
    });
    await application.save();
    res.status(201).json({ message: "Applied successfully", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findOne({ _id: jobId, customer: req.user._id });
    if (!job)
      return res
        .status(404)
        .json({ message: "Job not found or not authorized." });
    const applications = await Application.find({ job: jobId }).populate(
      "driver",
      "email phone image"
    );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.acceptApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId).populate(
      "job"
    );
    if (!application)
      return res.status(404).json({ message: "Application not found." });

    if (application.job.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    await Application.updateMany(
      { job: application.job._id },
      { $set: { status: "rejected" } }
    );
    application.status = "accepted";
    await application.save();
    res.json({ message: "Application accepted.", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAvailableJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      customer: { $ne: req.user._id },
      isCompleted: false,
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markJobDone = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { imageUrl, location } = req.body;

    if (!imageUrl || !location) {
      return res
        .status(400)
        .json({ message: "Image URL and location are required." });
    }
    const application = await Application.findOne({
      _id: applicationId,
      driver: req.user._id,
      status: "accepted",
    });
    if (!application) {
      return res
        .status(404)
        .json({ message: "Accepted application not found." });
    }
    application.completed = true;
    application.completedImage = imageUrl;
    application.completedLocation = location;
    await application.save();

    const job = await Job.findById(application.job);
    if (job && !job.isCompleted) {
      job.isCompleted = true;
      await job.save();
    }

    res.json({ message: "Job marked as done.", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
