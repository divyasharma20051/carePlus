const Hospital = require('../../models/Hospital');

exports.locations = async (req, res) => {
  try {
    const hospitals = await Hospital.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    res.json({
      slides: [
        { img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1350&q=80', text: 'Wellness Starts Here!' },
        { img: 'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?auto=format&fit=crop&w=1350&q=80', text: 'Advanced Diagnostics' },
        { img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1350&q=80', text: 'Emergency Care Available 24/7' }
      ],
      locations: hospitals.map(h => ({ _id: h._id, img: h.image, name: h.name, location: h.location, address: h.address, rating: h.rating, phone: h.phone }))
    });
  } catch (error) { res.status(500).json({ message: 'Failed to load hospital locations.' }); }
};
