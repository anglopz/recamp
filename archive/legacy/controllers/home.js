// controllers/home.js
const Campground = require('../models/campground');
const Review = require('../models/review');
const User = require('../models/user');

module.exports.renderHome = async (req, res) => {
    try {
        // Obtener algunos campgrounds para mostrar en la home
        let featuredCampgrounds = await Campground.find().limit(3);
        
        // Validación adicional para asegurar que todos tengan imágenes
        featuredCampgrounds = featuredCampgrounds.map(campground => {
            if (!campground.images || campground.images.length === 0) {
                // Si no tiene imágenes, añadir una por defecto
                campground.images = [{
                    url: 'https://images.unsplash.com/photo-1508873696983-2dfd5898f08b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                    filename: 'default-campground'
                }];
            }
            return campground;
        });

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
        });
    }
};