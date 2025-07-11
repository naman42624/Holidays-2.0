"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TourPackage_1 = require("../models/TourPackage");
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
dotenv_1.default.config();
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/amadeus-travel';
async function seedTourPackagesData() {
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Connected to MongoDB');
        let adminUser = await User_1.default.findOne({ email: 'admin@example.com' });
        if (!adminUser) {
            console.log('Creating admin user...');
            const hashedPassword = await bcryptjs_1.default.hash('Admin@123', 10);
            try {
                adminUser = await User_1.default.create({
                    email: 'admin@example.com',
                    password: hashedPassword,
                    firstName: 'Admin',
                    lastName: 'User',
                    isActive: true,
                    role: 'super-admin',
                    preferences: {
                        currency: 'USD',
                        language: 'en',
                        timezone: 'UTC'
                    }
                });
                console.log('Admin user created with email: admin@example.com and password: Admin@123');
            }
            catch (error) {
                console.error('Error creating admin user:', error);
                throw error;
            }
        }
        else {
            console.log('Admin user already exists');
        }
        const existingPackages = await TourPackage_1.TourPackage.countDocuments();
        if (existingPackages > 0) {
            console.log(`${existingPackages} tour packages already exist. Skipping seeding.`);
            return;
        }
        console.log('Seeding tour packages...');
        const tourPackages = [
            {
                title: 'Paris Explorer',
                description: 'Experience the magic of Paris with this 5-day tour package. Visit iconic landmarks like the Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral. Enjoy a Seine River cruise and explore the charming streets of Montmartre. This package includes luxury accommodations in the heart of the city.',
                price: 1299,
                duration: '5 days / 4 nights',
                imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                isPublished: true,
                activities: [
                    {
                        name: 'Eiffel Tower Visit',
                        description: 'Skip-the-line access to the iconic Eiffel Tower with guided tour of all three levels.',
                        duration: '3 hours',
                        included: true
                    },
                    {
                        name: 'Louvre Museum Tour',
                        description: 'Guided tour of the world-famous Louvre Museum with priority access.',
                        duration: '4 hours',
                        included: true
                    },
                    {
                        name: 'Seine River Cruise',
                        description: 'Evening cruise along the Seine River with dinner and champagne.',
                        duration: '2 hours',
                        included: true
                    },
                    {
                        name: 'Montmartre Walking Tour',
                        description: 'Explore the artistic neighborhood of Montmartre with a local guide.',
                        duration: '3 hours',
                        included: true
                    }
                ],
                createdBy: adminUser._id
            },
            {
                title: 'Tokyo Adventure',
                description: 'Discover the vibrant city of Tokyo with this 7-day package. Experience the perfect blend of ancient traditions and futuristic innovations. Visit historic temples, explore modern neighborhoods, and enjoy authentic Japanese cuisine. Includes a day trip to Mount Fuji and accommodations in central Tokyo.',
                price: 1899,
                duration: '7 days / 6 nights',
                imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                isPublished: true,
                activities: [
                    {
                        name: 'Tsukiji Fish Market Tour',
                        description: 'Early morning tour of the famous Tsukiji Outer Market with sushi breakfast.',
                        duration: '4 hours',
                        included: true
                    },
                    {
                        name: 'Mount Fuji Day Trip',
                        description: 'Full-day excursion to Mount Fuji and Hakone with lake cruise.',
                        duration: '10 hours',
                        included: true
                    },
                    {
                        name: 'Robot Restaurant Show',
                        description: 'Evening entertainment at the famous Robot Restaurant in Shinjuku.',
                        duration: '2 hours',
                        included: false
                    },
                    {
                        name: 'Meiji Shrine & Harajuku Tour',
                        description: 'Visit the serene Meiji Shrine followed by exploring the vibrant Harajuku district.',
                        duration: '5 hours',
                        included: true
                    }
                ],
                createdBy: adminUser._id
            },
            {
                title: 'Bali Retreat',
                description: 'Escape to the tropical paradise of Bali with this 10-day luxury retreat. Stay in private villa accommodations with personal butler service. Enjoy spa treatments, yoga sessions, and cultural experiences. Explore beautiful beaches, ancient temples, and lush rice terraces.',
                price: 2499,
                duration: '10 days / 9 nights',
                imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                isPublished: true,
                activities: [
                    {
                        name: 'Ubud Art Village Tour',
                        description: 'Explore the cultural heart of Bali with visits to art galleries and craft villages.',
                        duration: '6 hours',
                        included: true
                    },
                    {
                        name: 'Balinese Cooking Class',
                        description: 'Learn to prepare authentic Balinese dishes with local ingredients.',
                        duration: '4 hours',
                        included: true
                    },
                    {
                        name: 'Uluwatu Temple Sunset & Kecak Dance',
                        description: 'Visit the cliff-top temple of Uluwatu and watch traditional Kecak dance at sunset.',
                        duration: '5 hours',
                        included: true
                    },
                    {
                        name: 'Tegalalang Rice Terrace Trek',
                        description: 'Guided hike through the stunning Tegalalang rice terraces.',
                        duration: '3 hours',
                        included: true
                    },
                    {
                        name: 'Luxury Spa Day',
                        description: 'Full-day spa experience with multiple treatments and wellness activities.',
                        duration: '8 hours',
                        included: false
                    }
                ],
                createdBy: adminUser._id
            },
            {
                title: 'New York City Experience',
                description: 'Experience the excitement of the Big Apple with this 4-day tour package. Stay in Manhattan and explore iconic attractions including Times Square, Central Park, and the Statue of Liberty. Enjoy a Broadway show, world-class dining, and shopping on Fifth Avenue.',
                price: 1599,
                duration: '4 days / 3 nights',
                imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                isPublished: true,
                activities: [
                    {
                        name: 'Statue of Liberty & Ellis Island Tour',
                        description: 'Ferry ride to Liberty Island and Ellis Island with audio guide.',
                        duration: '5 hours',
                        included: true
                    },
                    {
                        name: 'Top of the Rock Observation Deck',
                        description: 'Panoramic views of Manhattan from the Rockefeller Center observation deck.',
                        duration: '1 hour',
                        included: true
                    },
                    {
                        name: 'Broadway Show',
                        description: 'Premium seats to a popular Broadway show of your choice.',
                        duration: '3 hours',
                        included: true
                    },
                    {
                        name: 'Central Park Bike Tour',
                        description: 'Guided bicycle tour through the iconic Central Park.',
                        duration: '2 hours',
                        included: true
                    }
                ],
                createdBy: adminUser._id
            },
            {
                title: 'Safari Adventure: Kenya & Tanzania',
                description: 'Experience the ultimate African safari across Kenya and Tanzania. Witness the Great Migration in the Serengeti and Masai Mara. Spot the Big Five animals in their natural habitat and enjoy luxury tented camp accommodations under the stars.',
                price: 4999,
                duration: '12 days / 11 nights',
                imageUrl: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                isPublished: false,
                activities: [
                    {
                        name: 'Masai Mara Game Drives',
                        description: 'Multiple game drives in Kenya\'s famous Masai Mara National Reserve.',
                        duration: '3 days',
                        included: true
                    },
                    {
                        name: 'Serengeti Safari',
                        description: 'Extended safari in Tanzania\'s Serengeti National Park with professional guides.',
                        duration: '4 days',
                        included: true
                    },
                    {
                        name: 'Ngorongoro Crater Exploration',
                        description: 'Full-day exploration of the remarkable Ngorongoro Crater conservation area.',
                        duration: '1 day',
                        included: true
                    },
                    {
                        name: 'Hot Air Balloon Safari',
                        description: 'Sunrise hot air balloon ride over the Serengeti plains with champagne breakfast.',
                        duration: '4 hours',
                        included: false
                    },
                    {
                        name: 'Maasai Village Visit',
                        description: 'Cultural experience visiting a traditional Maasai village and learning about their way of life.',
                        duration: '3 hours',
                        included: true
                    }
                ],
                createdBy: adminUser._id
            }
        ];
        await TourPackage_1.TourPackage.insertMany(tourPackages);
        console.log(`${tourPackages.length} tour packages seeded successfully`);
    }
    catch (error) {
        console.error('Error seeding data:', error);
    }
    finally {
        try {
            await mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB');
        }
        catch (error) {
            console.error('Error disconnecting from MongoDB:', error);
            process.exit(1);
        }
        process.exit(0);
    }
}
seedTourPackagesData();
//# sourceMappingURL=seedTourPackages.js.map