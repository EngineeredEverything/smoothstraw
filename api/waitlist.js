// Simple waitlist API endpoint
// Can be deployed to Vercel, Netlify Functions, or as Express server

const fs = require('fs').promises;
const path = require('path');

// For production: integrate with Mailchimp, ConvertKit, or database
// For now: append to waitlist.json file

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { name, email } = req.body;
    
    // Validate
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }
    
    // Log waitlist signup
    const entry = {
      name,
      email,
      timestamp: new Date().toISOString(),
      source: 'website'
    };
    
    // Append to waitlist file
    const waitlistPath = path.join(__dirname, '../data/waitlist.json');
    let waitlist = [];
    
    try {
      const data = await fs.readFile(waitlistPath, 'utf8');
      waitlist = JSON.parse(data);
    } catch (err) {
      // File doesn't exist yet, start fresh
    }
    
    // Check for duplicates
    if (waitlist.some(item => item.email === email)) {
      return res.status(200).json({ 
        success: true, 
        message: 'You\'re already on the waitlist!' 
      });
    }
    
    waitlist.push(entry);
    await fs.writeFile(waitlistPath, JSON.stringify(waitlist, null, 2));
    
    // TODO: Send welcome email with discount code
    // TODO: Add to Mailchimp/ConvertKit
    
    console.log('New waitlist signup:', entry);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Welcome to the waitlist!',
      discountCode: 'EARLY20' // 20% off for early signups
    });
    
  } catch (error) {
    console.error('Waitlist error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
