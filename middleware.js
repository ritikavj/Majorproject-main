const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to do that!");
    return res.redirect("/login");
  }
  next();
};

// ✅ Keep: Owner-only check for editing/deleting
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "Only the listing owner can do this action.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};


module.exports.isOwnerOrAdmin = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found.");
        return res.redirect("/listings");
    }

    // ✅ If current user is owner OR admin
    if (
        !listing.owner.equals(req.user._id) &&
        !req.user.isAdmin
    ) {
        req.flash("error", "You do not have permission to perform this action.");
        return res.redirect(`/listings/${id}`);
    }

    next();
};


// ✅ Keep: Save redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// ✅ Keep: Validate listing
module.exports.validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// ✅ Keep: Validate review
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// ✅ Keep: Review author check
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};
