// Animated Statistics Counter
console.log('📊 Animated Stats: Script loaded successfully');

class AnimatedStats {
  constructor() {
    this.counters = [];
    this.animationStarted = false;
    this.init();
  }

  init() {
    console.log('📊 Animated Stats: Initializing statistics animation system');
    this.loadFromAdmin(); // Load admin data first
    this.setupCounters();
    this.setupScrollObserver();
    this.setupStorageListener(); // Listen for admin updates
    console.log('✅ Animated Stats: Initialization complete with', this.counters.length, 'counters');
  }

  setupCounters() {
    // Find all stat counters
    const statElements = document.querySelectorAll('.stats-counter [data-target]');
    
    console.log('🔍 Animated Stats: Found', statElements.length, 'stat elements');
    
    statElements.forEach((element, index) => {
      const target = parseInt(element.getAttribute('data-target'));
      console.log(`💯 Animated Stats: Counter ${index + 1}: target=${target}, element:`, element);
      
      this.counters.push({
        element: element,
        target: target,
        current: 0
      });
    });
  }
  
  ensureStatsVisible() {
    const statsCounters = document.querySelectorAll('.stats-counter');
    console.log('👁️ Animated Stats: Making', statsCounters.length, 'stats visible');
    
    statsCounters.forEach(counter => {
      counter.classList.add('visible');
      counter.style.opacity = '1';
      counter.style.transform = 'translateY(0)';
    });
  }

