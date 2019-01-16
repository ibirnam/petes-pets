// MODELS
const Pet = require('../models/pet');

const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');

const auth = {
  auth: {
    api_key: process.env.MAILGUN_API_KEY,
    domain: process.env.EMAIL_DOMAIN
  }
}

const nodemailerMailgun = nodemailer.createTransport(mg(auth));

// PET ROUTES
module.exports = (app) => {

  // INDEX PET => index.js

  // NEW PET
  app.get('/pets/new', (req, res) => {
    res.render('pets-new');
  });

  // CREATE PET
  app.post('/pets', (req, res) => {
    var pet = new Pet(req.body);

    pet.save()
      .then((pet) => {
        res.send({ pet: pet });
      })
      .catch((err) => {
        // STATUS OF 400 FOR VALIDATIONS
        res.status(400).send(err.errors);
      });
  });

  // SHOW PET
  app.get('/pets/:id', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-show', { pet: pet });
    });
  });

  // EDIT PET
  app.get('/pets/:id/edit', (req, res) => {
    Pet.findById(req.params.id).exec((err, pet) => {
      res.render('pets-edit', { pet: pet });
    });
  });

  // UPDATE PET
  app.put('/pets/:id', (req, res) => {
    Pet.findByIdAndUpdate(req.params.id, req.body)
      .then((pet) => {
        res.redirect(`/pets/${pet._id}`)
      })
      .catch((err) => {
        // Handle Errors
      });
  });

  // DELETE PET
  app.delete('/pets/:id', (req, res) => {
    Pet.findByIdAndRemove(req.params.id).exec((err, pet) => {
      return res.redirect('/')
    });
  });

  // PURCHASE
  app.post('/pets/:id/purchase', (req, res) => {
    console.log(req.body);
    // Set your secret key: remember to change this to your live secret key in production
    // See your keys here: https://dashboard.stripe.com/account/apikeys
    var stripe = require("stripe")("sk_test_Loz6xPRc7Tl8c6OCkyZMAEkE");

    // Token is created using Checkout or Elements!
    // Get the payment token ID submitted by the form:
    const token = req.body.stripeToken; // Using Express

    const charge = stripe.charges.create({
      amount: 999,
      currency: 'usd',
      description: 'Example charge',
      source: token,
    }).then(() => {
      const user = {
        email: req.body.stripeEmail
      };

      nodemailerMailgun.sendMail({
        from: 'no-reply@example.com',
        to: user.email, // An array if you have multiple recipients.
        subject: 'Pet Purchased!',
        template: {
          name: 'email.handlebars',
          engine: 'handlebars',
          context: user
        }
      }).then(info => {
        console.log('Response: ' + info);
        res.redirect(`/pets/${req.params.id}`);
      }).catch(err => {
        console.log('Error: ' + err);
        res.redirect(`/pets/${req.params.id}`);
      });
    });
  });

  // SEARCH PET
  app.get('/search', function (req, res) {
    Pet
      .find(
        { $text: { $search: req.query.term } },
        { score: { $meta: "textScore" } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20)
      .exec(function (err, pets) {
        if (err) { return res.status(400).send(err) }

        if (req.header('Content-Type') == 'application/json') {
          return res.json({ pets: pets });
        } else {
          return res.render('pets-index', { pets: pets, term: req.query.term });
        }
      });
  });
  // app.get('/search', (req, res) => {

  //   term = new RegExp(req.query.term, 'i')
  //   Pet.find({
  //     $or: [
  //       { 'name': term },
  //       { 'species': term }
  //     ]
  //   }).exec((err, pets) => {
  //     res.render('pets-index', { pets: pets });
  //   });

  // const page = req.query.page || 1
  // Pet.paginate(
  //   {
  //     $or: [
  //       { 'name': term },
  //       { 'species': term }
  //     ]
  //   },
  //   { page: page }).then((results) => {
  //     res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: page });
  //   });
// });
}

// const page = req.query.page || 1
// Pet.paginate({}, {page: page}).then((results) => {
//   res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: page });