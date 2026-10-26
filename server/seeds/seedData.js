const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Session = require('../models/Session');
const CreditTransaction = require('../models/CreditTransaction');
const Review = require('../models/Review');
const AdminLog = require('../models/AdminLog');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('Seeding database with demo TimeBank data...');
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Clear existing
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Session.deleteMany({});
    await CreditTransaction.deleteMany({});
    await Review.deleteMany({});
    await AdminLog.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

    // 1. Create Users
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@timebank.org',
      passwordHash: defaultPasswordHash,
      role: 'admin',
      bio: 'Platform safety, community moderation, and credit integrity officer.',
      location: 'Kochi, Kerala',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      credits: 10,
      heldCredits: 0,
      status: 'active',
    });

    const rahul = await User.create({
      name: 'Rahul Varma',
      email: 'rahul@example.com',
      passwordHash: defaultPasswordHash,
      role: 'member',
      bio: 'Passionate acoustic guitarist and Malayalam calligraphy artist with 6 years experience.',
      location: 'Thrissur, Kerala',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      credits: 4,
      heldCredits: 0,
      status: 'active',
    });

    const ananya = await User.create({
      name: 'Ananya Nair',
      email: 'ananya@example.com',
      passwordHash: defaultPasswordHash,
      role: 'member',
      bio: 'Corporate trainer and voice coach specializing in confident spoken English.',
      location: 'Trivandrum, Kerala',
      photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      credits: 3,
      heldCredits: 0,
      status: 'active',
    });

    const alex = await User.create({
      name: 'Alex Chen',
      email: 'alex@example.com',
      passwordHash: defaultPasswordHash,
      role: 'member',
      bio: 'Freelance filmmaker & colorist. Teaching DaVinci Resolve & Premiere Pro cuts.',
      location: 'Bangalore / Online',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      credits: 2,
      heldCredits: 0,
      status: 'active',
    });

    const meera = await User.create({
      name: 'Meera Krishnan',
      email: 'meera@example.com',
      passwordHash: defaultPasswordHash,
      role: 'member',
      bio: 'Senior Frontend Engineer. Helping beginners build modern interactive React apps.',
      location: 'Ernakulam, Kerala',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      credits: 3,
      heldCredits: 0,
      status: 'active',
    });

    const sneha = await User.create({
      name: 'Sneha Thomas',
      email: 'sneha@example.com',
      passwordHash: defaultPasswordHash,
      role: 'member',
      bio: 'Computer science student eager to learn Malayalam calligraphy and video editing!',
      location: 'Kottayam, Kerala',
      photoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      credits: 2,
      heldCredits: 0,
      status: 'active',
    });

    // 2. Initial Credit Ledger for starting balances
    const allUsers = [admin, rahul, ananya, alex, meera, sneha];
    for (const u of allUsers) {
      await CreditTransaction.create({
        user: u._id,
        session: null,
        type: 'grant',
        amount: 2,
        balanceAfter: 2,
        notes: 'Initial welcome credit grant (2 hours) upon registration',
      });
    }

    // 3. Create Listings
    const listingsData = [
      {
        owner: rahul._id,
        title: 'Acoustic Guitar Fingerstyle Fundamentals',
        category: 'Music',
        description: 'Learn chord transitions, rhythm strumming, and fingerpicking patterns for your favorite Malayalam and English songs. Beginners warmly welcome!',
        durationHours: 1,
        mode: 'online',
        availabilityNotes: 'Evenings 7:00 PM - 9:00 PM IST on weekdays, flexible on weekends.',
        isActive: true,
      },
      {
        owner: rahul._id,
        title: 'Traditional Malayalam Calligraphy & Lettering',
        category: 'Arts & Crafts',
        description: 'Master the curves and aesthetic strokes of Malayalam script using chisel-tip markers and nib pens. Great for art projects and typography lovers.',
        durationHours: 1,
        mode: 'both',
        availabilityNotes: 'Saturday mornings and Sunday afternoons.',
        isActive: true,
      },
      {
        owner: ananya._id,
        title: 'Confident Spoken English for Interviews & Presentations',
        category: 'Languages',
        description: 'Overcome hesitation, refine your pronunciation, and practice real-time conversational techniques for campus interviews and workplace discussions.',
        durationHours: 1,
        mode: 'online',
        availabilityNotes: 'Available Mon-Fri 6:00 PM - 8:00 PM.',
        isActive: true,
      },
      {
        owner: alex._id,
        title: 'YouTube Video Editing & Color Grading in DaVinci Resolve',
        category: 'Media & Design',
        description: 'Turn raw footage into cinematic vlogs. We will cover timeline trimming, sound design, L-cuts, keyframing, and natural color grading.',
        durationHours: 2,
        mode: 'online',
        availabilityNotes: 'Weekends 10:00 AM - 4:00 PM IST.',
        isActive: true,
      },
      {
        owner: meera._id,
        title: 'React & TailwindCSS Essentials: Build Your First Component',
        category: 'Technology',
        description: 'Interactive 1-on-1 coaching covering JSX, React hooks (useState, useEffect), component structure, and responsive flexbox layouts.',
        durationHours: 2,
        mode: 'online',
        availabilityNotes: 'Tuesday & Thursday evenings 8:00 PM IST.',
        isActive: true,
      },
      {
        owner: sneha._id,
        title: 'Introduction to Python & Data Structures for Beginners',
        category: 'Technology',
        description: 'Hands-on practice with lists, dictionaries, functions, and solving simple algorithmic puzzles without stress.',
        durationHours: 1,
        mode: 'online',
        availabilityNotes: 'Friday evenings and Sunday mornings.',
        isActive: true,
      },
    ];

    const listings = await Listing.insertMany(listingsData);

    // 4. Create a completed session with mutual confirmation & review
    const completedSession = await Session.create({
      listing: listings[0]._id, // Guitar
      teacher: rahul._id,
      learner: sneha._id,
      proposedStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      durationHours: 1,
      message: 'Hi Rahul! I have an acoustic guitar but struggle with switching chords smoothly.',
      status: 'Completed',
      teacherConfirmed: true,
      learnerConfirmed: true,
    });

    // Record release and receive in ledger for this completed session
    await CreditTransaction.create({
      user: sneha._id,
      session: completedSession._id,
      type: 'hold',
      amount: 1,
      balanceAfter: 1,
      notes: "Credits placed on hold for session 'Acoustic Guitar Fingerstyle Fundamentals'",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    await CreditTransaction.create({
      user: sneha._id,
      session: completedSession._id,
      type: 'release',
      amount: 1,
      balanceAfter: 1,
      notes: "Held credits released upon two-sided confirmation for 'Acoustic Guitar Fingerstyle Fundamentals'",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    await CreditTransaction.create({
      user: rahul._id,
      session: completedSession._id,
      type: 'receive',
      amount: 1,
      balanceAfter: 3,
      notes: "Credits received for completed teaching session 'Acoustic Guitar Fingerstyle Fundamentals'",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // Create review for this session
    await Review.create({
      session: completedSession._id,
      teacher: rahul._id,
      learner: sneha._id,
      rating: 5,
      comment: 'Rahul was remarkably patient and explained finger positioning so clearly. Highly recommend!',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 3600000),
    });

    // 5. Create an accepted session (credits on hold)
    const acceptedSession = await Session.create({
      listing: listings[2]._id, // Spoken English with Ananya
      teacher: ananya._id,
      learner: rahul._id,
      proposedStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      durationHours: 1,
      message: 'Hi Ananya, I want to practice introducing myself for an upcoming technical conference.',
      status: 'Accepted',
      teacherConfirmed: false,
      learnerConfirmed: false,
    });

    await CreditTransaction.create({
      user: rahul._id,
      session: acceptedSession._id,
      type: 'hold',
      amount: 1,
      balanceAfter: 2,
      notes: "Credits placed on hold for session 'Confident Spoken English for Interviews & Presentations'",
    });

    // 6. Create a pending session request for the user to review
    await Session.create({
      listing: listings[1]._id, // Malayalam Calligraphy
      teacher: rahul._id,
      learner: ananya._id,
      proposedStart: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      durationHours: 1,
      message: 'Hi Rahul! Would love to learn traditional Malayalam font writing for my greeting cards.',
      status: 'Pending',
      teacherConfirmed: false,
      learnerConfirmed: false,
    });

    // 7. Seed Admin audit log
    await AdminLog.create({
      admin: admin._id,
      action: 'SYSTEM_INITIALIZATION',
      targetType: 'system',
      targetId: admin._id,
      note: 'Platform seed initialized with IEEE Std 830-1998 compliant specification data',
    });

    console.log('Database seeded successfully!');
    console.log('Demo Credentials:');
    console.log('  Admin:   admin@timebank.org / Password123!');
    console.log('  Teacher: rahul@example.com / Password123!');
    console.log('  Learner: sneha@example.com / Password123!');
    console.log('  Member:  ananya@example.com / Password123!');

    return true;
  } catch (err) {
    console.error('Error seeding database:', err);
    throw err;
  }
};

if (require.main === module) {
  seedDatabase().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

module.exports = seedDatabase;
