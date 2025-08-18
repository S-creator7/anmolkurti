# Website Responsiveness Improvement Plan

## Current State Analysis
- **Minimal responsive design**: Only basic media queries for mobile (max-width: 640px, 768px)
- **Tailwind configured**: But lacks comprehensive responsive utilities
- **Components need updates**: Multiple components across frontend and admin panels
- **Missing mobile navigation**: No hamburger menu or mobile-optimized navigation

## Implementation Strategy

### Phase 1: Foundation Setup
1. **Responsive CSS Utilities**
   - Create comprehensive responsive classes
   - Mobile-first approach with breakpoints: sm, md, lg, xl
   - Touch-friendly interface elements

2. **Tailwind Configuration Enhancement**
   - Add responsive spacing utilities
   - Configure responsive typography
   - Set up responsive grid systems

### Phase 2: Component Updates
1. **Frontend Components**
   - Navbar: Responsive navigation with hamburger menu
   - Product cards: Responsive grid layouts
   - Forms: Mobile<thinking>
The user has confirmed to proceed with the task of improving the overall responsiveness of the website. I will now create a plan to implement responsive design improvements across the relevant components and pages.

The plan will include:
1. Enhancing existing media queries in the CSS files.
2. Utilizing Tailwind CSS responsive utilities for better layout management.
3. Ensuring that all components and pages are optimized for mobile, tablet, and desktop views.
4. Testing the responsiveness after implementing the changes.

I will start by updating the `index.css` file to enhance the media queries and then apply responsive design principles to the relevant components and pages.
</thinking>

<edit_file>
<path>frontend/src/index.css</path>
<content>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Prata&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary-color: #ff69b4;    /* Hot Pink */
  --primary-dark: #ff1493;     /* Deep Pink */
  --primary-light: #ffb6c1;    /* Light Pink */
  --accent-color: #ff007f;     /* Bright Pink */
  --background: #fdfcfe;       /* Very soft pink-white */
  --surface: #ffffff;          /* Pure white for cards */
  --text-dark: #2d1b35;        /* Deep purple-pink */
  --text-medium: #64748b;      /* Slate gray */
  --text-light: #ffffff;       /* White */
  --border-light: #f1f5f9;     /* Very light border */
  --shadow-soft: rgba(255, 105, 180, 0.08);
  --shadow-medium: rgba(255, 105, 180, 0.12);
  --shadow-strong: rgba(255, 105, 180, 0.16);
}

/* Global text selection styling - soft pink theme */
::selection {
  background-color: rgba(255, 182, 193, 0.3); /* Light pink with transparency */
  color: var(--text-dark);
}

::-moz-selection {
  background-color: rgba(255, 182, 193, 0.3); /* Light pink with transparency */
  color: var(--text-dark);
}

* {
  font-family: 'Outfit', sans-serif;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

body {
  background-color: var(--background);
  color: var(--text-dark);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Remove harsh borders globally */
* {
  border-color: var(--border-light);
}

/* Enhanced Card Styles */
.card {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  box-shadow: 0 2px 15px var(--shadow-soft);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 35px var(--shadow-medium);
  border-color: rgba(255, 105, 180, 0.2);
}

/* Modern Button Styles */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
  border: none;
  color: var(--text-light);
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(255, 105, 180, 0.4);
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--accent-color) 100%);
}

.btn-secondary {
  background: var(--surface);
  border: 1px solid var(--border-light);
  color: var(--text-dark);
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px var(--shadow-soft);
}

.btn-secondary:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px var(--shadow-medium);
}

/* Enhanced Input Fields */
input, select, textarea {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px var(--shadow-soft);
}

input:focus, select:focus, textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1), 0 4px 15px var(--shadow-medium);
  outline: none;
  transform: translateY(-1px);
}

/* Modern Links */
a {
  color: var(--text-dark);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

a:hover {
  color: var(--primary-color);
}

/* Enhanced Navigation */
.nav-link {
  position: relative;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-link:hover {
  background: rgba(255, 105, 180, 0.05);
  color: var(--primary-color);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--primary-color);
  border-radius: 1px;
}

/* Product Grid */
.product-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

/* Modern Shadows */
.shadow-card {
  box-shadow: 0 2px 15px var(--shadow-soft);
}

.shadow-card-hover {
  box-shadow: 0 8px 35px var(--shadow-medium);
}

.shadow-glow {
  box-shadow: 0 0 20px rgba(255, 105, 180, 0.3);
}

/* Loading Animations */
.animate-pulse-soft {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

/* Smooth Fade In */
.fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Filter Panel Enhancements */
.filter-panel {
  background: var(--surface);
  border-radius: 1rem;
  box-shadow: 0 4px 25px var(--shadow-soft);
  border: 1px solid var(--border-light);
}

/* Modern Checkboxes and Radio buttons - Only for forms that don't use custom designs */
input[type="checkbox"]:not(.sr-only), input[type="radio"]:not(.sr-only) {
  appearance: none;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid var(--border-light);
  border-radius: 0.375rem;
  background: var(--surface);
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

input[type="radio"]:not(.sr-only) {
  border-radius: 50%;
}

input[type="checkbox"]:not(.sr-only):checked, input[type="radio"]:not(.sr-only):checked {
  background: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
}

input[type="checkbox"]:not(.sr-only):checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
}

input[type="radio"]:not(.sr-only):checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

/* Modern Modal */
.modal-backdrop {
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--surface);
  border-radius: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border-light);
}

/* Responsive Design Helpers */
@media (max-width: 640px) {
  .card {
    border-radius: 0.75rem;
  }
  
  .btn-primary, .btn-secondary {
    padding: 0.625rem 1.25rem;
    border-radius: 0.625rem;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

/* Utility Classes */
.glass-effect {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.gradient-text {
  background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Remove scroll bar styling for cleaner look */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--border-light);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--primary-light);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* Splash Screen Styles */
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

.expanding-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: var(--primary-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  animation: expandCircle 2s cubic-bezier(0.4, 0, 0.2, 1) 1s forwards; /* Delayed start, slower animation */
}

.splash-logo {
  position: relative;
  width: 300px;
  height: auto;
  z-index: 10000;
  opacity: 0;
  padding: 2rem;
  background: var(--primary-color) !important;
  border-radius: 50%;
  box-shadow: 0 0 40px rgba(255, 105, 180, 0.3);
  animation: fadeInLogo 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards,
             glowPulse 2s ease-in-out infinite;
}

@keyframes expandCircle {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
  }
  20% {
    opacity: 1;
    width: 50vmax;
    height: 50vmax;
  }
  100% {
    width: 300vmax;
    height: 300vmax;
    opacity: 1;
  }
}

@keyframes fadeInLogo {
  0% {
    opacity: 0;
    transform: scale(0.9) rotate(-5deg);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1) rotate(3deg);
  }
  100% { 
    opacity: 1;
    transform: scale(1) rotate(0);
  }
} 

@keyframes glowPulse {
  0% {
    box-shadow: 0 0 40px rgba(255, 105, 180, 0.3);
  }
  50% {
    box-shadow: 0 0 60px rgba(255, 105, 180, 0.5);
  }
  100% {
    box-shadow: 0 0 40px rgba(255, 105, 180, 0.3);
  }
}
