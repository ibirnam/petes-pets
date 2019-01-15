// MODELS
const Pet = require('../models/pet');

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
      res.redirect(`/pets/${req.params.id}`);
    });
  });


  let searchTerm;
  // SEARCH PET
  app.get('/search', (req, res) => {
    // if (!searchTerm) {
    //   searchTerm = new RegExp(req.query.term, 'i')
    // }

    term = new RegExp(req.query.term, 'i')
    Pet.find({
      $or: [
        { 'name': term },
        { 'species': term }
      ]
    }).exec((err, pets) => {
      res.render('pets-index', { pets: pets });
    });

    // const page = req.query.page || 1
    // Pet.paginate(
    //   {
    //     $or: [
    //       { 'name': searchTerm },
    //       { 'species': searchTerm }
    //     ]
    //   },
    //   { page: page }).then((results) => {
    //     res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: page });
    //   });
  });
}

// const page = req.query.page || 1
// Pet.paginate({}, {page: page}).then((results) => {
//   res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: page });