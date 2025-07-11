import mongoose from 'mongoose';
import { TourPackage } from '../models/TourPackage';
import User from '../models/User';
import connectDatabase from '../config/database';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Sample tour packages data
const tourPackagesData = [
  {
    title: 'Paris Adventure',
    description: 'Experience the magic of Paris with this 5-day adventure tour. Visit iconic landmarks like the Eiffel Tower, Louvre Museum, and Notre-Dame Cathedral. Enjoy authentic French cuisine and take a romantic Seine River cruise.',
    price: 1299,
    duration: '5 days',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&w=1200',
    activities: [
      {
        name: 'Eiffel Tower Visit',
        description: 'Skip-the-line tickets to the iconic Eiffel Tower with guided tour',
        duration: '3 hours',
        included: true,
      },
      {
        name: 'Louvre Museum Tour',
        description: 'Guided tour of the world-famous Louvre Museum',
        duration: '4 hours',
        included: true,
      },
      {
        name: 'Seine River Cruise',
        description: 'Romantic evening cruise on the Seine River',
        duration: '2 hours',
        included: true,
      },
      {
        name: 'Montmartre Walking Tour',
        description: 'Explore the artistic neighborhood of Montmartre',
        duration: '3 hours',
        included: true,
      }
    ],
    isPublished: true,
  },
  {
    title: 'Tokyo Explorer',
    description: 'Discover the vibrant city of Tokyo with this 7-day tour. Experience the perfect blend of traditional Japanese culture and futuristic technology. Visit temples, gardens, and bustling markets while enjoying authentic Japanese cuisine.',
    price: 2199,
    duration: '7 days',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&w=1200',
    activities: [
      {
        name: 'Tsukiji Fish Market Tour',
        description: 'Early morning tour of the world-famous fish market with sushi breakfast',
        duration: '4 hours',
        included: true,
      },
      {
        name: 'Meiji Shrine Visit',
        description: 'Visit to the serene Meiji Shrine and surrounding gardens',
        duration: '3 hours',
        included: true,
      },
      {
        name: 'Robot Restaurant Show',
        description: 'Experience the crazy and colorful Robot Restaurant show in Shinjuku',
        duration: '2 hours',
        included: false,
      },
      {
        name: 'Mt. Fuji Day Trip',
        description: 'Full-day excursion to see Mt. Fuji and surrounding areas',
        duration: '10 hours',
        included: true,
      }
    ],
    isPublished: true,
  },
  {
    title: 'Bali Retreat',
    description: 'Relax and rejuvenate with this 8-day Bali retreat. Stay in luxury villas, enjoy spa treatments, practice yoga, and explore the beautiful island. Perfect for those looking to unwind and experience Balinese culture.',
    price: 1899,
    duration: '8 days',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&w=1200',
    activities: [
      {
        name: 'Ubud Monkey Forest',
        description: 'Visit the sacred Monkey Forest Sanctuary in Ubud',
        duration: '3 hours',
        included: true,
      },
      {
        name: 'Balinese Spa Treatment',
        description: 'Traditional Balinese massage and spa treatment',
        duration: '2 hours',
        included: true,
      },
      {
        name: 'Tegalalang Rice Terrace',
        description: 'Explore the beautiful Tegalalang Rice Terrace',
        duration: '4 hours',
        included: true,
      },
      {
        name: 'Uluwatu Temple Sunset',
        description: 'Watch the sunset at the clifftop Uluwatu Temple with traditional Kecak dance performance',
        duration: '4 hours',
        included: true,
      }
    ],
    isPublished: true,
  },
  {
    title: 'African Safari',
    description: 'Embark on an unforgettable 10-day safari adventure across Tanzania. Witness the Great Migration, spot the Big Five, and immerse yourself in local culture. Includes luxury lodge accommodations and professional guides.',
    price: 4599,
    duration: '10 days',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&w=1200',
    activities: [
      {
        name: 'Serengeti Game Drive',
        description: 'Full-day game drive in the Serengeti National Park',
        duration: '10 hours',
        included: true,
      },
      {
        name: 'Ngorongoro Crater Tour',
        description: 'Explore the wildlife-rich Ngorongoro Crater',
        duration: '8 hours',
        included: true,
      },
      {
        name: 'Maasai Village Visit',
        description: 'Cultural experience with the Maasai tribe',
        duration: '3 hours',
        included: true,
      },
      {
        name: 'Hot Air Balloon Safari',
        description: 'Sunrise hot air balloon ride over the Serengeti',
        duration: '4 hours',
        included: false,
      }
    ],
    isPublished: false, // Unpublished for testing
  },
  {
    title: 'Greek Island Hopping',
    description: 'Island hop through the stunning Greek islands on this 12-day adventure. Visit Santorini, Mykonos, Crete, and more. Enjoy beautiful beaches, historic sites, and delicious Mediterranean cuisine.',
    price: 2899,
    duration: '12 days',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&w=1200',
    activities: [
      {
        name: 'Santorini Sunset Tour',
        description: 'Watch the famous Santorini sunset from Oia',
        duration: '4 hours',
        included: true,
      },
      {
        name: 'Mykonos Beach Day',
        description: 'Relax at Paradise Beach with water sports',
        duration: '6 hours',
        included: true,
      },
      {
        name: 'Knossos Palace Visit',
        description: 'Tour of the ancient Minoan Palace of Knossos in Crete',
        duration: '4 hours',
        included: true,
      },
      {
        name: 'Greek Cooking Class',
        description: 'Learn to cook traditional Greek dishes',
        duration: '3 hours',
        included: false,
      }
    ],
    isPublished: false, // Unpublished for testing
  }
];

// Function to seed tour packages
const seedTourPackages = async () => {
  try {
    // Connect to database
    await connectDatabase();
    console.log('Connected to database');

    // Clear existing tour packages
    await TourPackage.deleteMany({});
    console.log('Cleared existing tour packages');

    // Find an admin user to associate with the tour packages
    const adminUser = await User.findOne({ role: { $in: ['admin', 'super-admin', 'website-editor'] } });
    
    let creatorId: mongoose.Types.ObjectId;

    if (!adminUser) {
      console.log('No admin user found. Creating a default super-admin user...');
      
      // Create a super-admin user if none exists
      const newAdminUser = new User({
        email: 'admin@example.com',
        password: await bcrypt.hash('Admin123!', 10),
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        role: 'super-admin',
        preferences: {
          currency: 'USD',
          language: 'en',
          timezone: 'UTC'
        },
        lastLogin: new Date()
      });
      
      await newAdminUser.save();
      console.log('Created default super-admin user');
      
      creatorId = newAdminUser._id;
    } else {
      creatorId = adminUser._id;
      console.log('Found admin user:', adminUser.email);
    }

    // Add creator ID to tour packages
    const tourPackagesWithCreator = tourPackagesData.map(pkg => ({
      ...pkg,
      createdBy: creatorId
    }));

    // Insert tour packages
    await TourPackage.insertMany(tourPackagesWithCreator);
    console.log('Successfully seeded tour packages');

    // Log the count
    const count = await TourPackage.countDocuments();
    console.log(`Total tour packages in database: ${count}`);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding tour packages:', error);
    process.exit(1);
  }
};

// Run the seed function
seedTourPackages();
