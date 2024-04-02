const passport = require('passport');
const { User } = require('./models');

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const config = require('./config');

passport.use(
  new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.auth.jwtSecret
  },
  async function (jwtPayload, done) {
    console.log("wwwww");
    return done(false, true);
    try {
      const user = await User.findOne({where: {id: jwtPayload.id}});
      if (!user) {
        return done(new Error(), false);
      }
      return done(null, user.toJSON());
    } catch (err) {
      return done(new Error(), false);
    }
  })
)

module.exports = null;