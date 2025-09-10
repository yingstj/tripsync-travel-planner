// api/placeholder.js
module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'TripSync API',
    version: '1.0.0',
    status: 'healthy'
  });
};
