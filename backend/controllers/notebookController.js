import notebookModel from "../models/notebookModel.js";
import pageModel from "../models/pageModel.js";
import asyncHandler from "../utils/asyncHandler.js";

// Create Notebook (max 40)
export const createNotebook = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name } = req.body;

  if (!name) {
    return res.json({ success: false, message: "Nome obrigatório" });
  }

  const count = await notebookModel.countDocuments({ userId });
  if (count >= 40) {
    return res.json({ success: false, message: "Max 40 notebooks allowed" });
  }

  const notebook = new notebookModel({
    userId,
    name,
    order: count + 1
  });

  await notebook.save();

  res.json({ success: true, notebook });
});


// Get all notebooks of user
export const getNotebooks = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const notebooks = await notebookModel
    .find({ userId })
    .sort({ order: 1 });

  res.json({ success: true, notebooks });
});

// Update Notebook Nome
export const updateNotebook = asyncHandler(async (req, res) => {
  const { notebookId, name } = req.body;
  const userId = req.user.id;

  if (!notebookId || !name) {
    return res.json({ success: false, message: "NotebookId and name required" });
  }

  const notebook = await notebookModel.findOneAndUpdate(
    { _id: notebookId, userId },
    { name },
    { new: true }
  );

  if (!notebook) {
    return res.json({ success: false, message: "Notebook not found" });
  }

  res.json({ success: true, notebook });
});


// Delete Notebook (with user check + cascade delete)
export const deleteNotebook = asyncHandler(async (req, res) => {
  const { notebookId } = req.body;
  const userId = req.user.id;

  const notebook = await notebookModel.findOneAndDelete({
    _id: notebookId,
    userId
  });

  if (!notebook) {
    return res.json({ success: false, message: "Notebook not found" });
  }

  // delete all pages of this notebook
  await pageModel.deleteMany({ notebookId });

  res.json({ success: true });
});
