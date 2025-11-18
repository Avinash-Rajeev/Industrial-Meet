// Smooth scroll
function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

// Dark mode toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
  body.classList.add('dark-mode');
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
} else {
  themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');

  if (body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    localStorage.setItem('theme', 'light');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
});



// Form handler with backend submission
const form = document.getElementById("registerForm");
const success = document.getElementById("successMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get form values
  const name = document.querySelector('input[placeholder="Full Name"]').value.trim();
  const email = document.querySelector('input[placeholder="Email"]').value.trim();
  const org = document.querySelector('input[placeholder="College/Organization"]').value.trim();

  // Validate form
  if (!name || !email || !org) {
    success.textContent = "❌ Please fill in all required fields.";
    success.style.color = "#e74c3c";
    return;
  }

  // Validate full name (at least 1 word, proper format)
  const nameRegex = /^[a-zA-Z]+(?:\s+[a-zA-Z]+)*$/;
  if (!nameRegex.test(name) || name.length < 3 || name.length > 50) {
    success.textContent = "❌ Please enter a valid full name (no numbers or special characters).";
    success.style.color = "#e74c3c";
    return;
  }

  // Validate email (proper format with valid domains)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    success.textContent = "❌ Please enter a valid email address.";
    success.style.color = "#e74c3c";
    return;
  }

  // Check for common fake email domains
  const fakeDomains = ['10minutemail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com', 'example.com'];
  const emailDomain = email.split('@')[1].toLowerCase();
  if (fakeDomains.includes(emailDomain)) {
    success.textContent = "❌ Please use a valid email address, not a temporary one.";
    success.style.color = "#e74c3c";
    return;
  }

  // Validate college/organization (reasonable length and format)
  const orgRegex = /^[a-zA-Z0-9\s&.,'-]+$/;
  if (!orgRegex.test(org) || org.length < 3 || org.length > 100) {
    success.textContent = "❌ Please enter a valid college or organization name.";
    success.style.color = "#e74c3c";
    return;
  }

  // Check for obviously fake organization names
  const fakeOrgs = ['test', 'fake', 'dummy', 'example', 'sample', 'abc', 'xyz', 'random', 'temp', 'temporary', 'demo', 'trial', 'mock', 'placeholder', 'none', 'n/a', 'na', 'unknown', 'anonymous', 'guest', 'user', 'admin', 'root', 'system', 'default', 'null', 'void', 'empty', 'blank', 'qwerty', 'asdf', '123'];

  // Check if organization contains any fake words
  if (fakeOrgs.some(fake => org.toLowerCase().includes(fake))) {
    success.textContent = "❌ Please enter a real college or organization name.";
    success.style.color = "#e74c3c";
    return;
  }

  // Check for suspicious patterns (all lowercase, all uppercase, repeating characters)
  if (org === org.toLowerCase() && org.length > 3 && !org.includes(' ')) {
    success.textContent = "❌ Please enter a properly formatted organization name.";
    success.style.color = "#e74c3c";
    return;
  }

  if (org === org.toUpperCase() && org.length > 3) {
    success.textContent = "❌ Please enter a properly formatted organization name.";
    success.style.color = "#e74c3c";
    return;
  }

  // Check for repeating characters (like "aaaaa")
  const repeatingChars = /(.)\1{3,}/;
  if (repeatingChars.test(org)) {
    success.textContent = "❌ Please enter a valid organization name.";
    success.style.color = "#e74c3c";
    return;
  }

  // Check for names that are too generic or short
  const genericNames = ['college', 'university', 'school', 'institute', 'academy', 'center', 'group', 'company', 'corp', 'ltd', 'inc'];
  if (genericNames.includes(org.toLowerCase()) || org.length < 5) {
    success.textContent = "❌ Please enter a complete and specific organization name.";
    success.style.color = "#e74c3c";
    return;
  }

  // Show loading state
  success.textContent = "⏳ Registering...";
  success.style.color = "#f39c12";

  try {
  // Try multiple possible backend URLs for different network conditions
    const backendUrls = [
      'http://localhost:5000/api/register',    // Localhost
      'http://127.0.0.1:5000/api/register'     // Loopback
    ];

    let response;
    let lastError;

    // Try each URL until one works
    for (const url of backendUrls) {
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: name,
            email: email,
            collegeOrOrganization: org
          })
        });

        // If we get a response (even an error response), break out of the loop
        if (response) {
          break;
        }
      } catch (error) {
        lastError = error;
        console.log(`Failed to connect to ${url}:`, error.message);
        continue;
      }
    }

    if (!response) {
      throw new Error('Unable to connect to any backend server');
    }

    const data = await response.json();

    if (response.ok) {
      success.textContent = "✅ Registration successful! Redirecting to registration form...";
      success.style.color = "#27ae60";
      form.reset();
      // Redirect to Google Form after successful database submission
      setTimeout(() => {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLSfY44xU-aSEH4bwyf_rCIa2Vuy70MO9-50K2HpChibGjA9hPw/viewform?usp=header', '_blank');
      }, 1000);
    } else {
      success.textContent = `❌ ${data.message || 'Registration failed. Please try again.'}`;
      success.style.color = "#e74c3c";
    }
  } catch (error) {
    console.error('Registration error:', error);
    success.textContent = "❌ Network error. Please check your connection and try again.";
    success.style.color = "#e74c3c";
  }
});

// Add fade-in animation on scroll with stagger
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, index * 150); // Stagger delay
    }
  });
}, observerOptions);

// Apply animations to sections
document.querySelectorAll('.section').forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(30px)';
  section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(section);
});

// Add stagger animation to cards
document.querySelectorAll('.card').forEach((card, index) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 100);
      }
    });
  }, observerOptions);

  cardObserver.observe(card);
});

// Add stagger animation to timeline items
document.querySelectorAll('.timeline li').forEach((item, index) => {
  item.style.opacity = '0';
  item.style.transform = 'translateX(-20px)';
  item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

  const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }, index * 150);
      }
    });
  }, observerOptions);

  timelineObserver.observe(item);
});

// Add enhanced hover effect to cards
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-10px) scale(1.02)';
    card.style.boxShadow = '0 15px 50px rgba(0, 0, 0, 0.2)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) scale(1)';
    card.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
  });
});
