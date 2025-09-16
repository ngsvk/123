// Client-side API replacement for admin functionality
// This replaces the PHP backend with localStorage-based storage

class ClientAPI {
  constructor() {
    console.log('ClientAPI constructor called');
    this.storagePrefix = 'sssbpuc_';
    this.initialized = false;
    this.initPromise = this.init();
    console.log('ClientAPI constructor completed');
  }

  async init() {
    console.log('ClientAPI init() called');
    // Initialize default data if not exists
    await this.initializeDefaultData();
    this.initialized = true;
    console.log('ClientAPI init() completed');
  }

  async initializeDefaultData() {
    // Initialize homepage data if not exists
    if (!this.getData('homepage')) {
      // First try to load from JSON file
      let defaultHomepage;
      try {
        const response = await fetch('data/homepage.json');
        if (response.ok) {
          defaultHomepage = await response.json();
          console.log('✅ Loaded homepage data from JSON file');
        } else {
          throw new Error('JSON file not found');
        }
      } catch (error) {
        console.log('📄 JSON file fetch failed, trying manual data fallback');
        
        // Try manual data fallback (for file:// protocol)
        if (window.manualHomepageData) {
          console.log('📦 Using manual homepage data');
          defaultHomepage = window.manualHomepageData;
        } else {
          console.log('⚠️ No manual data found, using minimal hardcoded defaults');
          defaultHomepage = {
          hero: {
            title: "Welcome to Sri Sathya Sai Baba School & Pre-University College",
            subtitle: "Fostering Education in Human Values",
            description: "Nurturing minds, building character, and shaping future leaders through holistic education.",
            background_video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            cta_text: "Explore Our Programs",
            cta_link: "#programs"
          },
        welcome: {
          subtitle: "ABOUT US",
          title: "Welcome to <span class=\"highlight-orange\">Sri Sathya Sai School & PU College Mysuru</span>",
          description: "Our school is dedicated to fostering Education in Human Values. Today's education system often prioritizes intellectual and skill development while neglecting the cultivation of good character.",
          logo_url: "https://github.com/Satyamurthi/mbw-Photos/blob/main/Logo/sai%20school%20logo%20png.png?raw=true"
        },
        founder: {
          background_image: "https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photos/Bhajan%20hall.png?raw=true",
          founder1: {
            tag: "founder president",
            name: "Late Smt Sunandamma",
            description: "Deeply influenced by the Bhagvn Sri Satya Sai Baba, Smt Sunandamma, with the help of some dedicated workers, set up this educational institution at Mysuru on 1957...",
            image_url: "https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photos/Sunandamma.png?raw=true",
            read_more_link: "#"
          },
          founder2: {
            tag: "blessings",
            name: "Bhagawan Sri Sathya Sai Baba",
            description: "Bhagawan Sri Sathya Sai Baba was incarnated in a remote village called Puttaparthi in Anantpur district in Andhra Pradesh in the year 23-11-1926...",
            image_url: "https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photos/Baba%20Cahir.jpg?raw=true",
            read_more_link: "#"
          }
        },
        updates: {
          title: "Updates",
          subtitle: "Stay updated with the latest happenings, breakthroughs, and events at SSSBPUC.",
          cards: [
            {
              type: "News",
              date: "Feb 20, 2025",
              title: "Campus Renovation Completed",
              description: "Major renovation of classrooms and labs completed successfully.",
              image_url: "assets/photos/DSC_4054.jpg",
              link: "#"
            }
          ],
          cta_text: "View All News",
          cta_link: "#news"
        },
        statistics: {
          title: "By the Numbers",
          subtitle: "Our impact in numbers reflects our commitment to excellence in education and research.",
          stats: [
            {
              number: "25000",
              label: "Students Enrolled",
              suffix: "+"
            },
            {
              number: "70",
              label: "Faculty Members",
              suffix: "+"
            },
            {
              number: "4",
              label: "Academic Programs",
              suffix: ""
            },
            {
              number: "100",
              label: "Passing Rate",
              suffix: "%"
            }
          ]
        },
        facilities: {
          title: "Our Facilities",
          subtitle: "World-class infrastructure designed for holistic development",
          items: [
            {
              name: "Modern Classrooms",
              description: "Smart classrooms equipped with latest technology to enhance the learning experience.",
              icon: "ri-presentation-line",
              image_url: "assets/campus/campus4.jpg"
            },
            {
              name: "Science Laboratories",
              description: "Well-equipped labs for physics, chemistry, biology, and computer science.",
              icon: "ri-flask-line",
              image_url: "assets/photos/DSC_4038.jpg"
            },
            {
              name: "Sports Complex",
              description: "Comprehensive sports facilities including courts, fields, and fitness equipment.",
              icon: "ri-football-line",
              image_url: "assets/photos/DSC_4054.jpg"
            },
            {
              name: "Library & Resources",
              description: "Extensive collection of books, digital resources, and quiet study spaces.",
              icon: "ri-book-open-line",
              image_url: "assets/campus/campus3.jpg"
            }
          ]
        },
        campus_life: {
          title: "Campus Life",
          subtitle: "Experience the vibrant and diverse community at SSSBPUC.",
          images: [
            {
              url: "assets/photos/DSC_4033.jpg",
              title: "Annual Sports Day",
              description: "Students participating in various sporting events"
            },
            {
              url: "assets/photos/DSC_4038.jpg",
              title: "Cultural Celebration",
              description: "Students showcasing their cultural talents"
            },
            {
              url: "assets/photos/DSC_4015.jpg",
              title: "Academic Excellence",
              description: "Celebrating student achievements"
            },
            {
              url: "assets/photos/DSC_4006.jpg",
              title: "Science Exhibition",
              description: "Innovation and research showcase"
            }
          ]
        },
        sister_institutes: {
          title: "Sister Institutes",
          subtitle: "Discover endless opportunities and shared excellence at our esteemed sister institutions.",
          institutes: [
            {
              name: "Sri Sathya Sai Higher Secondary School",
              location: "Puttaparthi",
              image_url: "assets/sister/College.jpg",
              description: "Excellence in secondary education with values-based learning.",
              link: "#"
            }
          ]
        }
      };
      this.saveData('homepage', defaultHomepage);
    }

    // Initialize admissions data if not exists
    if (!this.getData('admissions')) {
      const defaultAdmissions = {
        hero: {
          title: "Admissions",
          subtitle: "Join the SSSBPUC Family",
          description: "Begin your journey of academic excellence and character development with us.",
          background_image: "assets/campus/campus3.jpg"
        },
        overview: {
          title: "Admission Overview",
          description: "We welcome students who are eager to learn, grow, and contribute positively to society.",
          academic_year: "2025-2026",
          application_deadline: "March 15, 2025",
          announcement_date: "April 15, 2025"
        }
      };
      this.saveData('admissions', defaultAdmissions);
    }

    // Initialize academics data
    if (!this.getData('academics')) {
      const defaultAcademics = {
        hero: {
          title: "Academic Excellence",
          subtitle: "Nurturing Minds for Tomorrow",
          description: "Comprehensive academic programs designed to develop critical thinking and character.",
          background_image: "assets/campus/campus3.jpg"
        },
        programs: {
          title: "Academic Programs",
          subtitle: "Choose your path to success",
          items: [
            {
              name: "High School (8-10)",
              description: "Foundation years with focus on core subjects and values education.",
              subjects: ["Mathematics", "Science", "English", "Hindi", "Kannada", "Social Studies"],
              image_url: "assets/academics/high-school.jpg",
              duration: "3 Years",
              eligibility: "Completion of 7th Grade"
            },
            {
              name: "Pre-University Science",
              description: "Specialized science education preparing for engineering and medical careers.",
              subjects: ["Physics", "Chemistry", "Mathematics/Biology", "English", "Kannada"],
              image_url: "assets/academics/science.jpg",
              duration: "2 Years",
              eligibility: "10th Grade with 60% marks"
            },
            {
              name: "Pre-University Commerce",
              description: "Business and commerce education for future entrepreneurs and professionals.",
              subjects: ["Accountancy", "Business Studies", "Economics", "English", "Kannada"],
              image_url: "assets/academics/commerce.jpg",
              duration: "2 Years",
              eligibility: "10th Grade with 50% marks"
            }
          ]
        },
        curriculum: {
          title: "Curriculum Features",
          subtitle: "Holistic education approach",
          features: [
            {
              title: "Values-Based Education",
              description: "Character development integrated with academic learning",
              icon: "ri-heart-line"
            },
            {
              title: "Modern Teaching Methods",
              description: "Interactive and technology-enhanced learning experiences",
              icon: "ri-computer-line"
            },
            {
              title: "Regular Assessments",
              description: "Continuous evaluation and feedback for improvement",
              icon: "ri-file-text-line"
            },
            {
              title: "Extracurricular Activities",
              description: "Sports, arts, and cultural activities for overall development",
              icon: "ri-palette-line"
            }
          ]
        },
        faculty: {
          title: "Our Faculty",
          subtitle: "Experienced educators dedicated to student success",
          members: [
            {
              name: "Dr. Rajesh Kumar",
              designation: "Principal",
              qualification: "Ph.D. in Education",
              experience: "25 years",
              image_url: "assets/faculty/principal.jpg"
            }
          ]
        }
      };
      this.saveData('academics', defaultAcademics);
    }

    // Initialize gallery data
    if (!this.getData('gallery')) {
      const defaultGallery = {
        hero: {
          title: "Photo Gallery",
          subtitle: "Capturing Memories",
          description: "Explore our vibrant campus life through images",
          background_image: "assets/gallery/gallery-hero.jpg"
        },
        categories: [
          {
            name: "Campus Events",
            description: "Special occasions and celebrations",
            images: [
              {
                url: "assets/photos/DSC_4033.jpg",
                title: "Annual Day Celebration",
                description: "Students performing cultural activities",
                date: "2024-12-15"
              }
            ]
          },
          {
            name: "Academic Activities",
            description: "Classroom and laboratory sessions",
            images: [
              {
                url: "assets/photos/DSC_4038.jpg",
                title: "Science Laboratory",
                description: "Students conducting experiments",
                date: "2024-11-20"
              }
            ]
          },
          {
            name: "Sports & Recreation",
            description: "Sports activities and competitions",
            images: [
              {
                url: "assets/photos/DSC_4054.jpg",
                title: "Inter-House Sports",
                description: "Athletic competitions between houses",
                date: "2024-10-15"
              }
            ]
          },
          {
            name: "Campus Infrastructure",
            description: "Our beautiful campus facilities",
            images: [
              {
                url: "assets/campus/campus3.jpg",
                title: "Main Building",
                description: "Administrative and academic block",
                date: "2024-09-01"
              }
            ]
          }
        ]
      };
      this.saveData('gallery', defaultGallery);
    }

    // Initialize campus-life data
    if (!this.getData('campus-life')) {
      const defaultCampusLife = {
        hero: {
          title: "Campus Life",
          subtitle: "More Than Just Studies",
          description: "Experience the vibrant community and diverse opportunities at SSSBPUC",
          background_image: "assets/campus/campus-life-hero.jpg"
        },
        student_life: {
          title: "Student Life",
          subtitle: "A day in the life of our students",
          activities: [
            {
              name: "Morning Assembly",
              description: "Daily gathering for prayers, announcements, and inspiration",
              time: "8:00 AM",
              icon: "ri-sun-line",
              image_url: "assets/campus-life/assembly.jpg"
            },
            {
              name: "Interactive Classes",
              description: "Engaging lessons with modern teaching methods",
              time: "8:30 AM - 3:30 PM",
              icon: "ri-book-open-line",
              image_url: "assets/campus-life/classes.jpg"
            },
            {
              name: "Sports & Recreation",
              description: "Physical activities and team sports",
              time: "4:00 PM - 6:00 PM",
              icon: "ri-football-line",
              image_url: "assets/campus-life/sports.jpg"
            }
          ]
        },
        clubs: {
          title: "Clubs & Activities",
          subtitle: "Pursue your passions and develop new skills",
          items: [
            {
              name: "Science Club",
              description: "Explore scientific concepts through experiments and projects",
              members: "45+",
              meeting: "Wednesdays",
              image_url: "assets/clubs/science.jpg"
            },
            {
              name: "Cultural Club",
              description: "Dance, music, drama, and cultural performances",
              members: "60+",
              meeting: "Fridays",
              image_url: "assets/clubs/cultural.jpg"
            },
            {
              name: "Sports Club",
              description: "Various sports activities and competitions",
              members: "80+",
              meeting: "Daily",
              image_url: "assets/clubs/sports.jpg"
            }
          ]
        },
        events: {
          title: "Annual Events",
          subtitle: "Memorable celebrations throughout the year",
          items: [
            {
              name: "Annual Day",
              description: "Showcase of student talents and achievements",
              month: "December",
              image_url: "assets/events/annual-day.jpg"
            },
            {
              name: "Sports Day",
              description: "Inter-house sports competitions and athletic events",
              month: "February",
              image_url: "assets/events/sports-day.jpg"
            },
            {
              name: "Science Exhibition",
              description: "Student innovations and scientific projects",
              month: "March",
              image_url: "assets/events/science-exhibition.jpg"
            }
          ]
        }
      };
      this.saveData('campus-life', defaultCampusLife);
    }

    // Initialize about data
    if (!this.getData('about')) {
      const defaultAbout = {
        hero: {
          title: "About SSSBPUC",
          subtitle: "Education in Human Values",
          description: "Discover our journey of excellence in education and character building",
          background_image: "assets/about/about-hero.jpg"
        },
        history: {
          title: "Our History",
          subtitle: "A legacy of educational excellence",
          content: "Founded in 1957 by Late Smt Sunandamma, inspired by Bhagawan Sri Sathya Sai Baba's vision of Education in Human Values, our institution has been a beacon of quality education in Mysuru for over six decades.",
          timeline: [
            {
              year: "1957",
              event: "Institution Founded",
              description: "Established with the vision of values-based education"
            },
            {
              year: "1980",
              event: "PU College Started",
              description: "Expanded to include Pre-University courses"
            },
            {
              year: "2000",
              event: "Infrastructure Expansion",
              description: "Modern facilities and laboratories added"
            },
            {
              year: "2020",
              event: "Digital Integration",
              description: "Embraced technology for enhanced learning"
            }
          ]
        },
        mission_vision: {
          mission: {
            title: "Our Mission",
            content: "To provide quality education that develops the whole person - intellectually, morally, and spiritually - preparing students to be responsible citizens and leaders of tomorrow.",
            icon: "ri-target-line"
          },
          vision: {
            title: "Our Vision",
            content: "To be a premier educational institution that nurtures human values, academic excellence, and character development, creating global citizens with a strong moral foundation.",
            icon: "ri-eye-line"
          },
          values: {
            title: "Our Values",
            items: [
              {
                name: "Truth",
                description: "Honesty and integrity in all endeavors",
                icon: "ri-shield-check-line"
              },
              {
                name: "Righteousness",
                description: "Moral and ethical conduct",
                icon: "ri-scales-line"
              },
              {
                name: "Peace",
                description: "Harmony and tranquility in mind and actions",
                icon: "ri-leaf-line"
              },
              {
                name: "Love",
                description: "Compassion and care for all beings",
                icon: "ri-heart-line"
              },
              {
                name: "Non-Violence",
                description: "Respect for all life and peaceful coexistence",
                icon: "ri-hand-heart-line"
              }
            ]
          }
        },
        leadership: {
          title: "Leadership Team",
          subtitle: "Dedicated leaders guiding our institution",
          members: [
            {
              name: "Dr. Rajesh Kumar",
              designation: "Principal",
              qualification: "Ph.D. in Educational Administration",
              experience: "25 years in education",
              message: "Education is the manifestation of perfection already in man.",
              image_url: "assets/leadership/principal.jpg"
            },
            {
              name: "Mrs. Sunita Sharma",
              designation: "Vice Principal",
              qualification: "M.A., B.Ed.",
              experience: "20 years in education",
              message: "Every student is unique and has unlimited potential.",
              image_url: "assets/leadership/vice-principal.jpg"
            }
          ]
        },
        achievements: {
          title: "Our Achievements",
          subtitle: "Recognition of our commitment to excellence",
          items: [
            {
              title: "Best School Award 2023",
              description: "Recognized by Karnataka State Education Board",
              year: "2023",
              category: "Academic Excellence"
            },
            {
              title: "100% Pass Rate",
              description: "Consistent academic performance over 5 years",
              year: "2019-2024",
              category: "Academic Achievement"
            },
            {
              title: "Green Campus Certification",
              description: "Environmental conservation efforts recognized",
              year: "2022",
              category: "Environmental"
            }
          ]
        },
        contact: {
          title: "Contact Information",
          address: {
            line1: "Sri Sathya Sai Baba PU College",
            line2: "46, 4th Main Rd, 3rd Block",
            line3: "Jayalakshmipuram, Mysuru",
            line4: "Karnataka 570012, India"
          },
          phone: "0821 2410856",
          email: "info@sssbpuc.edu.in",
          office_hours: "Monday to Friday: 9:00 AM - 5:00 PM, Saturday: 9:00 AM - 1:00 PM"
        }
      };
      this.saveData('about', defaultAbout);
    }

    // Initialize media library
    if (!this.getData('media')) {
      this.saveData('media', []);
    }

    // Initialize statistics
    this.updateStats();
  }

  // Storage methods
  saveData(key, data) {
    try {
      localStorage.setItem(this.storagePrefix + key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  getData(key) {
    try {
      const data = localStorage.getItem(this.storagePrefix + key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  }

  // API Methods that replace PHP endpoints
  async getContent(page) {
    // Wait for initialization to complete
    await this.initPromise;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = this.getData(page);
        resolve({
          success: true,
          content: content || {}
        });
      }, 100); // Simulate network delay
    });
  }

  async saveContent(page, content) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = this.saveData(page, content);
        if (success) {
          this.updateStats();
          resolve({
            success: true,
            message: 'Content saved successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Failed to save content'
          });
        }
      }, 200); // Simulate network delay
    });
  }

  async validateUrl(url) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Basic URL validation
        const isValid = /^https?:\/\/.+/.test(url);
        resolve({
          success: true,
          valid: isValid,
          url: url,
          message: isValid ? 'URL is valid' : 'URL format is invalid'
        });
      }, 300);
    });
  }

  async uploadUrl(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mediaLibrary = this.getData('media') || [];
        const mediaItem = {
          id: Date.now().toString(),
          url: data.url,
          title: data.title,
          description: data.description,
          category: data.category || 'general',
          created_at: new Date().toISOString(),
          type: this.detectMediaType(data.url)
        };
        
        mediaLibrary.push(mediaItem);
        const success = this.saveData('media', mediaLibrary);
        
        if (success) {
          resolve({
            success: true,
            media: mediaItem,
            message: 'Media URL saved successfully'
          });
        } else {
          resolve({
            success: false,
            error: 'Failed to save media URL'
          });
        }
      }, 300);
    });
  }

  async getMedia(category = '', page = '') {
    return new Promise((resolve) => {
      setTimeout(() => {
        let mediaItems = this.getData('media') || [];
        
        // Filter by category or page if specified
        if (category || page) {
          mediaItems = mediaItems.filter(item => {
            if (category && item.category !== category) return false;
            if (page && item.page && item.page !== page) return false;
            return true;
          });
        }
        
        resolve({
          success: true,
          media: mediaItems
        });
      }, 100);
    });
  }

  async getStats() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = this.getData('stats') || {
          total_pages: 6,
          content_sections: 0,
          last_updated: new Date().toISOString()
        };
        
        resolve({
          success: true,
          stats: stats
        });
      }, 100);
    });
  }

  // Helper methods
  detectMediaType(url) {
    const extension = url.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    
    if (imageExts.includes(extension)) return 'image';
    if (videoExts.includes(extension)) return 'video';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    
    return 'unknown';
  }

  updateStats() {
    // Count content sections
    let sectionCount = 0;
    ['homepage', 'admissions', 'academics', 'gallery', 'campus-life', 'about'].forEach(page => {
      const content = this.getData(page);
      if (content) {
        if (typeof content === 'object') {
          sectionCount += Object.keys(content).length;
        } else {
          sectionCount += 1;
        }
      }
    });

    const mediaCount = (this.getData('media') || []).length;

    const stats = {
      total_pages: 6,
      pages_with_content: 6,
      content_sections: sectionCount,
      media_items: mediaCount,
      last_updated: new Date().toISOString()
    };

    this.saveData('stats', stats);
  }

  // Authentication methods
  login(username, password) {
    // Simple authentication
    if (username === 'admin' && password === 'sssbpuc2025') {
      const session = {
        isAuthenticated: true,
        username: username,
        loginTime: new Date().getTime(),
        rememberMe: false
      };
      sessionStorage.setItem('adminSession', JSON.stringify(session));
      return { success: true, session };
    }
    return { success: false, error: 'Invalid credentials' };
  }

  logout() {
    sessionStorage.removeItem('adminSession');
    localStorage.removeItem('adminSession');
    return { success: true };
  }

  checkAuth() {
    const session = sessionStorage.getItem('adminSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        const currentTime = new Date().getTime();
        const sessionAge = currentTime - sessionData.loginTime;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge < maxAge && sessionData.isAuthenticated) {
          return { success: true, session: sessionData };
        }
      } catch (e) {
        console.error('Invalid session data');
      }
    }
    return { success: false };
  }
  
  // Development method to clear all data and reload from JSON files
  async clearAndReload() {
    console.log('🗑️ Clearing localStorage and reloading from JSON files...');
    // Clear all stored data
    ['homepage', 'admissions', 'academics', 'gallery', 'campus-life', 'about', 'media', 'stats'].forEach(key => {
      localStorage.removeItem(this.storagePrefix + key);
    });
    // Reinitialize
    await this.initializeDefaultData();
    console.log('✅ Data cleared and reloaded from JSON files');
    return { success: true, message: 'Data cleared and reloaded' };
  }
}

