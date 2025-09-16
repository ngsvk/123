// Simple Sister Institutes Carousel - Matches Reference Design
console.log('📜 Sister Institutes: Script loaded successfully');

class SisterInstitutesCarousel {
  constructor() {
    this.currentIndex = 0;
    this.totalSlides = 6; // We have 6 slides in the HTML
    this.itemsPerView = 4; // Show 4 slides at once on desktop
    this.slider = document.querySelector('[data-id="sister-institutes-slider"]');
    this.prevBtn = document.querySelector('.sister-institutes-slider-wrapper .prev');
    this.nextBtn = document.querySelector('.sister-institutes-slider-wrapper .next');
    
    this.init();
  }

  init() {
    console.log('🏢 Sister Institutes: Initializing simple carousel');
    
    if (!this.slider) {
      console.error('Sister Institutes slider not found');
      return;
    }
    
    this.updateResponsiveSettings();
    this.setupEventListeners();
    this.setupResizeHandler();
    
    console.log('✅ Sister Institutes: Simple carousel initialized');
  }

  updateResponsiveSettings() {
    const width = window.innerWidth;
    if (width < 640) {
      this.itemsPerView = 1; // Mobile: 1 card
    } else if (width < 768) {
      this.itemsPerView = 1; // Small mobile: 1 card
    } else if (width < 1024) {
      this.itemsPerView = 2; // Tablet: 2 cards
    } else if (width < 1280) {
      this.itemsPerView = 3; // Small desktop: 3 cards
    } else {
      this.itemsPerView = 4; // Large desktop: 4 cards
    }
    
    // Update slide widths dynamically
    this.updateSlideWidths();
  }

  updateSlideWidths() {
    const slides = document.querySelectorAll('[data-id^="institute-slide-"]');
    const widthPercentage = 100 / this.itemsPerView;
    
    slides.forEach(slide => {
      slide.style.width = `${widthPercentage}%`;
      slide.style.flexBasis = `${widthPercentage}%`;
    });
  }

  createSlides() {
    console.log('🎪 Sister Institutes: Creating slides for', this.institutes.length, 'institutes');
    
    const slider = document.querySelector('[data-id="sister-institutes-slider"]');
    if (!slider) {
      console.error('❌ Sister Institutes: Slider element not found!');
      return;
    }

    console.log('✅ Sister Institutes: Found slider element, creating slides...');
    
    // Remove loading message
    const loadingMessage = slider.querySelector('.loading-message');
    if (loadingMessage) {
      loadingMessage.remove();
      console.log('🧹 Sister Institutes: Removed loading message');
    }
    
    slider.innerHTML = '';

    // Create slides from institutes data
    this.institutes.forEach((institute, index) => {
      const slide = document.createElement('div');
      slide.className = 'slide flex-shrink-0 px-3';
      slide.setAttribute('data-id', `institute-slide-${index}`);
      
      // Set initial width based on current responsive setting
      const widthPercentage = 100 / this.itemsPerView;
      slide.style.width = `${widthPercentage}%`;
      slide.style.flexBasis = `${widthPercentage}%`;

      slide.innerHTML = `
        <div class="relative group overflow-hidden rounded-xl shadow-lg bg-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl" 
             data-website="${institute.website}">
          
          <!-- Image -->
          <div class="relative overflow-hidden">
            <img src="${institute.image}" 
                 alt="${institute.name}" 
                 class="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110" 
                 data-id="institute-${index}-image" 
                 onerror="this.src='assets/sister/Alike.jpg'" />
            
            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" 
                 data-id="institute-${index}-overlay">
              
              <!-- Centered Institute Name -->
              <div class="text-center transform -translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 class="text-xl font-bold text-white mb-2 drop-shadow-lg" 
                    data-id="institute-${index}-name">${institute.name}</h3>
                <p class="text-sm text-gray-200 mb-4 px-4 max-w-xs mx-auto" 
                   data-id="institute-${index}-description">${institute.description}</p>
                <div class="inline-flex items-center text-sm text-blue-300 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
                  <i class="ri-external-link-line mr-2"></i>
                  Visit Website
                </div>
              </div>
            </div>
          </div>
          
          <!-- Card Footer -->
          <div class="p-4 bg-white">
            <h4 class="font-semibold text-gray-900 text-lg mb-1">${this.getShortName(institute.name)}</h4>
            <p class="text-gray-600 text-sm">${institute.location || this.getLocationFromName(institute.name)}</p>
          </div>
        </div>
      `;

      // Add click handler
      const cardElement = slide.querySelector('[data-website]');
      if (cardElement) {
        cardElement.addEventListener('click', (e) => {
          e.preventDefault();
          window.open(institute.website, '_blank', 'noopener,noreferrer');
        });
      }

      slider.appendChild(slide);
    });

    this.maxIndex = Math.max(0, this.institutes.length - this.itemsPerView);
    this.updateSliderPosition();
  }

