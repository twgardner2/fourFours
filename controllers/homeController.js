module.exports = {

  viewHomePage: (req, res) => {
    res.render('index.ejs');
  },

  redirect: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    res.redirect(redirectPath);
  },

  dragable: (req, res) => {
    res.render('dragable.ejs');
  },

  dragTest: (req, res) => {
    res.render('dragTest.ejs');
  },

  newDrag: (req, res) => {
    res.render('newDrag.ejs');
  }

}