  setupScrollObserver() {
    // Make sure stats are visible first
    this.ensureStatsVisible();
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.animationStarted) {
            console.log('⚡ Animated Stats: Statistics section in view, starting animation...');
            this.animationStarted = true;
            // Reset all counters to 0 first
            this.counters.forEach(counter => {
              counter.element.textContent = '0';
            });
            this.startAnimation();
          }
        });
      }, { threshold: 0.1 }); // Lower threshold to trigger earlier

      const statsSection = document.querySelector('[data-id="stats-section"]');
      if (statsSection) {
        observer.observe(statsSection);
      }
    } else {
      // Fallback for browsers without IntersectionObserver
      window.addEventListener('scroll', () => {
        const statsSection = document.querySelector('[data-id="stats-section"]');
        if (statsSection && !this.animationStarted) {
          const rect = statsSection.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            this.animationStarted = true;
            this.startAnimation();
          }
        }
      });
    }
  }

  startAnimation() {
    console.log('🎨 Animated Stats: Starting animation for', this.counters.length, 'counters');
    
    this.counters.forEach((counter, index) => {
      // Add delay between counters for staggered effect
      setTimeout(() => {
        console.log(`🎥 Animated Stats: Animating counter ${index + 1} to ${counter.target}`);
        this.animateCounter(counter);
      }, index * 200);
    });
  }

  animateCounter(counter) {
    const duration = 2500; // 2.5 seconds for smoother animation
    const steps = 100; // More steps for ultra-smooth animation
    const stepDuration = duration / steps;
    
    let step = 0;
    
    // Add pulsing effect during animation
    counter.element.parentElement.classList.add('animating');
    
    // Use easing function for more natural animation
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easedProgress = easeOutQuart(progress);
      
      counter.current = Math.min(counter.target, Math.floor(counter.target * easedProgress));
      
      // Format number with commas and special effects
      const formattedNumber = this.formatNumber(counter.current, counter.target);
      counter.element.textContent = formattedNumber;
      
      // Add subtle scale effect during counting
      const scaleEffect = 1 + (Math.sin(progress * Math.PI) * 0.05);
      counter.element.style.transform = `scale(${scaleEffect})`;

      if (step >= steps || counter.current >= counter.target) {
        clearInterval(timer);
        counter.element.parentElement.classList.remove('animating');
        
        // Ensure final number is exact
        counter.element.textContent = this.formatNumber(counter.target, counter.target);
        
        // Final celebration animation
        counter.element.style.transform = 'scale(1.15)';
        counter.element.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        
        setTimeout(() => {
          counter.element.style.transform = 'scale(1)';
          counter.element.style.transition = 'all 0.3s ease';
          
          // Add glow effect
          counter.element.classList.add('completed');
        }, 200);
      }
    }, stepDuration);
  }

  formatNumber(current, target) {
    // Add special formatting based on the number
    if (target >= 1000) {
      return current.toLocaleString();
    } else if (target === 100) {
      return current + '%';
    } else {
      return current.toString();
    }
  }

  // Method to restart animation (for admin editing)
  restart() {
    this.animationStarted = false;
    
    // Check for updated data from admin
    this.loadFromAdmin();
    
    this.counters.forEach(counter => {
      counter.current = 0;
      counter.element.textContent = '0';
      counter.element.style.transform = 'scale(1)';
      counter.element.style.transition = '';
    });
    
    // Start animation after a brief delay
    setTimeout(() => {
      this.startAnimation();
    }, 500);
  }

  // Load statistics from admin localStorage
  loadFromAdmin() {
    try {
      const homepageData = localStorage.getItem('sssbpuc_homepage');
      if (homepageData) {
        const data = JSON.parse(homepageData);
        if (data.statistics) {
          this.updateStatisticsFromData(data.statistics);
        }
      }
    } catch (error) {
      console.log('Could not load admin statistics:', error);
    }
  }

  // Update statistics from admin data
  updateStatisticsFromData(statisticsData) {
    if (!statisticsData.items) return;

    // Update title and subtitle
    const titleEl = document.querySelector('[data-id="stats-title"]');
    const subtitleEl = document.querySelector('[data-id="stats-subtitle"]');
    
    if (titleEl && statisticsData.title) {
      titleEl.textContent = statisticsData.title;
    }
    if (subtitleEl && statisticsData.subtitle) {
      subtitleEl.textContent = statisticsData.subtitle;
    }

    // Update individual statistics - map to correct data-id attributes
    const statMapping = ['students', 'faculty', 'programs', 'passing'];
    
    statisticsData.items.forEach((stat, index) => {
      const statName = statMapping[index];
      if (!statName) return;
      
      const statElement = document.querySelector(`[data-id="stat-${statName}-number"]`);
      const labelElement = document.querySelector(`[data-id="stat-${statName}-label"]`);
      
      console.log(`📊 Animated Stats: Updating stat ${index} (${statName}): ${stat.number}`);
      
      if (statElement) {
        statElement.setAttribute('data-target', stat.number);
        
        // Update counter object
        const counter = this.counters[index];
        if (counter) {
          counter.target = parseInt(stat.number);
        }
      } else {
        console.warn(`⚠️ Animated Stats: Could not find stat element for ${statName}`);
      }
      
      if (labelElement) {
        labelElement.textContent = stat.label;
      } else {
        console.warn(`⚠️ Animated Stats: Could not find label element for ${statName}`);
      }
    });
  }

  // Setup listener for admin updates
  setupStorageListener() {
    // Listen for changes from admin panel
    window.addEventListener('storage', (e) => {
      if (e.key === 'sssbpuc_homepage') {
        this.loadFromAdmin();
        this.restart();
      }
    });

    // Also listen for updates from same tab (admin panel)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      const event = new CustomEvent('localStorageUpdate', {
        detail: { key, value }
      });
      window.dispatchEvent(event);
      return originalSetItem.apply(this, arguments);
    };

    window.addEventListener('localStorageUpdate', (e) => {
      if (e.detail.key === 'sssbpuc_homepage') {
        setTimeout(() => {
          this.loadFromAdmin();
          this.restart();
        }, 100);
      }
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('🏁 Animated Stats: DOM loaded, initializing statistics animation...');
  
  try {
    window.animatedStats = new AnimatedStats();
    console.log('✅ Animated Stats: Successfully initialized and ready for animations');
    
    // Add a manual trigger for testing
    window.triggerStatsAnimation = function() {
      console.log('🚀 Manual Stats Animation Trigger');
      if (window.animatedStats) {
        // Reset all counters to 0 first
        window.animatedStats.counters.forEach(counter => {
          counter.element.textContent = '0';
        });
        window.animatedStats.animationStarted = false;
        window.animatedStats.startAnimation();
      }
    };
    
    // Auto-trigger after a short delay to ensure visibility
    setTimeout(() => {
      if (window.animatedStats && !window.animatedStats.animationStarted) {
        console.log('🔄 Auto-triggering stats animation after delay');
        window.animatedStats.startAnimation();
      }
    }, 2000);
    
  } catch (error) {
    console.error('❌ Animated Stats: Failed to initialize:', error);
  }
});
