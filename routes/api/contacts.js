const express = require("express");
const contactsRouter = express.Router();
const Contact = require("../../models/contactModel");
const { listContacts } = require("../../models/contacts");
const authMiddleware = require("../../auth/authMiddleware");

contactsRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

contactsRouter.get("/:contactId", authMiddleware, async (req, res, next) => {
  const contactId = req.params.contactId;
  try {
    const contact = await Contact.findById(contactId);
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: "Contact not found" });
    }
  } catch (error) {
    next(error);
  }
});

contactsRouter.post("/", authMiddleware, async (req, res, next) => {
  const newContactData = req.body;
  try {
    const newContact = await Contact.create(newContactData);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

contactsRouter.delete("/:contactId", authMiddleware, async (req, res, next) => {
  const contactId = req.params.contactId;
  try {
    const result = await Contact.findByIdAndDelete(contactId);
    if (result) {
      res.status(200).json({ message: "Contact deleted" });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});
contactsRouter.put("/:contactId", authMiddleware, async (req, res, next) => {
  const contactId = req.params.contactId;
  const updatedData = req.body;

  if (!updatedData || Object.keys(updatedData).length === 0) {
    return res.status(400).json({ message: "missing fields" });
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      updatedData,
      { new: true }
    );

    if (updatedContact) {
      res.status(200).json(updatedContact);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    next(error);
  }
});
contactsRouter.patch(
  "/:contactId/favorite",
  authMiddleware,
  async (req, res, next) => {
    const contactId = req.params.contactId;
    const { favorite } = req.body;

    if (favorite === undefined) {
      return res.status(400).json({ message: "missing field favorite" });
    }

    try {
      const updatedContact = await Contact.findByIdAndUpdate(
        contactId,
        { favorite },
        { new: true }
      );

      if (updatedContact) {
        res.status(200).json(updatedContact);
      } else {
        res.status(404).json({ message: "Not found" });
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = contactsRouter;
