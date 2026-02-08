const mongoose = require('mongoose');
const Review = require('./review')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
});

// Modelo - múltiples tamaños
ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200,h_200,c_fill,q_auto:low');
});

ImageSchema.virtual('small').get(function(){
    return this.url.replace('/upload', '/upload/w_400,q_auto:good');
});

ImageSchema.virtual('medium').get(function(){
    return this.url.replace('/upload', '/upload/w_800,q_auto:good');
});

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }
]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// models/campground.js - VIRTUAL MEJORADO
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    const imageUrl = this.images && this.images[0] ? this.images[0].url : '/images/default-campground.jpg';
    
    return `
        <div class="map-popup" style="max-width: 250px;">
            <div class="popup-image" style="height: 120px; overflow: hidden; border-radius: 8px 8px 0 0;">
                <img src="${imageUrl}" 
                     alt="${this.title}" 
                     style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="popup-content" style="padding: 12px;">
                <h6 style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">
                    ${this.title}
                </h6>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 12px;">
                    📍 ${this.location}
                </p>
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #198754;">
                    $${this.price}/night
                </p>
                <a href="/campgrounds/${this._id}" 
                   class="btn-view" 
                   style="display: inline-block; padding: 6px 12px; background: #198754; color: white; text-decoration: none; border-radius: 4px; font-size: 12px;">
                    View Details
                </a>
            </div>
        </div>
    `;
});

CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        await Review.deleteMany({
            _id: { 
                $in: doc.reviews 
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);

