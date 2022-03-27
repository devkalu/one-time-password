const admin = require("firebase-admin");

module.exports = function (req, res) {
  if (!req.body.phone || !req.body.code) {
    return res.status(422).send({ error: "Phone and code must be provided" });
  }
  const phone = String(req.body.phone).replace(/[^\d]/g, "");
  const code = parseInt(req.body.code);
  admin
    .auth()
    .getUser(phone)
    .then(() => {
      //Setup reference to the document (our user)
      const userRef = admin.firestore().collection("users").doc(phone);

      //Get the data from our user
      userRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            const user = doc.data(); //{code: xxxx, codeValid: bool}

            //Check if code is incorrect or invalid
            if (user.code !== code || !user.codeValid) {
              return res.status(422).send({ error: "Code not valid" });
            }

            //Mark code as invalid. Use merge to only overwrite the new data
            userRef
              .set({ codeValid: false }, { merge: true })
              .then(() => {
                //Code is now invalid
                return res.send({ success: true });
              })
              .catch((err) => {
                //Something went wrong setting the codeValid to false
                return res.status(422).send({ error: err });
              });
            //   creating a token and sending to user
            admin
              .auth()
              .createCustomToken(phone)
              .then((token) => res.send({ token: token }))
              .catch(() => {
                return res.status(422).send({ error: err }); //No ref for user
              });
          }
        })
        .catch(() => {
          return res.status(422).send({ error: err }); //No ref for user
        });
    })
    .catch((err) => {
      return res.status(422).send({ error: err }); //No user
    });
};
