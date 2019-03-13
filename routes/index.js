const Pet = require('../models/pet');

module.exports = (app) => {

  /* GET home page. */
  // app.get('/', (req, res) => {
  //   Pet.find().exec((err, pets) => {
  //     res.render('pets-index', { pets: pets });
  //   });
  // });

  // app.get('/', (req, res) => {
  //   Pet.paginate().then((results) => {
  //     res.render('pets-index', { pets: results.docs });
  //   });
  // });
  app.get('/', (req, res) => {
    const page = req.query.page || 1

    Pet.paginate({}, { page: page }).then((results) => {
      // res.render('pets-index', { pets: results.docs });    
      // res.render('pets-index', { pets: results.docs, pagesCount: results.pages });
      if (req.header('Content-Type') == 'application/json') {
        return res.json({ pets: results.docs, pagesCount: results.pages, currentPage: page });
      } else {
        // return res.render('pets-index', { pets: pets });
        res.render('pets-index', { pets: results.docs, pagesCount: results.pages, currentPage: page });
      }
    });
  });
}
