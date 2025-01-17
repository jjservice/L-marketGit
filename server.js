require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));


const products = [
  { id: 'apple', name: 'Apple', price: 1.99 },
  { id: 'banana', name: 'Banana', price: 2.49 },
  { id: 'cherry', name: 'Cherry', price: 3.99 }
];

// Serve the index page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint to get products
app.get('/products', (req, res) => {
  res.json(products);
});


app.post('/create-checkout-session', async (req, res) => {
  const cart = req.body.cart;

  const line_items = cart.map(item => ({
    price_data: {
      currency: 'usd', 
      product_data: { name: item.name },
      unit_amount: Math.round(item.price * 100), 
    },
    quantity: 1, 
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.HOST}/success.html`,
      cancel_url: `${process.env.HOST}/cancel.html`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

// Serve success page
app.get('/success.html', (req, res) => {
  res.send('<h1>Payment Successful!</h1>');
});

// Serve cancel page
app.get('/cancel.html', (req, res) => {
  res.send('<h1>Payment Canceled. Please try again.</h1>');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