// Create global instance
console.log('Initializing Client API...');
window.clientAPI = new ClientAPI();

// Wait for client API to be fully initialized before signaling ready
window.clientAPI.initPromise.then(() => {
  console.log('✅ Client API fully initialized and ready');
  // Dispatch event to notify other scripts
  window.dispatchEvent(new CustomEvent('clientAPIReady'));
});
console.log('Client API initialized successfully');

// Replace fetch calls with client API
window.adminFetch = async function(url, options = {}) {
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  const endpoint = urlParams.get('endpoint');
  const page = urlParams.get('page');
  
  try {
    switch (endpoint) {
      case 'get-content':
        return { json: async () => await window.clientAPI.getContent(page) };
      
      case 'save-content':
        const saveData = JSON.parse(options.body || '{}');
        return { json: async () => await window.clientAPI.saveContent(saveData.page, saveData.content) };
      
      case 'validate-url':
        const urlData = JSON.parse(options.body || '{}');
        return { json: async () => await window.clientAPI.validateUrl(urlData.url) };
      
      case 'upload-url':
        const uploadData = JSON.parse(options.body || '{}');
        return { json: async () => await window.clientAPI.uploadUrl(uploadData) };
      
      case 'get-media':
        return { json: async () => await window.clientAPI.getMedia() };
      
      case 'stats':
        return { json: async () => await window.clientAPI.getStats() };
      
      case 'login':
        const loginData = JSON.parse(options.body || '{}');
        return { 
          json: async () => {
            const result = window.clientAPI.login(loginData.username, loginData.password);
            if (result.success) {
              return result;
            } else {
              throw new Error(result.error);
            }
          }
        };
      
      case 'logout':
        return { json: async () => window.clientAPI.logout() };
      
      default:
        throw new Error('Unknown endpoint');
    }
  } catch (error) {
    throw error;
  }
};

console.log('Client API initialized - using localStorage instead of PHP backend');
