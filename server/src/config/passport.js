import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from "./env.js";
import { Student } from "../models/Student.js";
import { User } from "../models/User.js";

async function findOrCreateOAuthUser({ email, name, avatar, provider, providerId }) {
  const providerField = provider === "google" ? "googleId" : "githubId";
  let user = await User.findOne({
    $or: [{ email }, { [providerField]: providerId }]
  });

  if (!user) {
    user = await User.create({
      email,
      name,
      avatar,
      [providerField]: providerId,
      role: "student",
      isEmailVerified: true
    });
    await Student.create({ user: user.id });
  } else if (!user[providerField]) {
    user[providerField] = providerId;
    user.isEmailVerified = true;
    await user.save();
  }

  return user;
}

if (env.google.clientId && env.google.clientSecret && env.google.callbackUrl) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.google.clientId,
        clientSecret: env.google.clientSecret,
        callbackURL: env.google.callbackUrl
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("Google account does not expose an email."));
          }
          return done(null, await findOrCreateOAuthUser({
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            provider: "google",
            providerId: profile.id
          }));
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

if (env.github.clientId && env.github.clientSecret && env.github.callbackUrl) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.github.clientId,
        clientSecret: env.github.clientSecret,
        callbackURL: env.github.callbackUrl,
        scope: ["user:email"]
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("GitHub account does not expose an email."));
          }
          return done(null, await findOrCreateOAuthUser({
            email,
            name: profile.displayName || profile.username,
            avatar: profile.photos?.[0]?.value,
            provider: "github",
            providerId: profile.id
          }));
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

export { passport };

