const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Initialize the app
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose
  .connect("mongodb+srv://patelabhiraj222:Abhi775888@cluster0.labl0.mongodb.net/Social_Media?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Mongoose Schema
const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  handle: { type: String, required: true },
  images: { type: [String], required: true },
});

const Submission = mongoose.model("Submission", submissionSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// API routes
app.post("/submit", upload.array("images", 10), async (req, res) => {
  const { name, handle } = req.body;

  // Validate inputs
  if (!name || !handle || !req.files || req.files.length === 0) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Generate image URLs
  const imagePaths = req.files.map(
    (file) => `http://localhost:${PORT}/uploads/${file.filename}`
  );

  try {
    // Save to the database
    const newSubmission = new Submission({
      name,
      handle,
      images: imagePaths,
    });

    await newSubmission.save();
    res.json({ message: "Submission successful!", data: newSubmission });
  } catch (error) {
    console.error("Error saving submission:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/submissions", async (req, res) => {
  try {
    const submissions = await Submission.find();
    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
