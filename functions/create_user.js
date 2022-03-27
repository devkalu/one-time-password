const admin = require("firebase-admin");

module.exports = (req, res) => {
  //verify that user provided a phone number
  if (!req.body.phone) {
    return res.status(422).send({ error: "Invalid Entry" });
  }
  // Formate the phone number to remove dashes and parenthesis
  const phone = String(req.body.phone).replace(/[^\d]/g, "");

  // create a new user account using that phone number
  admin
    .auth()
    .createUser({ uid: phone })
    .then((user) => res.send(user))
    .catch((err) => res.status(422).send({ error: err }));
  // respond to the user request, saying the account was made
};
