const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out now!");
        res.redirect("/listings");
    });
};

module.exports.resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
        req.flash("error", "All fields are required");
        return res.redirect("/reset-password");
    }

    if (newPassword !== confirmPassword) {
        req.flash("error", "Passwords do not match");
        return res.redirect("/reset-password");
    }

    const user = await User.findOne({ email });
    if (!user) {
        req.flash("error", "No account found with that email");
        return res.redirect("/reset-password");
    }

    // ✅ MUST call setPassword on user object correctly
    await new Promise((resolve, reject) => {
        user.setPassword(newPassword, async (err) => {
            if (err) {
                req.flash("error", "Could not reset password.");
                return reject(err);
            }
            await user.save();
            resolve();
        });
    });

    req.flash("success", "Password updated successfully. Please log in.");
    res.redirect("/login");
};
module.exports.renderResetForm = (req, res) => {
    res.render("users/reset-password");
};
