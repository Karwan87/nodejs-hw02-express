const fs = require("fs/promises");
const mongoose = require("mongoose");

const path = require("path");
const Contact = require("../models/contactModel");

const listContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    throw error;
  }
};

const getContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

const addContact = async (body) => {
  const newContact = new Contact(body);
  return await newContact.save();
};

const removeContact = async (contactId) => {
  return await Contact.findByIdAndRemove(contactId);
};

const updateContact = async (contactId, body) => {
  return await Contact.findByIdAndUpdate(contactId, body, { new: true });
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
