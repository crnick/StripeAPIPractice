const express = require("express");
const cors = require("cors");
const stripe = require("stripe");
const uuid = require("uuid/v4");
//secret key goes to backend
//publishable key goes to frontend

const app = express();
app.use(express.json());
app.use(cors());

app.use("/payment", (req, res) => {
  const { product, token } = req.body;

  const idempotencekey = uuid(); //don't charge the user again

  return stripe.customers
    .create({
      email: token.email,
      source: token.id,
    })
    .then((customer) => {
      stripe.charges.create(
        {
          amount: product.amount * 100, //compulsory
          currency: "USD", //compulsory
          customer: customer.id, //compulsory
          receipt_email: token.email,
          description: product.description,
          shipping: {
            name: token.card.name,
            address: {
              country: token.card.address,
            },
            // ask user what is your billing address/ shipping address
          },
        },
        { idempotencekey }
      );
    })
    .then((res) => {
      res.status(200).json(res);
    })
    .catch((err) => {
      console.log(err);
    });
});
app.listen(process.env.PORT, () => console.log("listening"));
