const express = require('express');
const path = require('path');
const da = require('./data-access'); // Import data-access.js
const bodyParser = require('body-parser');

const app = express();
const port = 4000;

// Add bodyParser middleware
app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to get customers from MongoDB
app.get('/api/customers', async (req, res) => {
  const [cust, err] = await da.getCustomers();
  if (cust) {
    res.json(cust);
  } else {
    res.status(500).json({ error: err });
  }
});

// Endpoint to reset customers in MongoDB
app.get('/api/reset', async (req, res) => {
  const result = await da.resetCustomers();
  if (result && !result.startsWith("Error")) {
    res.json({ message: result });
  } else {
    res.status(500).json({ error: result });
  }
});

// Endpoint to add a new customer to MongoDB
app.post('/api/customers', async (req, res) => {
  const newCustomer = req.body;
  if (!newCustomer) {
    res.status(400).send("missing request body");
    return;
  }
  const [status, id, errMessage] = await da.addCustomer(newCustomer);
  if (status === "success") {
    newCustomer._id = id;
    res.status(201).json(newCustomer);
  } else {
    res.status(400).send(errMessage);
  }
});

// Endpoint to get a customer by ID from MongoDB
app.get('/api/customers/:id', async (req, res) => {
  const id = req.params.id;
  const [customer, errMessage] = await da.getCustomerById(id);
  if (customer === null) {
    res.status(404).send(errMessage);
  } else {
    res.json(customer);
  }
});

// Endpoint to update a customer by ID in MongoDB
app.put('/api/customers/:id', async (req, res) => {
  const updatedCustomer = req.body;
  const id = req.params.id;
  if (!updatedCustomer) {
    res.status(400).send("missing request body");
    return;
  }
  delete updatedCustomer._id;
  updatedCustomer.id = +id;
  const [message, errMessage] = await da.updateCustomer(updatedCustomer);
  if (message) {
    res.json({ message });
  } else {
    res.status(400).send(errMessage);
  }
});

// Endpoint to delete a customer by ID in MongoDB
app.delete('/api/customers/:id', async (req, res) => {
  const id = req.params.id;
  const [message, errMessage] = await da.deleteCustomerById(id);
  if (message === null) {
    res.status(404).send(errMessage);
  } else {
    res.json({ message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
});