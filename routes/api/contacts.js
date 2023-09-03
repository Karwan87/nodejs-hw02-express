const express = require("express");
const contactsRouter = express.Router();
const Contact = require("../../models/contactModel");
const { listContacts } = require("../../models/contacts");

// const Joi = require("joi");
// working with JSON file

// const contactSchema = Joi.object({
//   name: Joi.string().required(),
//   email: Joi.string().email().required(),
//   phone: Joi.string().required(),
// });
// router.get("/", async (req, res, next) => {
//   try {
//     const contactsList = await contactsModel.listContacts();
//     res.status(200).json(contactsList);
//   } catch (error) {
//     next(error);
//   }
// });

// router.get("/:contactId", async (req, res, next) => {
//   const contactId = req.params.contactId;
//   try {
//     const contact = await contactsModel.getContactById(contactId);
//     if (contact) {
//       res.status(200).json(contact);
//     } else {
//       res.status(400).json({ message: "Contact not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// });
// router.post("/", async (req, res, next) => {
//   const { error } = contactSchema.validate(req.body);
//   if (error) {
//     return res.status(400).json({ message: error.details[0].message });
//   }

//   try {
//     const newContact = await contactsModel.addContact(req.body);
//     res.status(201).json(newContact);
//   } catch (error) {
//     next(error);
//   }
// });
// router.delete("/:contactId", async (req, res, next) => {
//   const contactId = req.params.contactId;
//   try {
//     const result = await contactsModel.removeContact(contactId);
//     if (result) {
//       res.status(200).json({ message: "Contact deleted" });
//     } else {
//       res.status(404).json({ message: "Not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// });
// router.put("/:contactId", async (req, res, next) => {
//   const contactId = req.params.contactId;
//   const updatedData = req.body;

//   if (!updatedData || Object.keys(updatedData).length === 0) {
//     return res.status(400).json({ message: "missing fields" });
//   }

//   try {
//     const updatedContact = await contactsModel.updateContact(
//       contactId,
//       updatedData
//     );

//     if (updatedContact) {
//       res.status(200).json(updatedContact);
//     } else {
//       res.status(404).json({ message: "Not found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// });

//  working with mongoDB

// Pobierz wszystkie kontakty
contactsRouter.get("/", async (req, res) => {
  try {
    const contacts = await listContacts();
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Pobierz konkretny kontakt po ID
contactsRouter.get("/:contactId", async (req, res, next) => {
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

// Dodaj nowy kontakt
contactsRouter.post("/", async (req, res, next) => {
  const newContactData = req.body;
  try {
    const newContact = await Contact.create(newContactData);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

// Usuń kontakt po ID
contactsRouter.delete("/:contactId", async (req, res, next) => {
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
contactsRouter.put("/:contactId", async (req, res, next) => {
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
contactsRouter.patch("/:contactId/favorite", async (req, res, next) => {
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
});

module.exports = contactsRouter;
