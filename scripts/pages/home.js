/**
 * Home Page Functionality
 */                                                                                                                                                                                         
                                                                                                                                                                                            
export function initializeHome() {                                                                                                                                                          
  // Video initialization is now handled by dynamic-content.js
  initStatsCounters();
  initFacilitiesSlider();
  initSisterInstitutesSlider();
  initUpdateCards();
  initCampusLifeGallery();
}

function initStatsCounters() {
  const counters = document.querySelectorAll('.stats-counter');
  const speed = 200;

  const animateCounter = (el) => {
    const counter = el.querySelector('div[data-target]');
    const updateCount = () => {
      const target = +counter.getAttribute('data-target');
      const count = +counter.innerText;
      const increment = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + increment);
        setTimeout(updateCount, 15);
      } else {
        counter.innerText = target.toLocaleString();
      }
    };
    updateCount();
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => {
    observer.observe(counter);
  });
}

function initFacilitiesSlider() {
  const facilities = [
    {
      id: 'physics-lab',
      title: '🌈⃤ Physics Lab ⚛️',
      category: 'Physics Lab',
      description: 'Equipped with advanced apparatus for hands-on experiments. Students explore concepts through practical demonstrations.',
      images: [
        './assets/photos/DSC_4033.jpg',
        './assets/photos/DSC_4038.jpg'
      ]
    },
    {
      id: 'chemistry-lab',
      title: '🧪 Chemistry Lab 👨🏻‍🔬',
      category: 'Chemistry Lab',
      description: 'Designed for safe and effective chemical experiments. Students learn concepts with practical applications.',
      images: [
        './assets/photos/DSC_4038.jpg',
        './assets/photos/DSC_4033.jpg'
      ]
    },
    {
      id: 'biology-lab',
      title: '🌱 Biology Lab 🫁',
      category: 'Biology Lab',
      description: 'Offers modern tools for studying life sciences. Students perform dissections and observe microscopic life.',
      images: [
        './assets/photos/DSC_4015.jpg',
        './assets/photos/DSC_4006.jpg'
      ]
    },
    {
      id: 'computer-lab',
      title: '💻 Computer Science Lab 🌐',
      category: 'Computer Lab',
      description: 'Modern computing facilities with latest software and hardware for digital learning.',
      images: [
        './assets/photos/DSC_4006.jpg',
        './assets/photos/DSC_4015.jpg'
      ]
    },
    {
      id: 'library',
      title: '📚 Library 📖',
      category: 'Library',
      description: 'Extensive collection of books, journals, and digital resources for comprehensive learning.',
      images: [
        './assets/photos/DSC_4054.jpg',
        './assets/photos/DSC_4038.jpg'
      ]
    },
    {
      id: 'classrooms',
      title: '👨🏻‍🏫 Class Rooms 👩‍🏫',
      category: 'Classrooms',
      description: 'Modern, well-equipped classrooms designed for interactive and engaging learning experiences.',
      images: [
        './assets/photos/DSC_4054.jpg',
        './assets/photos/DSC_4015.jpg'
      ]
    }
  ];

  const facilitiesGrid = document.querySelector('[data-id="facilities-grid"]');
  if (!facilitiesGrid) return;

  if (facilitiesGrid.children.length > 0) {
    // Prefilled: just start image rotation
    facilities.forEach(facility => {
      startImageRotation(`slide-${facility.id}`, facility.images);
    });
    return;
  }

  facilitiesGrid.innerHTML = facilities.map(facility => `
    <div class="program-card bg-white rounded-lg overflow-hidden shadow-sm" data-id="facility-${facility.id}">
      <img id="slide-${facility.id}" src="${facility.images[0]}" class="w-full h-48 object-cover" alt="${facility.category}" data-id="facility-${facility.id}-image">
      <div class="p-6" data-id="facility-${facility.id}-content">
        <div class="flex items-center mb-4" data-id="facility-${facility.id}-tag">
          <span class="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">${facility.category}</span>
        </div>
        <h3 class="text-xl font-semibold mb-2" data-id="facility-${facility.id}-title">${facility.title}</h3>
        <p class="text-gray-600 mb-4" data-id="facility-${facility.id}-description">${facility.description}</p>
        <button class="w-full bg-primary text-white py-2 rounded-button hover:bg-primary/90 transition-colors" data-id="facility-${facility.id}-btn">Learn More</button>
      </div>
    </div>
  `).join('');

  // Start image rotation for each facility
  facilities.forEach(facility => {
    startImageRotation(`slide-${facility.id}`, facility.images);
  });
}

