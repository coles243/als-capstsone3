const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // Update if your MongoDB URI is different
const client = new MongoClient(uri);

let collection;

async function connect() {
  if (!collection) {
    await client.connect();
    const db = client.db('custdb');
    collection = db.collection('customers');
  }
}

// Returns an array: [customerData, errorMessage]
async function getCustomers() {
  await connect();
  try {
    const customers = await collection.find({}).toArray();
    throw { "message": "an error occured" }; // Simulate a server error
    return [customers, null];
  } catch (err) {
    console.log(err.message);
    return [null, err.message];
  }
}

async function resetCustomers() {
  await connect();
  const customersArray = [
    { name: "Alice Smith", email: "alice@example.com", age: 30 },
    { name: "Bob Johnson", email: "bob@example.com", age: 40 },
    { name: "Carol Lee", email: "carol@example.com", age: 25 }
  ];
  try {
    await collection.deleteMany({});
    await collection.insertMany(customersArray);
    const count = await collection.countDocuments();
    return `Reset successful. There are now ${count} records in the collection.`;
  } catch (err) {
    return err.message;
  }
}

async function addCustomer(newCustomer) {
  await connect();
  try {
    const result = await collection.insertOne(newCustomer);
    return ["success", result.insertedId, null];
  } catch (err) {
    return ["fail", null, err.message];
  }
}

async function getCustomerById(id) {
  await connect();
  try {
    const customer = await collection.findOne({ id: +id });
    return [customer, null];
  } catch (err) {
    return [null, err.message];
  }
}

async function updateCustomer(updatedCustomer) {
  await connect();
  const filter = { id: updatedCustomer.id };
  const update = { $set: updatedCustomer };
  try {
    await collection.updateOne(filter, update);
    return [`Customer with id ${updatedCustomer.id} updated successfully.`, null];
  } catch (err) {
    return [null, err.message];
  }
}

async function deleteCustomerById(id) {
  await connect();
  try {
    await collection.deleteOne({ id: +id });
    return [`Customer with id ${id} deleted successfully.`, null];
  } catch (err) {
    return [null, err.message];
  }
}

module.exports = { getCustomers, resetCustomers, addCustomer, getCustomerById, updateCustomer, deleteCustomerById };