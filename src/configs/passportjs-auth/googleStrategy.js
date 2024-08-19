const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../../models/user");
const bcrypt = require("bcrypt");
const { NODE_ENV, VERSION } = require("../../../constants");
const { uploadAvatarToS3 } = require("../../middlewares/awsS3Upload");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `/api/${VERSION}/auth/google/callback`,
      proxy: NODE_ENV,
    },
    async (accessToken, refreshToken, profile, done) => {
      // console.log("Google Profile: ", profile);

      try {
        let user = await User.findOne({
          $or: [{ email: profile.emails[0].value }, { googleId: profile.id }],
        });

        if (!user) {
          const avatarUrl = await uploadAvatarToS3(profile.photos[0].value);

          user = new User({
            googleId: profile.id,
            username: profile.name.givenName.replace(/\s+/g, "").toLowerCase(),
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            avatar: avatarUrl, // Uploaded File in AWS-S3 Bucket
            password: bcrypt.hashSync(
              "A" + profile.name.familyName + profile.id,
              10
            ),
            isActive: profile?.emails[0]?.verified ? true : false,
          });
          await user.save();
        } else {
          if (!user.avatar) {
            // change avatar url of existing user, it user avatar doesnt exist
            const avatarUrl = await uploadAvatarToS3(
              profile.photos[0].value,
              profile.id
            );
            await User.updateOne(
              { email: profile.emails[0].value },
              { avatar: avatarUrl }
            );
          }
          if (!user.googleId) {
            // update googleId of existing user
            await User.updateOne(
              { email: profile.emails[0].value },
              { googleId: profile.id }
            );
          }
        }

        user = await User.findOne({ email: profile.emails[0].value });

        // console.log(user)
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