function startImageRotation(elementId, images) {
  let index = 0;
  setInterval(() => {
    const img = document.getElementById(elementId);
    if (img && images.length > 1) {
      index = (index + 1) % images.length;
      img.src = images[index];
    }
  }, 3000);
}

function initSisterInstitutesSlider() {
  const institutes = [
    {
      name: 'Alike',
      image: './assets/sister/Alike.jpg'
    },
    {
      name: 'Dharwad',
      image: './assets/sister/Dharwad-2.jpg'
    },
    {
      name: 'Mysuru',
      image: './assets/sister/College.jpg'
    }
  ];

  const slider = document.querySelector('[data-id="sister-institutes-slider"]');
  if (!slider) return;

  if (slider.children.length === 0) {
    // Duplicate institutes for infinite scroll effect
    const allInstitutes = [...institutes, ...institutes];
    slider.innerHTML = allInstitutes.map((institute, index) => `
      <div class="slide w-full md:w-1/2 lg:w-1/4 flex-shrink-0 px-3" data-id="institute-slide-${index}">
        <div class="relative group overflow-hidden rounded-lg">
          <img src="${institute.image}" alt="${institute.name}" class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" data-id="institute-${index}-image" />
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-center p-4" data-id="institute-${index}-overlay">
            <h3 class="text-white text-lg font-semibold mb-2" data-id="institute-${index}-name">${institute.name}</h3>
          </div>
        </div>
      </div>
    `).join('');
  }

  // Always initialize controls
  initSliderControls();
}

function initSliderControls() {
  const slider = document.querySelector(".activities-slider");
  const slides = document.querySelectorAll(".slide");
  const prevBtn = document.getElementById("prev-activities");
  const nextBtn = document.getElementById("next-activities");

  if (!slider || !slides.length || !prevBtn || !nextBtn) return;

  let currentSlide = 0;

  function getVisibleSlides() {
    const width = window.innerWidth;
    if (width >= 1024) return 4;
    if (width >= 640) return 2;
    return 1;
  }

  function updateSlider() {
    const visibleSlides = getVisibleSlides();
    const slideWidth = slides[0].offsetWidth + 24;
    const offset = currentSlide * slideWidth;
    slider.style.transform = `translateX(-${offset}px)`;
  }

  prevBtn.addEventListener("click", () => {
    const visibleSlides = getVisibleSlides();
    currentSlide = Math.max(currentSlide - visibleSlides, 0);
    updateSlider();
  });

  nextBtn.addEventListener("click", () => {
    const visibleSlides = getVisibleSlides();
    const maxSlide = Math.max(slides.length - visibleSlides, 0);
    currentSlide = Math.min(currentSlide + visibleSlides, maxSlide);
    updateSlider();
  });

  window.addEventListener("resize", updateSlider);
  updateSlider();

  // Auto-slide
  setInterval(() => {
    const visibleSlides = getVisibleSlides();
    const maxSlide = Math.max(slides.length - visibleSlides, 0);
    currentSlide = (currentSlide + visibleSlides) % (maxSlide + 1);
    updateSlider();
  }, 5000);
}

