import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserModel } from '../models/userModel';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/api/users/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let existingUser = await UserModel.findOne({ googleId: profile.id });
        
        if (existingUser) {
          return done(null, existingUser);
        }

        // Check if user exists with the same email
        existingUser = await UserModel.findOne({ email: profile.emails?.[0]?.value });
        
        if (existingUser) {
          // Link Google account to existing user
          existingUser.googleId = profile.id;
          existingUser.authProvider = 'google';
          if (!existingUser.profileImage && profile.photos?.[0]?.value) {
            existingUser.profileImage = profile.photos[0].value;
          }
          await existingUser.save();
          return done(null, existingUser);
        }

        // Create new user
        const newUser = await UserModel.create({
          googleId: profile.id,
          name: profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'User',
          email: profile.emails?.[0]?.value,
          profileImage: profile.photos?.[0]?.value,
          authProvider: 'google',
          receivedFriendReqs: [],
          sentFriendReqs: [],
          friends: [],
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;