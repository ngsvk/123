// Dynamic Content Management System
class DynamicContentManager {
  constructor() {
    this.currentPage = this.detectCurrentPage();
    this.contentData = {};
    this.adminMode = false;
    this.init();
  }

  init() {
    this.checkAdminMode();
    this.initializeDefaultVideo(); // Set default video immediately
    this.loadPageContent();
    this.setupAdminControls();
    this.setupStorageListener();
  }
  
  initializeDefaultVideo() {
    // For homepage, always ensure a video is playing
    if (this.currentPage === 'homepage') {
      console.log('🌥 Initializing default video for homepage');
      this.updateVideoBackground('https://www.youtube.com/watch?v=zKz4QQKx_jo');
    }
  }

  detectCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '') || 'index';
    
    const pageMap = {
      'index': 'homepage',
      'admissions': 'admissions',
      'academics': 'academics',
      'gallery': 'gallery',
      'campus-life': 'campus-life',
      'about': 'about'
    };

    return pageMap[page] || page;
  }

  checkAdminMode() {
    const session = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        if (sessionData.isAuthenticated) {
          // Check session expiry
          const currentTime = new Date().getTime();
          const sessionAge = currentTime - sessionData.loginTime;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge < maxAge) {
            this.adminMode = true;
            this.addAdminToolbar();
          }
        }
      } catch (e) {
        console.error('Invalid session data');
      }
    }
  }

  async loadPageContent() {
    try {
      console.log(`🔄 Loading content for ${this.currentPage}`);
      console.log('🎯 Current window.location:', window.location.href);
      
      // Check if we need to force refresh (from admin changes)
      const forceRefresh = localStorage.getItem('forceContentRefresh') || sessionStorage.getItem('forceContentRefresh');
      if (forceRefresh) {
        console.log('🔄 Force refresh detected from admin changes');
        localStorage.removeItem('forceContentRefresh');
        sessionStorage.removeItem('forceContentRefresh');
      }
      
      console.log('🌐 About to try API call...');
      
      // Priority 1: Try API first (most up-to-date)
      try {
        const fetchFunction = window.adminFetch || fetch;
        const cacheBuster = forceRefresh ? `&_t=${Date.now()}` : '';
        const apiUrl = `admin/api.php?endpoint=public-content&page=${this.currentPage}${cacheBuster}`;
        console.log('📡 Making API call to:', apiUrl);
        
        const response = await fetchFunction(apiUrl);
        console.log('📨 API Response status:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📨 API Response received:', data);
          if (data.success && data.content && Object.keys(data.content).length > 0) {
            this.contentData = data.content;
            console.log('📋 Content data set:', this.contentData);
            console.log('🔍 Welcome section in data:', this.contentData.welcome);
            this.populatePageContent();
            console.log(`✅ Loaded ${this.currentPage} content from API`);
            return;
          } else {
            console.log('⚠️ API response missing expected data structure:', {
              success: data.success,
              hasContent: !!data.content,
              contentKeys: data.content ? Object.keys(data.content).length : 0
            });
          }
        } else {
          const errorText = await response.text();
          console.error('❌ API Response not OK:', response.status, errorText);
        }
      } catch (apiError) {
        console.error('❌ API fetch failed:', apiError);
        console.error('Error details:', apiError.message, apiError.stack);
        console.warn('Trying localStorage fallback...');
      }
      
      // Priority 2: Try localStorage (admin-saved content)
      const localData = localStorage.getItem(`sssbpuc_${this.currentPage}`);
      if (localData && !forceRefresh) {
        try {
          this.contentData = JSON.parse(localData);
          this.populatePageContent();
          console.log(`✅ Loaded ${this.currentPage} content from localStorage`);
          return;
        } catch (e) {
          console.warn('Error parsing local content:', e);
        }
      }
      
      // Priority 3: Default video for homepage (no overlay content)
      if (this.currentPage === 'homepage') {
        console.log('🎯 No admin data found, showing default video only');
        this.contentData = {}; // Empty data means no overlay content
        this.populatePageContent();
        return;
      }
      
      console.log(`📄 No dynamic content found for ${this.currentPage}, using static content`);
      
    } catch (error) {
      console.error('Error loading page content:', error);
      // Fallback to static content
    }
  }

  populatePageContent() {
    switch (this.currentPage) {
      case 'homepage':
        this.populateHomepage();
        break;
      case 'admissions':
        this.populateAdmissions();
        break;
      case 'academics':
        this.populateAcademics();
        break;
      case 'gallery':
        this.populateGallery();
        break;
      case 'campus-life':
        this.populateCampusLife();
        break;
      case 'about':
        this.populateAbout();
        break;
    }
  }

  populateHomepage() {
    const data = this.contentData;
    console.log('🏠 Dynamic Content: Populating homepage with data:', data);
    
    // Always show the gradient overlay for visual effect
    this.showElement('[data-id="hero-overlay"]');
    
    // Hero Section
    if (data.hero && (data.hero.title || data.hero.subtitle || data.hero.description)) {
      console.log('🎭 Dynamic Content: Processing hero section with content:', data.hero);
      
      // Show hero content only if there's actual content
      this.showElement('[data-id="hero-content"]');
      this.showElement('[data-id="hero-actions"]');
      
      this.updateElement('[data-id="hero-title"]', data.hero.title);
      this.updateElement('[data-id="hero-subtitle"]', data.hero.subtitle);
      this.updateElement('[data-id="hero-description"]', data.hero.description);
      this.updateElement('[data-id="hero-cta-text"]', data.hero.ctaText || data.hero.cta_text);
      
      // Video background
      if (data.hero.videoUrl) {
        console.log('🌥 Dynamic Content: Found videoUrl:', data.hero.videoUrl);
        this.updateVideoBackground(data.hero.videoUrl);
      } else if (data.hero.background_video_url) {
        console.log('🌥 Dynamic Content: Found background_video_url:', data.hero.background_video_url);
        this.updateVideoBackground(data.hero.background_video_url);
      } else {
        console.log('🚫 Dynamic Content: No video URL found in hero data');
        console.log('🔍 Available hero properties:', Object.keys(data.hero));
        // Show default video and keep hero content visible
        this.updateVideoBackground('https://www.youtube.com/watch?v=zKz4QQKx_jo');
      }
      
      // Dynamic Buttons
      if (data.hero.buttons) {
        console.log('🔘 Dynamic Content: Found dynamic buttons:', data.hero.buttons);
        this.updateHeroButtons(data.hero.buttons);
      }
    } else {
      console.log('🚫 Dynamic Content: No hero section data found - keeping hero content hidden');
      // Hide only hero content, keep the gradient overlay visible
      this.hideElement('[data-id="hero-content"]');
      this.hideElement('[data-id="hero-actions"]');
      
      // Set default video if no admin data
      this.updateVideoBackground('https://www.youtube.com/watch?v=zKz4QQKx_jo');
    }

    // Welcome Section
    if (data.welcome) {
      console.log('👋 Dynamic Content: Processing welcome section with admin data:', data.welcome);
      
      // Debug: Check if elements exist
      const subtitleEl = document.querySelector('[data-id="welcome-subtitle"]');
      const titleEl = document.querySelector('[data-id="welcome-title"]');
      const descEl = document.querySelector('[data-id="welcome-description"]');
      
      console.log('🔍 Welcome elements found:', {
        subtitle: !!subtitleEl,
        title: !!titleEl, 
        description: !!descEl
      });
      
      console.log('🔍 Current values before update:', {
        subtitle: subtitleEl?.textContent,
        title: titleEl?.innerHTML?.substring(0, 100) + '...',
        description: descEl?.textContent?.substring(0, 100) + '...'
      });
      
      console.log('🔄 Updating welcome elements with new data...');
      console.log('  - Subtitle:', data.welcome.subtitle);
      console.log('  - Title:', data.welcome.title);
      console.log('  - Description:', data.welcome.description?.substring(0, 100) + '...');
      
      this.updateElement('[data-id="welcome-subtitle"]', data.welcome.subtitle);
      this.updateElement('[data-id="welcome-title"]', data.welcome.title, true);
      this.updateElement('[data-id="welcome-description"]', data.welcome.description);
      
      if (data.welcome.logo_url) {
        console.log('  - Logo URL:', data.welcome.logo_url);
        this.updateImageSrc('[data-id="welcome-logo-img"]', data.welcome.logo_url);
      }
      
      // Debug: Verify updates immediately
      console.log('🔍 Values immediately after update:', {
        subtitle: subtitleEl?.textContent,
        title: titleEl?.innerHTML?.substring(0, 100) + '...',
        description: descEl?.textContent?.substring(0, 100) + '...'
      });
      
      // Debug: Verify updates after a delay
      setTimeout(() => {
        console.log('🔍 After timeout - Welcome section values:', {
          subtitle: subtitleEl?.textContent,
          title: titleEl?.innerHTML?.substring(0, 100) + '...',
          description: descEl?.textContent?.substring(0, 100) + '...'
        });
      }, 100);
      
    } else {
      console.log('📝 Dynamic Content: No admin welcome data - keeping default static content');
      // Welcome section stays visible with default static content from HTML
    }

    // Updates Section
    if (data.updates) {
      this.showElement('[data-id="updates-section"]');
      this.updateElement('[data-id="updates-title"]', data.updates.title);
      this.updateElement('[data-id="updates-subtitle"]', data.updates.subtitle);
      
      if (data.updates.cards && data.updates.cards.length > 0) {
        this.updateCards(data.updates.cards);
      }
    } else {
      console.log('🚫 Dynamic Content: No updates section data found');
      this.hideElement('[data-id="updates-section"]');
    }

    // Statistics Section
    if (data.statistics) {
      console.log('📊 Dynamic Content: Processing statistics section with admin data:', data.statistics);
      this.showElement('[data-id="stats-section"]');
      this.updateElement('[data-id="stats-title"]', data.statistics.title);
      this.updateElement('[data-id="stats-subtitle"]', data.statistics.subtitle);
      
      if (data.statistics.stats && data.statistics.stats.length > 0) {
        this.updateStatistics(data.statistics.stats);
      }
    } else {
      console.log('📝 Dynamic Content: No admin statistics data - ensuring section is visible');
      // Ensure statistics section is visible with default content
      this.showElement('[data-id="stats-section"]');
      
      // Check if stats animation should be triggered
      if (window.animatedStats) {
        setTimeout(() => {
          window.animatedStats.init();
        }, 100);
      }
    }

    // Founder Section
    if (data.founder) {
      console.log('👤 Dynamic Content: Processing founder section with admin data:', data.founder);
      
      if (data.founder.background_image) {
        this.updateBackgroundImage('[data-id="founder-section"]', data.founder.background_image);
      }
      
      if (data.founder.founder1) {
        this.updateFounderCard(1, data.founder.founder1);
      }
      
      if (data.founder.founder2) {
        this.updateFounderCard(2, data.founder.founder2);
      }
    } else {
      console.log('📝 Dynamic Content: No admin founder data - keeping default static content');
      // Founder section stays visible with default static content from HTML
    }

    // Facilities Section
    if (data.facilities) {
      this.showElement('[data-id="facilities-section"]');
      this.updateFacilities(data.facilities);
    } else {
      console.log('📝 Dynamic Content: No admin facilities data - keeping default static content');
      // Facilities section stays visible with default static content from HTML
      this.showElement('[data-id="facilities-section"]');
    }

    // Campus Life Gallery
    if (data.campus_life) {
      this.showElement('[data-id="campus-life-section"]');
      this.updateCampusLifeGallery(data.campus_life);
    } else {
      console.log('📝 Dynamic Content: No admin campus life data - keeping default static content');
      // Campus life section stays visible with default static content from HTML
      this.showElement('[data-id="campus-life-section"]');
    }

    // Sister Institutes Section
    if (data.sister_institutes) {
      console.log('🏢 Dynamic Content: Processing Sister Institutes data:', data.sister_institutes);
      this.showElement('[data-id="sister-institutes-section"]');
      
      this.updateElement('[data-id="sister-institutes-title"]', data.sister_institutes.title);
      this.updateElement('[data-id="sister-institutes-subtitle"]', data.sister_institutes.subtitle);
      
      // Update Sister Institutes Carousel only if admin data exists and carousel is ready
      if (data.sister_institutes.items && data.sister_institutes.items.length > 0 && window.sisterInstitutesCarousel) {
        console.log('🔄 Dynamic Content: Updating Sister Institutes carousel with', data.sister_institutes.items.length, 'items');
        window.sisterInstitutesCarousel.updateInstitutes(data.sister_institutes.items);
      } else {
        console.log('💭 Dynamic Content: Sister Institutes - keeping defaults or waiting for carousel:', {
          hasItems: !!(data.sister_institutes.items && data.sister_institutes.items.length > 0),
          hasCarousel: !!window.sisterInstitutesCarousel
        });
      }
    } else {
      console.log('📝 Dynamic Content: No admin Sister Institutes data - keeping default static content');
      // Sister Institutes section stays visible with default static content from HTML
      this.showElement('[data-id="sister-institutes-section"]');
    }
  }

  populateAbout() {
    const data = this.contentData;
    console.log('📖 Dynamic Content: Populating About page with data:', data);
    
    // Hero Section
    if (data.hero) {
      console.log('🎭 Processing About hero section:', data.hero);
      this.updateElement('[data-id="about-hero-title"]', data.hero.title);
      this.updateElement('[data-id="about-hero-subtitle"]', data.hero.subtitle);
      
      if (data.hero.background_image) {
        this.updateBackgroundImage('[data-id="about-hero-bg"] img', data.hero.background_image);
      }
    }

    // Welcome/Overview Section
    if (data.overview) {
      console.log('👋 Processing About overview section:', data.overview);
      this.updateElement('[data-id="welcome-subtitle"]', data.overview.subtitle || 'ABOUT US');
      this.updateElement('[data-id="welcome-title"]', data.overview.title, true);
      this.updateElement('[data-id="welcome-description"]', data.overview.description);
      
      if (data.overview.logo_url) {
        this.updateImageSrc('[data-id="welcome-logo-img"]', data.overview.logo_url);
      }
    }
    
    // Welcome Section (fallback)
    if (data.welcome && !data.overview) {
      console.log('👋 Processing About welcome section:', data.welcome);
      this.updateElement('[data-id="welcome-subtitle"]', data.welcome.subtitle);
      this.updateElement('[data-id="welcome-title"]', data.welcome.title, true);
      this.updateElement('[data-id="welcome-description"]', data.welcome.description);
      
      if (data.welcome.logo_url) {
        this.updateImageSrc('[data-id="welcome-logo-img"]', data.welcome.logo_url);
      }
    }

    // Founder Section
    if (data.founder) {
      console.log('👤 Processing About founder section:', data.founder);
      
      // Update founder president
      if (data.founder.founder_president) {
        this.updateElement('[data-id="founder-name-1"]', data.founder.founder_president.name);
        this.updateElement('[data-id="founder-title-1"]', data.founder.founder_president.title);
        this.updateElement('[data-id="founder-description-1"]', data.founder.founder_president.description);
        this.updateElement('[data-id="founder-legacy-1"]', data.founder.founder_president.legacy);
        
        if (data.founder.founder_president.image_url) {
          this.updateImageSrc('[data-id="founder-photo-1"]', data.founder.founder_president.image_url);
        }
      }
      
      // Update divine inspiration
      if (data.founder.divine_inspiration) {
        this.updateElement('[data-id="founder-name-2"]', data.founder.divine_inspiration.name);
        this.updateElement('[data-id="founder-title-2"]', data.founder.divine_inspiration.title);
        this.updateElement('[data-id="founder-description-2"]', data.founder.divine_inspiration.description);
        this.updateElement('[data-id="founder-teachings-2"]', data.founder.divine_inspiration.teachings);
        
        if (data.founder.divine_inspiration.image_url) {
          this.updateImageSrc('[data-id="founder-photo-2"]', data.founder.divine_inspiration.image_url);
        }
      }
    }
    
    // Mission Vision Section
    if (data.mission_vision) {
      console.log('🎯 Processing mission vision section:', data.mission_vision);
      
      if (data.mission_vision.mission) {
        this.updateElement('[data-id="mission-title"]', data.mission_vision.mission.title);
        this.updateElement('[data-id="mission-description"]', data.mission_vision.mission.description);
      }
      
      if (data.mission_vision.vision) {
        this.updateElement('[data-id="vision-title"]', data.mission_vision.vision.title);
        this.updateElement('[data-id="vision-description"]', data.mission_vision.vision.description);
      }
    }
    
    // Facilities Section
    if (data.facilities) {
      console.log('🏢 Processing facilities section:', data.facilities);
      this.updateElement('[data-id="facilities-title"]', data.facilities.title);
      this.updateElement('[data-id="facilities-subtitle"]', data.facilities.subtitle);
      
      if (data.facilities.items) {
        this.updateFacilitiesList(data.facilities.items);
      }
    }
    
    // History Section
    if (data.history) {
      console.log('📚 Processing history section:', data.history);
      this.updateElement('[data-id="history-title"]', data.history.title);
      this.updateElement('[data-id="history-subtitle"]', data.history.subtitle);
      
      if (data.history.milestones) {
        this.updateHistoryTimeline(data.history.milestones);
      }
    }
    
    console.log('✅ About page content update completed');
  }

  populateAcademics() {
    const data = this.contentData;
    
    // Hero Section
    if (data.hero) {
      this.updateElement('[data-id="academics-hero-title"]', data.hero.title);
      this.updateElement('[data-id="academics-hero-subtitle"]', data.hero.subtitle);
      if (data.hero.background_image) {
        this.updateBackgroundImage('[data-id="academics-hero-bg"] img', data.hero.background_image);
      }
    }

    // Programs Section
    if (data.programs) {
      this.updateElement('[data-id="programs-title"]', data.programs.title);
      this.updateElement('[data-id="programs-subtitle"]', data.programs.subtitle);
      
      if (data.programs.items) {
        data.programs.items.forEach((program, index) => {
          const programType = index === 0 ? 'high-school' : 'pre-university';
          this.updateElement(`[data-id="program-${programType}-title"]`, program.name);
          this.updateElement(`[data-id="program-${programType}-description"]`, program.description);
          if (program.image_url) {
            this.updateImageSrc(`[data-id="program-${programType}-image"]`, program.image_url);
          }
          if (program.features) {
            program.features.forEach((feature, featureIndex) => {
              this.updateElement(`[data-id="program-${programType}-feature-${featureIndex}"]`, feature);
            });
          }
        });
      }
    }
  }

  populateGallery() {
    const data = this.contentData;
    
    // Hero Section
    if (data.hero) {
      this.updateElement('[data-id="gallery-hero-title"]', data.hero.title);
      this.updateElement('[data-id="gallery-hero-subtitle"]', data.hero.subtitle);
      if (data.hero.background_image) {
        this.updateBackgroundImage('[data-id="gallery-hero-bg"] img', data.hero.background_image);
      }
    }

    // Campus Life Section
    if (data.campus_life) {
      this.updateElement('[data-id="campus-gallery-title"]', data.campus_life.title);
      this.updateElement('[data-id="campus-gallery-subtitle"]', data.campus_life.subtitle);
      
      if (data.campus_life.photos) {
        data.campus_life.photos.forEach((photo, index) => {
          const photoIndex = index + 1;
          this.updateImageSrc(`[data-id="campus-photo-${photoIndex}"] img`, photo.url);
          this.updateElement(`[data-id="campus-photo-${photoIndex}-info"] h3`, photo.title);
          this.updateElement(`[data-id="campus-photo-${photoIndex}-info"] p`, photo.description);
        });
      }
    }

    // Facilities Section
    if (data.facilities) {
      this.updateElement('[data-id="facilities-gallery-title"]', data.facilities.title);
      this.updateElement('[data-id="facilities-gallery-subtitle"]', data.facilities.subtitle);
    }
  }

  populateCampusLife() {
    // Similar to academics, handle campus life content
    console.log('Campus Life content:', this.contentData);
  }


  // Utility methods for updating content
  updateElement(selector, content, isHTML = false) {
    console.log(`🔧 updateElement called: ${selector} = "${content}" (HTML: ${isHTML})`);
    const element = document.querySelector(selector);
    console.log(`🎯 Element found: ${!!element}`);
    
    if (element && content) {
      const oldValue = isHTML ? element.innerHTML : element.textContent;
      
      if (isHTML) {
        element.innerHTML = content;
      } else {
        element.textContent = content;
      }
      
      console.log(`✅ Updated "${selector}" from "${oldValue}" to "${content}"`);
    } else if (!element) {
      console.warn(`❌ Element not found: ${selector}`);
    } else if (!content) {
      console.warn(`⚠️ No content provided for: ${selector}`);
    }
  }
  
  showElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.setProperty('display', 'block', 'important');
      element.classList.remove('hidden');
      console.log(`👀 Showing element: ${selector}`);
    }
  }
  
  hideElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.style.setProperty('display', 'none', 'important');
      element.classList.add('hidden');
      console.log(`🙈 Hiding element: ${selector}`);
    }
  }

  updateImageSrc(selector, src) {
    const element = document.querySelector(selector);
    if (element && src) {
      element.src = src;
      console.log(`🖼️ Updated image: ${selector}`);
    }
  }

  updateFounderCard(founderNumber, founderData) {
    const cardSelector = `[data-id="founder-card-${founderNumber}"]`;
    
    if (founderData.tag) {
      this.updateElement(`[data-id="founder-tag-${founderNumber}"]`, founderData.tag);
    }
    
    if (founderData.name) {
      this.updateElement(`[data-id="founder-name-${founderNumber}"]`, founderData.name);
    }
    
    if (founderData.description) {
      this.updateElement(`[data-id="founder-desc-${founderNumber}"]`, founderData.description);
    }
    
    if (founderData.image_url) {
      this.updateImageSrc(`[data-id="founder-photo-${founderNumber}"]`, founderData.image_url);
    }
    
    if (founderData.link) {
      const linkElement = document.querySelector(`[data-id="founder-link-${founderNumber}"]`);
      if (linkElement) {
        linkElement.href = founderData.link;
      }
    }
  }

  updateBackgroundImage(selector, imageUrl) {
    const element = document.querySelector(selector);
    if (element && imageUrl) {
      element.style.backgroundImage = `url(${imageUrl})`;
    }
  }
  
  updateFacilitiesList(facilities) {
    console.log('🏢 Updating facilities list:', facilities);
    const facilitiesContainer = document.querySelector('[data-id="facilities-grid"]');
    
    if (!facilitiesContainer || !facilities || facilities.length === 0) {
      console.warn('Facilities container not found or no facilities data');
      return;
    }
    
    // Update each facility item
    facilities.forEach((facility, index) => {
      this.updateElement(`[data-id="facility-${index}-name"]`, facility.name);
      this.updateElement(`[data-id="facility-${index}-description"]`, facility.description);
      
      if (facility.image_url) {
        this.updateImageSrc(`[data-id="facility-${index}-image"]`, facility.image_url);
      }
      
      if (facility.icon) {
        const iconElement = document.querySelector(`[data-id="facility-${index}-icon"]`);
        if (iconElement) {
          iconElement.className = `${facility.icon} text-4xl text-primary`;
        }
      }
    });
  }
  
  updateHistoryTimeline(milestones) {
    console.log('📅 Updating history timeline:', milestones);
    const timelineContainer = document.querySelector('[data-id="history-timeline"]');
    
    if (!timelineContainer || !milestones || milestones.length === 0) {
      console.warn('Timeline container not found or no milestones data');
      return;
    }
    
    // Update each milestone
    milestones.forEach((milestone, index) => {
      this.updateElement(`[data-id="milestone-${index}-year"]`, milestone.year);
      this.updateElement(`[data-id="milestone-${index}-title"]`, milestone.title);
      this.updateElement(`[data-id="milestone-${index}-description"]`, milestone.description);
    });
  }

  updateVideoBackground(videoUrl) {
    console.log('🎥 Dynamic Content: Updating video background with URL:', videoUrl);
    console.log('🔍 Video container exists:', !!document.querySelector('#video-container'));
    const videoContainer = document.querySelector('#video-container');
    
    if (!videoContainer) {
      console.warn('❌ Video container not found');
      return;
    }
    
    if (!videoUrl || videoUrl.includes('YOUR_VIDEO_ID') || videoUrl === '') {
      console.log('⚠️ No valid video URL provided, using fallback background');
      videoContainer.innerHTML = '';
      videoContainer.style.backgroundImage = "url('./assets/baba/bhajan-hall.png')";
      videoContainer.style.backgroundSize = 'cover';
      videoContainer.style.backgroundPosition = 'center';
      return;
    }
    
    // Handle YouTube embed URLs
    let embedUrl = videoUrl;
    if (videoUrl.includes('youtube.com/watch')) {
      const videoId = videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        // Use specific parameters for better looping
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&start=0&end=0`;
      }
    } else if (videoUrl.includes('youtu.be/')) {
      const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&start=0&end=0`;
      }
    } else if (videoUrl.includes('youtube.com/embed/')) {
      // Already an embed URL, ensure proper parameters for looping
      const videoId = videoUrl.split('/embed/')[1]?.split('?')[0];
      if (videoId) {
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&disablekb=1&fs=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&cc_load_policy=0&start=0&end=0`;
      }
    }
    
    console.log('🎬 Setting video iframe with URL:', embedUrl);
    
    // Clear any existing background styles
    videoContainer.style.backgroundImage = '';
    
    videoContainer.innerHTML = `
      <iframe 
        src="${embedUrl}" 
        frameborder="0" 
        allow="autoplay; encrypted-media" 
        allowfullscreen
        class="w-full h-full object-cover"
        style="pointer-events: none;"
        onload="console.log('✅ Video iframe loaded successfully');"
        onerror="console.error('❌ Video iframe failed to load'); this.parentElement.style.backgroundImage = \"url('./assets/baba/bhajan-hall.png')\";"
      ></iframe>
    `;
  }

  updateHeroButtons(buttons) {
    console.log('🎆 Updating hero buttons:', buttons);
    const actionsContainer = document.querySelector('[data-id="hero-actions"]');
    
    if (!actionsContainer) {
      console.warn('❌ Hero actions container not found');
      return;
    }
    
    if (!buttons || !Array.isArray(buttons) || buttons.length === 0) {
      console.log('🚫 No buttons provided, hiding actions container');
      this.hideElement('[data-id="hero-actions"]');
      return;
    }
    
    // Show the actions container
    this.showElement('[data-id="hero-actions"]');
    
    // Clear existing buttons
    actionsContainer.innerHTML = '';
    
    // Create buttons dynamically
    buttons.forEach((button, index) => {
      const buttonElement = this.createHeroButton(button, index);
      actionsContainer.appendChild(buttonElement);
    });
    
    // Add animation class to container
    actionsContainer.classList.add('animate-fade-in');
  }

  createHeroButton(buttonData, index) {
    const button = document.createElement('a');
    button.href = buttonData.link || '#';
    button.setAttribute('data-id', `hero-button-${index}`);
    
    // Set up button styling based on style type
    const baseClasses = 'inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg';
    
    let styleClasses = '';
    let hoverClasses = '';
    
    switch (buttonData.style) {
      case 'primary':
        styleClasses = 'bg-secondary text-white shadow-lg';
        hoverClasses = 'hover:bg-secondary/90 hover:shadow-xl';
        break;
      case 'secondary':
        styleClasses = 'bg-white/20 text-white border-2 border-white/30 backdrop-blur-sm';
        hoverClasses = 'hover:bg-white hover:text-primary hover:border-white';
        break;
      case 'outline':
        styleClasses = 'border-2 border-white text-white bg-transparent';
        hoverClasses = 'hover:bg-white hover:text-primary hover:border-white';
        break;
      case 'phone':
        styleClasses = 'bg-green-600 text-white shadow-lg animate-pulse';
        hoverClasses = 'hover:bg-green-700 hover:shadow-xl hover:animate-none';
        break;
      default:
        styleClasses = 'bg-primary text-white';
        hoverClasses = 'hover:bg-primary/90';
    }
    
    button.className = `${baseClasses} ${styleClasses} ${hoverClasses}`;
    
    // Add content with icon and text
    const icon = buttonData.icon ? `<i class="${buttonData.icon} mr-2"></i>` : '';
    const text = buttonData.text || 'Button';
    
    button.innerHTML = `${icon}${text}`;
    
    // Add special handling for phone buttons
    if (buttonData.action === 'call') {
      button.onclick = (e) => {
        e.preventDefault();
        window.location.href = buttonData.link;
        
        // Add some visual feedback
        button.classList.add('animate-bounce');
        setTimeout(() => {
          button.classList.remove('animate-bounce');
        }, 1000);
      };
    }
    
    // Add data attributes for analytics or tracking
    button.setAttribute('data-button-action', buttonData.action || 'navigate');
    button.setAttribute('data-button-style', buttonData.style || 'default');
    
    return button;
  }

  updateCards(cards) {
    const container = document.querySelector('[data-id="updates-grid"]');
    if (!container || !cards.length) return;

    // Clear existing cards but keep structure
    const existingCards = container.querySelectorAll('[data-id^="update-card-"]');
    existingCards.forEach(card => card.remove());

    cards.forEach((card, index) => {
      const cardElement = this.createUpdateCard(card, index);
      container.appendChild(cardElement);
    });
  }

  createUpdateCard(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow';
    cardDiv.setAttribute('data-id', `update-card-${index}`);
    
    cardDiv.innerHTML = `
      <img class="w-full h-48 object-cover" src="${card.image_url}" alt="${card.title}" data-id="update-${index}-image" />
      <div class="p-6" data-id="update-${index}-content">
        <div class="flex items-center mb-4" data-id="update-${index}-meta">
          <span class="text-sm text-primary font-medium" data-id="update-${index}-type">${card.type}</span>
          <span class="mx-2">•</span>
          <span class="text-sm text-gray-500" data-id="update-${index}-date">${card.date}</span>
        </div>
        <h3 class="text-xl font-semibold mb-2" data-id="update-${index}-title">${card.title}</h3>
        <p class="text-gray-600 mb-4" data-id="update-${index}-description">${card.description}</p>
        <a href="${card.link}" class="text-primary font-medium hover:underline">Read more →</a>
      </div>
    `;

    return cardDiv;
  }

  updateFounderCard(cardNumber, founderData) {
    const selectors = {
      tag: `[data-id="founder-tag-${cardNumber}"]`,
      title: `[data-id="founder-title-${cardNumber}"] a`,
      description: `[data-id="founder-desc-${cardNumber}"]`,
      image: `[data-id="founder-photo-${cardNumber}"]`,
      link: `[data-id="founder-link-${cardNumber}"]`
    };

    this.updateElement(selectors.tag, founderData.tag);
    this.updateElement(selectors.title, founderData.name);
    
    // Update description with read more link
    const descElement = document.querySelector(selectors.description);
    if (descElement && founderData.description) {
      descElement.innerHTML = `
        ${founderData.description}
        <a href="${founderData.read_more_link || '#'}" class="read-more">Read more</a>
      `;
    }

    this.updateImageSrc(selectors.image, founderData.image_url);
    
    // Update links
    const linkElements = document.querySelectorAll(`${selectors.link}, [data-id="founder-readmore-${cardNumber}"]`);
    linkElements.forEach(link => {
      if (founderData.read_more_link) {
        link.href = founderData.read_more_link;
      }
    });
  }

  updateFacilities(facilitiesData) {
    if (!facilitiesData.items) return;

    facilitiesData.items.forEach((facility, index) => {
      // Update facility content based on index or ID
      // This would need to be mapped to the actual HTML structure
      console.log(`Facility ${index + 1}:`, facility);
    });
  }

  updateCampusLifeGallery(campusLifeData) {
    if (!campusLifeData.images) return;

    // Update campus life gallery images
    campusLifeData.images.forEach((image, index) => {
      console.log(`Campus image ${index + 1}:`, image);
    });
  }

  updateProgramsList(programs) {
    const container = document.getElementById('programs-list');
    if (!container || !programs) return;

    container.innerHTML = '';
    programs.forEach((program, index) => {
      const programElement = this.createProgramCard(program, index);
      container.appendChild(programElement);
    });
  }

  createProgramCard(program, index) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-xl shadow-sm p-8';
    div.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div class="lg:col-span-2">
          <h3 class="text-2xl font-bold text-gray-900 mb-4">${program.name}</h3>
          <p class="text-gray-600 mb-4">${program.description}</p>
          <div class="mb-4">
            <span class="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              ${program.eligibility}
            </span>
          </div>
          ${program.subjects ? `
            <div class="flex flex-wrap gap-2">
              ${program.subjects.map(subject => `
                <span class="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">${subject}</span>
              `).join('')}
            </div>
          ` : ''}
          ${program.streams ? `
            <div class="space-y-2">
              ${program.streams.map(stream => `
                <div class="border-l-4 border-primary pl-4">
                  <h4 class="font-semibold">${stream.name}</h4>
                  <div class="flex flex-wrap gap-2 mt-1">
                    ${stream.subjects.map(subject => `
                      <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">${subject}</span>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div class="text-center lg:text-right">
          ${program.image_url ? `
            <img src="${program.image_url}" alt="${program.name}" class="w-full max-w-sm mx-auto lg:mx-0 rounded-lg shadow-md">
          ` : ''}
        </div>
      </div>
    `;
    return div;
  }

  updateProcessSteps(steps) {
    const container = document.getElementById('process-steps');
    if (!container || !steps) return;

    container.innerHTML = '';
    steps.forEach((step, index) => {
      const stepElement = this.createProcessStep(step, index, steps.length);
      container.appendChild(stepElement);
    });
  }

  createProcessStep(step, index, total) {
    const div = document.createElement('div');
    div.className = 'relative flex items-start lg:items-center';
    div.innerHTML = `
      ${index < total - 1 ? '<div class="absolute left-8 top-16 lg:top-8 w-0.5 h-16 lg:h-0.5 lg:w-16 bg-primary/20 lg:left-16 lg:top-8"></div>' : ''}
      <div class="flex-shrink-0">
        <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
          ${step.step}
        </div>
      </div>
      <div class="ml-6 lg:ml-8 flex-1">
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-center mb-4">
            <i class="${step.icon} text-primary text-2xl mr-3"></i>
            <h3 class="text-xl font-semibold text-gray-900">${step.title}</h3>
          </div>
          <p class="text-gray-600 mb-4">${step.description}</p>
          ${step.documents ? `
            <div>
              <h4 class="text-sm font-semibold text-gray-700 mb-2">Required Documents:</h4>
              <ul class="text-sm text-gray-600 space-y-1">
                ${step.documents.map(doc => `<li>• ${doc}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    return div;
  }

  updateFeeStructure(feeData) {
    // Update fee structure elements
    console.log('Fee structure:', feeData);
    // Implementation would depend on the specific HTML structure
  }

  updateGalleryImages(images) {
    // Update gallery images
    console.log('Gallery images:', images);
    // Implementation would depend on the gallery HTML structure
  }

  // Admin Mode Features
  addAdminToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'admin-toolbar';
    toolbar.className = 'fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50 text-sm';
    toolbar.innerHTML = `
      <span>Admin Mode Active</span>
      <a href="admin-dashboard.html" class="ml-4 underline">Dashboard</a>
      <button onclick="dynamicContent.toggleEditMode()" class="ml-4 bg-red-700 px-3 py-1 rounded">
        ${this.editMode ? 'Exit Edit' : 'Quick Edit'}
      </button>
    `;
    document.body.prepend(toolbar);
    
    // Adjust body padding to account for toolbar
    document.body.style.paddingTop = '40px';
  }

  setupAdminControls() {
    if (!this.adminMode) return;

    // Add edit indicators to dynamic content elements
    this.addEditIndicators();
  }

  addEditIndicators() {
    // Add visual indicators for editable content
    const editableElements = document.querySelectorAll('[data-id]');
    editableElements.forEach(element => {
      if (!element.querySelector('.edit-indicator')) {
        const indicator = document.createElement('div');
        indicator.className = 'edit-indicator absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded opacity-75 hidden';
        indicator.textContent = 'Edit';
        element.style.position = 'relative';
        element.appendChild(indicator);
        
        element.addEventListener('mouseenter', () => indicator.classList.remove('hidden'));
        element.addEventListener('mouseleave', () => indicator.classList.add('hidden'));
      }
    });
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
    const button = document.querySelector('#admin-toolbar button');
    if (button) {
      button.textContent = this.editMode ? 'Exit Edit' : 'Quick Edit';
    }
    
    // Toggle edit indicators visibility
    const indicators = document.querySelectorAll('.edit-indicator');
    indicators.forEach(indicator => {
      if (this.editMode) {
        indicator.classList.remove('hidden');
      } else {
        indicator.classList.add('hidden');
      }
    });
  }

  // Method to update page content from admin dashboard
  updatePageContent(page, data) {
    if (page === this.currentPage) {
      this.contentData = data;
      this.populatePageContent();
      console.log(`✅ Updated ${page} content from admin dashboard`);
    }
  }

  // Method to refresh current page content
  refreshContent() {
    this.loadPageContent();
  }
  
  // Debug method to test API directly
  async testAPI() {
    try {
      const apiUrl = `admin/api.php?endpoint=public-content&page=${this.currentPage}`;
      console.log('🧪 Testing API:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📨 Test API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Test API Response data:', data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('❌ Test API failed:', response.status, errorText);
        return { error: `HTTP ${response.status}: ${errorText}` };
      }
    } catch (error) {
      console.error('❌ Test API error:', error);
      return { error: error.message };
    }
  }
  
  // Debug method to check welcome elements
  checkWelcomeElements() {
    const elements = {
      subtitle: document.querySelector('[data-id="welcome-subtitle"]'),
      title: document.querySelector('[data-id="welcome-title"]'),
      description: document.querySelector('[data-id="welcome-description"]')
    };
    
    console.log('🔍 Welcome elements:', {
      subtitle: { found: !!elements.subtitle, content: elements.subtitle?.textContent },
      title: { found: !!elements.title, content: elements.title?.innerHTML?.substring(0, 100) + '...' },
      description: { found: !!elements.description, content: elements.description?.textContent?.substring(0, 100) + '...' }
    });
    
    return elements;
  }

  // Method to update statistics from admin
  updateStatistics(statsData) {
    if (!statsData || !Array.isArray(statsData)) return;
    
    console.log('📊 Updating statistics with data:', statsData);
    
    const statsGrid = document.querySelector('[data-id="stats-grid"]');
    if (!statsGrid) {
      console.error('Stats grid not found');
      return;
    }

    // Update existing statistics based on data-id patterns from HTML
    const statMappings = [
      { selector: '[data-id="stat-students-number"]', label: '[data-id="stat-students-label"]' },
      { selector: '[data-id="stat-faculty-number"]', label: '[data-id="stat-faculty-label"]' },
      { selector: '[data-id="stat-programs-number"]', label: '[data-id="stat-programs-label"]' },
      { selector: '[data-id="stat-passing-number"]', label: '[data-id="stat-passing-label"]' }
    ];
    
    statsData.forEach((stat, index) => {
      if (index < statMappings.length) {
        const mapping = statMappings[index];
        const statElement = document.querySelector(mapping.selector);
        const labelElement = document.querySelector(mapping.label);
        
        if (statElement) {
          statElement.setAttribute('data-target', stat.target || stat.number.replace(/[^0-9]/g, '') || '0');
          statElement.textContent = stat.number || '0';
          console.log(`Updated stat ${index}: ${stat.number} (${stat.label})`);
        }
        
        if (labelElement) {
          labelElement.textContent = stat.label || '';
        }
      }
    });

    // Restart animation if stats manager exists
    if (window.animatedStats) {
      window.animatedStats.restart();
    } else {
      console.log('No animated stats manager found, skipping animation');
    }
  }

  // Setup storage listener for real-time updates
  setupStorageListener() {
    // Listen for localStorage changes from other tabs (admin dashboard)
    window.addEventListener('storage', (e) => {
      if (e.key === `sssbpuc_${this.currentPage}`) {
        console.log(`📡 Detected ${this.currentPage} content update from admin panel`);
        try {
          const newData = JSON.parse(e.newValue);
          this.contentData = newData;
          this.populatePageContent();
        } catch (error) {
          console.error('Error parsing updated content:', error);
        }
      }
    });

    // Override localStorage.setItem to catch same-tab updates
    const originalSetItem = localStorage.setItem;
    const self = this;
    
    localStorage.setItem = function(key, value) {
      const result = originalSetItem.apply(this, arguments);
      
      // Trigger custom event for same-tab updates
      const event = new CustomEvent('localStorageUpdate', {
        detail: { key, value }
      });
      window.dispatchEvent(event);
      
      return result;
    };

    // Listen for same-tab localStorage updates
    window.addEventListener('localStorageUpdate', (e) => {
      if (e.detail.key === `sssbpuc_${this.currentPage}`) {
        console.log(`📱 Detected ${this.currentPage} content update from same tab`);
        setTimeout(() => {
          try {
            const newData = JSON.parse(e.detail.value);
            this.contentData = newData;
            this.populatePageContent();
            
            // Special handling for statistics animation restart
            if (this.currentPage === 'homepage' && window.animatedStats) {
              window.animatedStats.restart();
            }
          } catch (error) {
            console.error('Error parsing updated content:', error);
          }
        }, 100);
      }
    });

    // Also listen for direct messages from admin dashboard
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'contentUpdate' && e.data.page === this.currentPage) {
        console.log(`💬 Received content update message for ${this.currentPage}`);
        this.contentData = e.data.content;
        this.populatePageContent();
        
        if (this.currentPage === 'homepage' && window.animatedStats) {
          window.animatedStats.restart();
        }
      }
    });
  }
}

