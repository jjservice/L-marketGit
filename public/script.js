// script.js
document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const checkoutButton = document.getElementById('checkout-button');
  let cart = [];

  // Add event listener to all "Add to Cart" buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const quantityInput = button.previousElementSibling;
      const quantity = parseFloat(quantityInput.value); // Get the fractional quantity entered by the user
      const pricePerPound = parseFloat(button.dataset.price); // Price per pound
      const product = {
        id: button.dataset.id,
        name: button.dataset.name,
        price: pricePerPound * quantity, // Calculate price based on quantity
        quantity: quantity
      };

      // Check if product is already in the cart
      const existingProductIndex = cart.findIndex(item => item.id === product.id);
      if (existingProductIndex >= 0) {
        cart[existingProductIndex].quantity += product.quantity;
        cart[existingProductIndex].price += product.price;
      } else {
        cart.push(product);
      }

      // Update cart UI
      updateCartUI();
    });
  });

  // Update the cart UI
  function updateCartUI() {
    cartItemsContainer.innerHTML = '';
    cart.forEach(item => {
      const cartItem = document.createElement('li');
      cartItem.textContent = `${item.name} (x${item.quantity.toFixed(2)} lbs) - $${item.price.toFixed(2)}`;
      cartItemsContainer.appendChild(cartItem);
    });

    checkoutButton.disabled = cart.length === 0;
  }

  // Checkout process
  checkoutButton.addEventListener('click', async () => {
    const sessionResponse = await fetch('/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cart })
    });
    const session = await sessionResponse.json();

    const stripe = Stripe('pk_test_51QTSb2LPa32ZluPp57bSF7ObgsE3CMMCcM1eSbcuMBDrhRuZV6uYL8EqqpLLiGwIAbEg8crJEYfXBDyBM5fZM5Q600fBMTS2Rt'); // Replace with your Stripe public key
    const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

    if (error) {
      console.error(error);
    }
  });
});
