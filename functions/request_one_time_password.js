const admin = require("firebase-admin");
const twilio = require("./twilio");

module.exports = (req, res) => {
  if (!req.body.phone) {
    return res.status(422).send({ error: "You must provide a phone number" });
  }

  const phone = String(req.body.phone).replace(/[^\d]/g, "");
  admin
    .auth()
    .getUser(phone)
    .then((userRecord) => {
      const code = Math.floor(Math.random() * 8999 + 1000);
      twilio.messages.create(
        {
          body: `Your code is ${code}`,
          to: `+${phone}`,
          from: "+13202166097",
        },
        (err) => {
          if (err) {
            return res.status(422).send(err);
          }
          admin
            .firestore()
            .doc("users/" + phone)
            .set({ code: code, codeValid: true }, { merge: true })
            .then((docRef) => {
              console.log(docRef);
              return res.send({ success: true });
            })
            .catch((err) => res.status(422).send({ error: err }));
        }
      );
    })
    .catch((err) => res.status(422).send({ error: err }));
};
