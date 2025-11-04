// controllers/home.js
const Campground = require('../models/campground');
const Review = require('../models/review');
const User = require('../models/user');

module.exports.renderHome = async (req, res) => {
    try {
        // Obtener algunos campgrounds para mostrar en la home
        const featuredCampgrounds = await Campground.find().limit(3);
        // Obtener estadísticas
        const campgroundsCount = await Campground.countDocuments();
        const reviewsCount = await Review.countDocuments();
        const usersCount = await User.countDocuments();
        
        res.render('home', {
            featuredCampgrounds,
            stats: {
                campgrounds: campgroundsCount,
                reviews: reviewsCount,
                users: usersCount
            }
        });
    } catch (error) {
        console.error(error);
        res.render('home', { 
            featuredCampgrounds: [],
            stats: { campgrounds: 0, reviews: 0, users: 0 }
        }); // Fallback con datos vacíos
    }
};