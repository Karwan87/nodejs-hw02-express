const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const contactsFilePath = path.join(__dirname, "contacts.json");

const readContactsFile = async () => {
  try {
    const content = await fs.readFile(contactsFilePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error("Error reading contacts file");
  }
};
const listContacts = async () => {
  const contacts = await readContactsFile();
  return contacts;
};

const getContactById = async (contactId) => {
  const contacts = await readContactsFile();
  return contacts.find((contact) => contact.id === contactId);
};

const writeContactsFile = async (data) => {
  try {
    await fs.writeFile(contactsFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error("Error writing contacts file");
  }
};

const addContact = async (body) => {
  const contacts = await readContactsFile();
  const newContact = { id: uuidv4(), ...body };
  contacts.push(newContact);
  await writeContactsFile(contacts);
  return newContact;
};

const removeContact = async (contactId) => {
  const contacts = await readContactsFile();
  const updatedContacts = contacts.filter(
    (contact) => contact.id !== contactId
  );
  await writeContactsFile(updatedContacts);
  return updatedContacts.length !== contacts.length;
};

const updateContact = async (contactId, body) => {
  const contacts = await readContactsFile();
  const indexToUpdate = contacts.findIndex(
    (contact) => contact.id === contactId
  );

  if (indexToUpdate === -1) {
    return null;
  }

  const updatedContact = { ...contacts[indexToUpdate], ...body };
  contacts[indexToUpdate] = updatedContact;
  await writeContactsFile(contacts);

  return updatedContact;
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