  // Helper method to get short name for footer
  getShortName(fullName) {
    const shortNames = {
      "SSSIHL Alike Campus": "Alike Campus",
      "SSSIHL Dharwad Campus": "Dharwad Campus", 
      "SSSBPUC Mysuru": "PUC Mysuru",
      "SSSIHL Puttaparthi": "Puttaparthi Campus",
      "SSSMV Anantapur": "Medical College",
      "SSSIHMS Puttaparthi": "Super Specialty Hospital"
    };
    return shortNames[fullName] || fullName;
  }

  // Helper method to get location from name
  getLocationFromName(fullName) {
    if (fullName.includes('Alike')) return 'Alike, Karnataka';
    if (fullName.includes('Dharwad')) return 'Dharwad, Karnataka';
    if (fullName.includes('Mysuru')) return 'Mysuru, Karnataka';
    if (fullName.includes('Puttaparthi')) return 'Puttaparthi, AP';
    if (fullName.includes('Anantapur')) return 'Anantapur, AP';
    return 'India';
  }

  // Load sister institutes from API
  async loadSisterInstitutes() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    console.log('🗾 Sister Institutes: Loading from API...');
    
    try {
      const response = await fetch(`${this.apiBaseUrl}?endpoint=get-sister-institutes`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.institutes) {
        console.log('🚀 Sister Institutes: Successfully loaded', result.data.institutes.length, 'institutes');
        this.institutes = result.data.institutes;
      } else {
        console.warn('⚠️ Sister Institutes: API returned no data, using fallback');
        this.institutes = this.getFallbackData();
      }
      
    } catch (error) {
      console.error('❌ Sister Institutes: Failed to load from API:', error);
      this.institutes = this.getFallbackData();
    } finally {
      this.isLoading = false;
      this.createSlides();
      this.startAutoplay();
    }
  }
  
  // Fallback data if API fails
  getFallbackData() {
    return [
      {
        id: 1,
        name: 'Sri Sathya Sai Institute, Alike',
        location: 'Alike, Karnataka',
        description: 'A premier educational institution following the ideals of Bhagawan Sri Sathya Sai Baba.',
        image: 'https://github.com/Satyamurthi/mbw-Photos/blob/main/Sister%20Institutes/Alike.jpg?raw=true',
        website: '#',
        established: '1985',
        type: 'Higher Secondary School'
      },
      {
        id: 2,
        name: 'Sri Sathya Sai Institute, Dharwad',
        location: 'Dharwad, Karnataka', 
        description: 'Dedicated to providing quality education based on human values.',
        image: 'https://github.com/Satyamurthi/mbw-Photos/blob/main/Sister%20Institutes/Dharwad%202.jpg?raw=true',
        website: '#',
        established: '1990',
        type: 'Higher Secondary School'
      },
      {
        id: 3,
        name: 'Sri Sathya Sai School, Mysuru',
        location: 'Mysuru, Karnataka',
        description: 'Our main campus providing comprehensive education from primary to higher secondary.',
        image: 'https://github.com/Satyamurthi/mbw-Photos/blob/main/College%20Photos/College.jpg?raw=true',
        website: '#',
        established: '1957',
        type: 'School & PU College'
      }
    ];
  }

  setupEventListeners() {
    // Previous button - Updated ID to match HTML
    const prevBtn = document.getElementById('prev-sister-institutes');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.previousSlide();
      });
    }

    // Next button - Updated ID to match HTML
    const nextBtn = document.getElementById('next-sister-institutes');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextSlide();
      });
    }

    // Pause autoplay on hover
    const sliderWrapper = document.querySelector('[data-id="sister-institutes-slider-wrapper"]');
    if (sliderWrapper) {
      sliderWrapper.addEventListener('mouseenter', () => {
        this.stopAutoplay();
      });

      sliderWrapper.addEventListener('mouseleave', () => {
        this.startAutoplay();
      });
      
      // Add touch/swipe support
      this.setupTouchEvents(sliderWrapper);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.previousSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.nextSlide();
      }
    });
  }

  setupTouchEvents(element) {
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    element.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
      this.stopAutoplay();
    }, { passive: true });

    element.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = startX - currentX;
      const deltaY = startY - currentY;
      
      // Only handle horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
        e.preventDefault();
      }
    }, { passive: false });

    element.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const endX = e.changedTouches[0].clientX;
      const deltaX = startX - endX;
      
      // Minimum swipe distance
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          this.nextSlide(); // Swipe left = next
        } else {
          this.previousSlide(); // Swipe right = previous
        }
      }
      
      this.restartAutoplay();
    }, { passive: true });
  }

  setupResizeHandler() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.updateResponsiveSettings();
        this.maxIndex = Math.max(0, this.institutes.length - this.itemsPerView);
        this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
        this.updateSliderPosition();
      }, 250);
    });
  }

  previousSlide() {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.updateSliderPosition();
    this.restartAutoplay();
  }

  nextSlide() {
    this.currentIndex = Math.min(this.maxIndex, this.currentIndex + 1);
    this.updateSliderPosition();
    this.restartAutoplay();
  }

  updateSliderPosition() {
    const slider = document.querySelector('[data-id="sister-institutes-slider"]');
    if (!slider) return;

    const translateX = -(this.currentIndex * (100 / this.itemsPerView));
    slider.style.transform = `translateX(${translateX}%)`;

    // Update button states and dots
    this.updateButtonStates();
    this.updateDotsNavigation();
  }

  updateButtonStates() {
    const prevBtn = document.getElementById('prev-sister-institutes');
    const nextBtn = document.getElementById('next-sister-institutes');
    const sliderWrapper = document.querySelector('[data-id="sister-institutes-slider-wrapper"]');

    // Show/hide navigation arrows based on content
    const showNavigation = this.institutes.length > this.itemsPerView;
    
    if (prevBtn && nextBtn) {
      if (showNavigation) {
        prevBtn.style.opacity = this.currentIndex === 0 ? '0.6' : '1';
        nextBtn.style.opacity = this.currentIndex === this.maxIndex ? '0.6' : '1';
        prevBtn.classList.toggle('opacity-100', this.currentIndex > 0);
        nextBtn.classList.toggle('opacity-100', this.currentIndex < this.maxIndex);
      } else {
        prevBtn.style.opacity = '0';
        nextBtn.style.opacity = '0';
      }
    }
    
    // Show navigation on hover if there are multiple slides
    if (sliderWrapper && showNavigation) {
      sliderWrapper.addEventListener('mouseenter', () => {
        if (prevBtn) prevBtn.style.opacity = this.currentIndex === 0 ? '0.6' : '1';
        if (nextBtn) nextBtn.style.opacity = this.currentIndex === this.maxIndex ? '0.6' : '1';
      });
      
      sliderWrapper.addEventListener('mouseleave', () => {
        if (prevBtn) prevBtn.style.opacity = '0';
        if (nextBtn) nextBtn.style.opacity = '0';
      });
    }
  }
  
  // Create and update dots navigation
  updateDotsNavigation() {
    const dotsContainer = document.getElementById('sister-institutes-dots');
    if (!dotsContainer) return;
    
    const totalSlides = Math.max(1, this.institutes.length - this.itemsPerView + 1);
    
    // Only show dots if there are multiple slides
    if (totalSlides <= 1) {
      dotsContainer.innerHTML = '';
      dotsContainer.style.display = 'none';
      return;
    }
    
    dotsContainer.style.display = 'flex';
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = `w-2 h-2 rounded-full transition-all duration-300 ${
        i === this.currentIndex 
          ? 'bg-primary w-8' 
          : 'bg-gray-300 hover:bg-gray-400'
      }`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      
      dot.addEventListener('click', () => {
        this.currentIndex = i;
        this.updateSliderPosition();
        this.restartAutoplay();
      });
      
      dotsContainer.appendChild(dot);
    }
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      if (this.currentIndex < this.maxIndex) {
        this.nextSlide();
      } else {
        // Smooth loop back to beginning
        this.currentIndex = 0;
        this.updateSliderPosition();
      }
    }, this.autoplayDelay);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  restartAutoplay() {
    this.stopAutoplay();
    setTimeout(() => {
      this.startAutoplay();
    }, 1000);
  }

  // Method to refresh institutes data from API
  async refreshInstitutes() {
    console.log('🔄 Sister Institutes: Refreshing data from API...');
    await this.loadSisterInstitutes();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🏁 Sister Institutes: DOM loaded, initializing carousel...');
  
  try {
    window.sisterInstitutesCarousel = new SisterInstitutesCarousel();
    console.log('✅ Sister Institutes: Carousel initialized successfully');
  } catch (error) {
    console.error('❌ Sister Institutes: Failed to initialize carousel:', error);
    
    // Fallback: try again after a delay
    setTimeout(() => {
      try {
        console.log('🔄 Sister Institutes: Attempting fallback initialization...');
        window.sisterInstitutesCarousel = new SisterInstitutesCarousel();
        console.log('✅ Sister Institutes: Fallback initialization successful');
      } catch (fallbackError) {
        console.error('❌ Sister Institutes: Fallback initialization also failed:', fallbackError);
      }
    }, 1000);
  }
});
