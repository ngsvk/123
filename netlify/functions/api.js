const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple in-memory session storage (in production, use a proper database)
let sessions = {};

// Configuration
const config = {
  adminUsername: 'admin',
  adminPassword: 'sssbpuc2025', // In production, use proper hashing
  pages: ['index', 'about', 'academics', 'admissions', 'campus-life', 'gallery'],
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
};

// Helper functions
function generateSessionId() {
  return crypto.randomBytes(32).toString('hex');
}

function isAuthenticated(sessionId) {
  const session = sessions[sessionId];
  if (!session) return false;
  if (Date.now() > session.expires) {
    delete sessions[sessionId];
    return false;
  }
  return true;
}

function authenticate(username, password) {
  return username === config.adminUsername && password === config.adminPassword;
}

function getDataPath(filename) {
  // In Netlify, we'll read from the deployed data directory
  return path.join(process.cwd(), 'data', filename);
}

function readDataFile(filename) {
  try {
    const filePath = getDataPath(filename);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

function writeDataFile(filename, data) {
  try {
    const filePath = getDataPath(filename);
    const dir = path.dirname(filePath);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// Default data generators
function getDefaultNavigation() {
  return {
    branding: {
      logo_left: 'assets/logo/sai-baba-logo.png',
      logo_right: 'assets/logo/school-logo.png',
      college_name: 'Sri Sathya Sai Baba PU College',
      location: 'Mysuru, Karnataka'
    },
    menu_items: [
      { name: 'Home', url: 'index.html', type: 'link' },
      { name: 'Academics', url: 'academics.html', type: 'link' },
      { name: 'Gallery', url: 'gallery.html', type: 'link' },
      { name: 'Campus Life', url: 'campus-life.html', type: 'link' },
      { name: 'About', url: 'about.html', type: 'link' }
    ],
    cta_button: {
      text: 'FOR ADMISSIONS',
      url: 'admissions.html'
    },
    last_updated: Date.now()
  };
}

function getDefaultFooter() {
  return {
    branding: {
      logo: 'assets/logo/sai-baba-logo.png',
      description: 'Shaping tomorrow\'s leaders through excellence in education, research, and innovation.'
    },
    social_links: [
      { name: 'Facebook', url: 'https://www.facebook.com/people/Sathya-Sai-Baba-Puc/pfbid02EXmmdXSUpaZJE3uH5zdoHTGTsfFPjy5RK5Z6dUJ55skrdtPwmWgYpTbHbh7RwcfZl', icon: 'ri-facebook-fill' },
      { name: 'Twitter', url: '#', icon: 'ri-twitter-fill' },
      { name: 'Instagram', url: '#', icon: 'ri-instagram-fill' },
      { name: 'LinkedIn', url: '#', icon: 'ri-linkedin-fill' }
    ],
    quick_links: [
      { name: 'About Us', url: 'about.html' },
      { name: 'Academics', url: 'academics.html' },
      { name: 'Gallery', url: 'gallery.html' },
      { name: 'Campus Life', url: 'campus-life.html' },
      { name: 'Admissions', url: 'admissions.html' }
    ],
    contact_info: [
      { type: 'address', icon: 'ri-map-pin-line', text: 'Sri Sathya Sai Baba PU College, 46, 4th Main Rd, 3rd Block, Jayalakshmipuram, Mysuru, Karnataka 570012' },
      { type: 'phone', icon: 'ri-phone-line', text: '0821 2410856' },
      { type: 'email', icon: 'ri-mail-line', text: 'sssbpucnn0385@gmail.com' }
    ],
    copyright: '© 2025 SSSBPUC. All rights reserved.',
    last_updated: Date.now()
  };
}

// Main handler
exports.handler = async (event, context) => {
  const { httpMethod, queryStringParameters, body, headers } = event;
  const endpoint = queryStringParameters?.endpoint || '';
  
  // Enable CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    let response;
    
    switch (endpoint) {
      case 'login':
        response = await handleLogin(body);
        break;
        
      case 'get-navigation':
        response = handleGetNavigation();
        break;
        
      case 'save-navigation':
        response = await handleSaveNavigation(body, headers);
        break;
        
      case 'get-footer':
        response = handleGetFooter();
        break;
        
      case 'save-footer':
        response = await handleSaveFooter(body, headers);
        break;
        
      case 'get-content':
      case 'public-content':
        response = handleGetContent(queryStringParameters);
        break;
        
      case 'save-content':
        response = await handleSaveContent(body, headers);
        break;
        
      default:
        response = { success: false, error: 'Invalid endpoint' };
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify(response)
        };
    }
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

// Handler functions
async function handleLogin(body) {
  const { username, password } = JSON.parse(body || '{}');
  
  if (authenticate(username, password)) {
    const sessionId = generateSessionId();
    sessions[sessionId] = {
      username,
      expires: Date.now() + config.sessionTimeout,
      created: Date.now()
    };
    
    return {
      success: true,
      message: 'Login successful',
      sessionId,
      username
    };
  } else {
    throw new Error('Invalid credentials');
  }
}

function handleGetNavigation() {
  let data = readDataFile('navigation.json');
  if (!data) {
    data = getDefaultNavigation();
    writeDataFile('navigation.json', data);
  }
  return { success: true, data };
}

async function handleSaveNavigation(body, headers) {
  const sessionId = headers['x-session-id'];
  if (!isAuthenticated(sessionId)) {
    throw new Error('Unauthorized');
  }
  
  const data = JSON.parse(body || '{}');
  data.last_updated = Date.now();
  
  if (writeDataFile('navigation.json', data)) {
    return { success: true, message: 'Navigation saved successfully' };
  } else {
    throw new Error('Failed to save navigation');
  }
}

function handleGetFooter() {
  let data = readDataFile('footer.json');
  if (!data) {
    data = getDefaultFooter();
    writeDataFile('footer.json', data);
  }
  return { success: true, data };
}

async function handleSaveFooter(body, headers) {
  const sessionId = headers['x-session-id'];
  if (!isAuthenticated(sessionId)) {
    throw new Error('Unauthorized');
  }
  
  const data = JSON.parse(body || '{}');
  data.last_updated = Date.now();
  
  if (writeDataFile('footer.json', data)) {
    return { success: true, message: 'Footer saved successfully' };
  } else {
    throw new Error('Failed to save footer');
  }
}

function handleGetContent(params) {
  const page = params?.page;
  if (!page) {
    throw new Error('Page parameter required');
  }
  
  let data = readDataFile(`${page}.json`);
  if (!data) {
    data = { sections: [], meta: { title: '', description: '' } };
  }
  
  return { success: true, content: data };
}

async function handleSaveContent(body, headers) {
  const sessionId = headers['x-session-id'];
  if (!isAuthenticated(sessionId)) {
    throw new Error('Unauthorized');
  }
  
  const { page, content } = JSON.parse(body || '{}');
  
  if (!page || !content) {
    throw new Error('Page and content required');
  }
  
  if (writeDataFile(`${page}.json`, content)) {
    return { success: true, message: 'Content saved successfully' };
  } else {
    throw new Error('Failed to save content');
  }
}
