const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js"); 
const { isLoggedIn, isOwnerOrAdmin, validateListing } = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer = require("multer"); 
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage  });


// Index Route 
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);


// Search Route 
router.get("/search", async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.redirect("/listings");
    }

    const listings = await Listing.find({
        title: { $regex: q, $options: "i" }
    });

    res.render("listings/index", { allListings: listings });
});


// Show Route
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwnerOrAdmin,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwnerOrAdmin,
        wrapAsync(listingController.destroyListing)
    );


// Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwnerOrAdmin,
    wrapAsync(listingController.renderEditForm)
);


module.exports = router;