// Initialize the dynamic content manager when the page loads
let dynamicContent;
document.addEventListener('DOMContentLoaded', function() {
  dynamicContent = new DynamicContentManager();
});

// Debug functions for testing (call from browser console)
window.debugVideo = {
  // Test with a known working YouTube video
  testVideo: function() {
    const testUrl = 'https://www.youtube.com/watch?v=zKz4QQKx_jo';
    console.log('🧪 Testing video with URL:', testUrl);
    if (dynamicContent) {
      dynamicContent.updateVideoBackground(testUrl);
    } else {
      console.error('Dynamic content manager not ready');
    }
  },
  
  // Test different video formats
  testFormats: function() {
    const formats = [
      'https://www.youtube.com/watch?v=zKz4QQKx_jo',
      'https://youtu.be/zKz4QQKx_jo',
      'https://www.youtube.com/embed/zKz4QQKx_jo'
    ];
    
    formats.forEach((url, index) => {
      setTimeout(() => {
        console.log(`🧪 Testing format ${index + 1}:`, url);
        if (dynamicContent) {
          dynamicContent.updateVideoBackground(url);
        }
      }, index * 3000); // 3 second delay between tests
    });
  },
  
  // Check current localStorage content
  checkStorage: function() {
    const data = localStorage.getItem('sssbpuc_homepage');
    if (data) {
      const parsed = JSON.parse(data);
      console.log('💾 Homepage data:', parsed);
      if (parsed.hero) {
        console.log('🎥 Video URL in storage:', parsed.hero.videoUrl || parsed.hero.background_video_url || 'None found');
      }
    } else {
      console.log('🚫 No homepage data in localStorage');
    }
  },
  
  // Set a default video for testing
  setDefaultVideo: function() {
    const defaultData = {
      hero: {
        title: 'Welcome to Sri Sathya Sai School & PU College',
        subtitle: 'Excellence in Education, Values in Life',
        description: 'Fostering holistic development through Education in Human Values.',
        videoUrl: 'https://www.youtube.com/watch?v=zKz4QQKx_jo',
        ctaText: 'Apply Now'
      }
    };
    
    localStorage.setItem('sssbpuc_homepage', JSON.stringify(defaultData));
    console.log('🎯 Default video data set in localStorage');
    
    if (dynamicContent) {
      dynamicContent.loadPageContent();
    }
  },
  
  // Reload page content
  reload: function() {
    if (dynamicContent) {
      dynamicContent.loadPageContent();
    }
  },
  
  // Force refresh content (bypass cache)
  forceRefresh: function() {
    console.log('🔄 Forcing content refresh from API');
    sessionStorage.setItem('forceContentRefresh', 'true');
    if (dynamicContent) {
      dynamicContent.loadPageContent();
    }
  },
  
  // Clear video and show fallback
  clearVideo: function() {
    const container = document.querySelector('#video-container');
    if (container) {
      container.innerHTML = '';
      container.style.backgroundImage = "url('./assets/baba/bhajan-hall.png')";
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
      console.log('🖼️ Video cleared, fallback image set');
    }
  },
  
  // Check video container status
  checkContainer: function() {
    const container = document.querySelector('#video-container');
    if (container) {
      console.log('🗺 Video container found');
      console.log('- innerHTML:', container.innerHTML);
      console.log('- backgroundImage:', container.style.backgroundImage);
      console.log('- computed styles:', window.getComputedStyle(container));
    } else {
      console.error('❌ Video container not found');
    }
  }
};
