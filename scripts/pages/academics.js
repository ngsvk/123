/**
 * Academics Page Functionality
 */                                                                                                                                                                                         
                                                                                                                                                                                            
export function initializeAcademics() {                                                                                                                                                     
  initAcademicPrograms();                                                                                                                                                                   
  initSubjects();
}

function initAcademicPrograms() {
  const programs = [
    {
      id: 'high-school',
      title: 'High School (8th - 10th Grade)',
      description: 'Foundation program focusing on core subjects and character development. Students develop strong academic fundamentals while exploring their interests and talents.',
      features: [
        'CBSE Curriculum',
        'Integrated Value Education',
        'Co-curricular Activities',
        'Individual Attention',
        'Character Building Programs'
      ],
      image: './assets/academics/high-school.jpg'
    },
    {
      id: 'pre-university',
      title: 'Pre-University College (11th - 12th Grade)',
      description: 'Advanced preparation for higher education with specialized streams. Students choose their career path while maintaining focus on moral and ethical development.',
      features: [
        'Science Stream (PCM, PCB)',
        'Commerce Stream',
        'Arts Stream',
        'Career Guidance',
        'Competitive Exam Preparation'
      ],
      image: './assets/academics/pre-university.jpg'
    }
  ];

  const programsGrid = document.querySelector('[data-id="programs-grid"]');
  if (programsGrid) {
    programsGrid.innerHTML = programs.map(program => `
      <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow" data-id="program-${program.id}">
        <img src="${program.image}" alt="${program.title}" class="w-full h-48 object-cover" data-id="program-${program.id}-image">
        <div class="p-8" data-id="program-${program.id}-content">
          <h3 class="text-2xl font-bold text-gray-900 mb-4" data-id="program-${program.id}-title">${program.title}</h3>
          <p class="text-gray-600 mb-6" data-id="program-${program.id}-description">${program.description}</p>
          <ul class="space-y-2 mb-6" data-id="program-${program.id}-features">
            ${program.features.map((feature, index) => `
              <li class="flex items-center text-gray-700" data-id="program-${program.id}-feature-${index}">
                <i class="ri-check-line text-primary mr-2"></i>
                ${feature}
              </li>
            `).join('')}
          </ul>
          <button class="w-full bg-primary text-white py-3 px-6 rounded-button hover:bg-primary/90 transition-colors font-semibold" data-id="program-${program.id}-btn">
            Learn More
          </button>
        </div>
      </div>
    `).join('');
  }
}

function initSubjects() {
  const subjects = [
    {
      name: 'Mathematics',
      icon: '🔢',
      description: 'Advanced mathematical concepts and problem-solving skills'
    },
    {
      name: 'Physics',
      icon: '⚛️',
      description: 'Understanding the fundamental laws of nature and universe'
    },
    {
      name: 'Chemistry',
      icon: '🧪',
      description: 'Exploring matter, its properties and chemical reactions'
    },
    {
      name: 'Biology',
      icon: '🌱',
      description: 'Study of living organisms and life processes'
    },
    {
      name: 'Computer Science',
      icon: '💻',
      description: 'Programming, algorithms and digital technology'
    },
    {
      name: 'English',
      icon: '📚',
      description: 'Language skills, literature and communication'
    },
    {
      name: 'Hindi',
      icon: '🇮🇳',
      description: 'National language proficiency and literature'
    },
    {
      name: 'Kannada',
      icon: '🏛️',
      description: 'Regional language and cultural studies'
    },
    {
      name: 'Social Studies',
      icon: '🌍',
      description: 'History, geography, civics and economics'
    },
    {
      name: 'Commerce',
      icon: '💼',
      description: 'Business studies, accounting and economics'
    },
    {
      name: 'Psychology',
      icon: '🧠',
      description: 'Understanding human behavior and mental processes'
    },
    {
      name: 'Value Education',
      icon: '🕉️',
      description: 'Moral and spiritual development based on universal values'
    }
  ];

  const subjectsGrid = document.querySelector('[data-id="subjects-grid"]');
  if (subjectsGrid) {
    subjectsGrid.innerHTML = subjects.map((subject, index) => `
      <div class="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow" data-id="subject-${index}">
        <div class="text-center mb-4" data-id="subject-${index}-icon">
          <span class="text-4xl" data-id="subject-${index}-emoji">${subject.icon}</span>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3 text-center" data-id="subject-${index}-name">${subject.name}</h3>
        <p class="text-gray-600 text-center" data-id="subject-${index}-description">${subject.description}</p>
      </div>
    `).join('');
  }
}