function initUpdateCards() {
  const grid = document.querySelector('[data-id="updates-grid"]');
  if (grid && grid.children.length > 0) return;
  const updates = [
    {
      type: 'Research',
      date: 'Feb 20, 2025',
      title: 'Breakthrough in Quantum Computing',
      description: 'Our research team has achieved a significant milestone in quantum computing, paving the way for future innovations.',
      videoSrc: 'https://github.com/Satyamurthi/mbw-Photos/blob/main/Baba%20Photo.png'
    },
    {
      type: 'Events',
      date: 'Feb 15, 2025',
      title: 'Spring Graduation Ceremony 2025',
      description: 'Join us in celebrating the achievements of our graduating class of 2025 at our annual ceremony.',
      videoSrc: 'https://your-video-url.com/event-video.mp4'
    },
    {
      type: 'Events',
      date: 'Feb 15, 2025',
      title: 'Spring Graduation Ceremony 2025',
      description: 'Join us in celebrating the achievements of our graduating class of 2025 at our annual ceremony.',
      videoSrc: 'https://your-video-url.com/event-video.mp4'
    },
    {
      type: 'Campus Life',
      date: 'Feb 10, 2025',
      title: 'New Sports Complex Opening',
      description: 'Experience our state-of-the-art sports facility designed to enhance student wellness and athletic performance.',
      videoSrc: 'https://your-video-url.com/sports-complex.mp4'
    }
  ];

  const updatesGrid = document.querySelector('[data-id="updates-grid"]');
  if (updatesGrid) {
    updatesGrid.innerHTML = updates.map((update, index) => `
      <div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow" data-id="update-card-${index}">
        <video class="w-full h-48 object-cover" controls autoplay muted loop data-id="update-${index}-video">
          <source src="${update.videoSrc}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <div class="p-6" data-id="update-${index}-content">
          <div class="flex items-center mb-4" data-id="update-${index}-meta">
            <span class="text-sm text-primary font-medium" data-id="update-${index}-type">${update.type}</span>
            <span class="mx-2">•</span>
            <span class="text-sm text-gray-500" data-id="update-${index}-date">${update.date}</span>
          </div>
          <h3 class="text-xl font-semibold mb-2" data-id="update-${index}-title">${update.title}</h3>
          <p class="text-gray-600 mb-4" data-id="update-${index}-description">${update.description}</p>
          <a href="#" class="text-primary font-medium hover:text-primary/80 transition-colors" data-id="update-${index}-link">Read More →</a>
        </div>
      </div>
    `).join('');
  }
}
            <span class="text-sm text-primary font-medium" data-id="update-${index}-type">${update.type}</span>
            <span class="mx-2">•</span>
            <span class="text-sm text-gray-500" data-id="update-${index}-date">${update.date}</span>
          </div>
          <h3 class="text-xl font-semibold mb-2" data-id="update-${index}-title">${update.title}</h3>
          <p class="text-gray-600 mb-4" data-id="update-${index}-description">${update.description}</p>
          <a href="#" class="text-primary font-medium hover:text-primary/80 transition-colors" data-id="update-${index}-link">Read More →</a>
        </div>
      </div>
    `).join('');
  }
}

function initCampusLifeGallery() {
  const campusImages = [
    {
      src: './assets/campus/campus3.jpg',
      alt: 'Campus View',
      title: 'Campus View'
    },
    {
      src: './assets/campus/campus4.jpg',
      alt: 'Campus Event',
      title: 'Campus Event'
    },
    {
      src: './assets/photos/DSC_4054.jpg',
      alt: 'Library',
      title: 'Library'
    },
    {
      src: './assets/photos/DSC_4038.jpg',
      alt: 'Lab',
      title: 'Lab'
    }
  ];

  const campusGrid = document.querySelector('[data-id="campus-life-grid"]');
  if (!campusGrid) return;
  if (campusGrid.children.length > 0) return;

  campusGrid.innerHTML = campusImages.map((image, index) => `
    <div class="relative group overflow-hidden rounded-lg" data-id="campus-image-${index}">
      <img src="${image.src}" alt="${image.alt}" class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110" data-id="campus-img-${index}">
      <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center" data-id="campus-overlay-${index}">
        <p class="text-white text-center px-4" data-id="campus-title-${index}">${image.title}</p>
      </div>
    </div>
  `).join('');
}
