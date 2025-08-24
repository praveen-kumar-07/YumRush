// Global variables
let cart = {};
let cartCount = 0;
let currentSlide = 0;
const totalSlides = 6;
let autoSlideInterval;

// Create menu item HTML
function createMenuItemHTML(item, section = 'menu') {
    const className = section === 'popular' ? 'carousel-item' : 'menu-item';
    const infoClassName = section === 'popular' ? 'item-info' : 'menu-info';
    
    return `
        <div class="${className}" data-item-id="${item.id}">
            <img src="${item.image}" alt="${item.name}">
            <div class="${infoClassName}">
                <h3>${item.name}</h3>
                <div class="rating">
                    <span class="rating-star">★ ${item.rating}</span>
                    <span class="rating-time">${item.time}</span>
                </div>
                <div class="price-quantity-container">
                    <div class="price">${item.price}</div>
                    <div class="quantity-control">
                        <button class="quantity-btn minus-btn">-</button>
                        <span class="quantity-display">0</span>
                        <button class="quantity-btn plus-btn">+</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Render menu items
function renderMenuItems() {
    const menuGrid = document.querySelector('.menu-grid');
    const carouselTrack = document.querySelector('.carousel-track');
    
    if (menuGrid && dishesData.homeKitchen) {
        menuGrid.innerHTML = dishesData.homeKitchen.map(item => createMenuItemHTML(item, 'menu')).join('');
    }
    
    if (carouselTrack && dishesData.popularItems) {
        carouselTrack.innerHTML = dishesData.popularItems.map(item => createMenuItemHTML(item, 'popular')).join('');
    }
}

// Update cart count display
function updateCartCount() {
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) cartCountEl.textContent = cartCount;
}

// Handle quantity changes
function handleQuantityChange(itemId, action) {
    const allInstances = document.querySelectorAll(`[data-item-id="${itemId}"]`);
    
    if (allInstances.length === 0) return;
    
    // Get the current quantity from the cart object (single source of truth)
    let currentQuantity = cart[itemId] || 0;
    
    // Update the quantity based on action
    if (action === 'increase') {
        currentQuantity++;
        cartCount++;
    } else if (action === 'decrease' && currentQuantity > 0) {
        currentQuantity--;
        cartCount--;
    }
    
    // Update the cart object
    cart[itemId] = currentQuantity;
    
    // Update ALL instances to show the same quantity
    allInstances.forEach(instance => {
        const quantityDisplay = instance.querySelector('.quantity-display');
        quantityDisplay.textContent = currentQuantity;
    });
    
    updateCartCount();
}

// Add event listeners using event delegation
function addEventListeners() {
    document.addEventListener('click', (e) => {
        // Handle quantity buttons
        if (e.target.classList.contains('plus-btn')) {
            const itemId = e.target.closest('[data-item-id]').dataset.itemId;
            handleQuantityChange(itemId, 'increase');
        }
        
        if (e.target.classList.contains('minus-btn')) {
            const itemId = e.target.closest('[data-item-id]').dataset.itemId;
            handleQuantityChange(itemId, 'decrease');
        }
        
        // Handle carousel buttons
        if (e.target.id === 'nextBtn' || e.target.closest('#nextBtn')) {
            stopAutoSlide();
            nextSlide();
            startAutoSlide();
        }
        
        if (e.target.id === 'prevBtn' || e.target.closest('#prevBtn')) {
            stopAutoSlide();
            prevSlide();
            startAutoSlide();
        }
        
        // Handle modal
        if (e.target.id === 'requestBtn') openModal();
        if (e.target.id === 'cancelBtn' || e.target.id === 'closeModal' || e.target.id === 'modalCancelBtn') closeModal();
        
        // Handle video - FIXED: Added proper event handling for video and play button
        if (e.target.id === 'mainVideo') {
            toggleVideo();
        }
        
        // Handle play button click - FIXED: Added specific handling for play button
        if (e.target.id === 'playBtn' || e.target.closest('#playBtn')) {
            e.preventDefault();
            e.stopPropagation();
            toggleVideo();
        }
        
        
        // Handle add to cart
        if (e.target.classList.contains('add-btn')) {
            e.target.style.transform = 'scale(0.9)';
            e.target.style.backgroundColor = '#28a745';
            e.target.textContent = '✓';
            setTimeout(() => {
                e.target.style.transform = 'scale(1)';
                e.target.style.backgroundColor = '';
                e.target.textContent = '+';
            }, 1000);
        }
    });
    
    // Handle navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// Carousel functions
function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    if (track) {
        const itemWidth = 100 / 3;
        track.style.transform = `translateX(-${currentSlide * itemWidth}%)`;
    }
}

function nextSlide() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    currentSlide++;
    track.style.transition = 'transform 0.5s ease-in-out';
    updateCarousel();
    
    if (currentSlide >= totalSlides + 3) {
        setTimeout(() => {
            track.style.transition = 'none';
            currentSlide = 3;
            updateCarousel();
        }, 500);
    }
}

function prevSlide() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    currentSlide--;
    track.style.transition = 'transform 0.5s ease-in-out';
    updateCarousel();
    
    if (currentSlide < 3) {
        setTimeout(() => {
            track.style.transition = 'none';
            currentSlide = totalSlides + 2;
            updateCarousel();
        }, 500);
    }
}

function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(nextSlide, 3000);
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

function initCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;
    
    const items = track.querySelectorAll('.carousel-item');
    
    // Clone items for seamless loop
    for (let i = 0; i < 3; i++) {
        if (items[i]) track.appendChild(items[i].cloneNode(true));
    }
    
    for (let i = totalSlides - 3; i < totalSlides && i >= 0; i++) {
        if (items[i]) track.insertBefore(items[i].cloneNode(true), track.firstChild);
    }
    
    currentSlide = 3;
    updateCarousel();
    startAutoSlide();
    
    // Pause on hover
    const carousel = document.querySelector('.carousel-container');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoSlide);
        carousel.addEventListener('mouseleave', startAutoSlide);
    }
}

// Modal functions
function openModal() {
    const modal = document.getElementById('requestModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('requestModal');
    const form = document.getElementById('requestForm');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (form) form.reset();
    }
}

// Video functions - FIXED: Improved video toggle functionality
function toggleVideo() {
    const video = document.getElementById('mainVideo');
    const overlay = document.getElementById('videoOverlay');
    const playBtn = document.getElementById('playBtn');
    
    if (!video) {
        console.error('Video element not found');
        return;
    }
    
    if (video.paused) {
        // Play the video
        video.play().then(() => {
            console.log('Video started playing');
            if (overlay) overlay.style.display = 'none';
        }).catch(error => {
            console.error('Error playing video:', error);
        });
    } else {
        // Pause the video
        video.pause();
        console.log('Video paused');
        if (overlay) overlay.style.display = 'flex';
    }
}


// CRUD operations for dishes
function addDish(section, dishData) {
    if (dishesData[section]) {
        dishesData[section].push(dishData);
        renderMenuItems();
    }
}

function removeDish(section, dishId) {
    if (dishesData[section]) {
        dishesData[section] = dishesData[section].filter(dish => dish.id !== dishId);
        renderMenuItems();
    }
}

function updateDish(section, dishId, updatedData) {
    if (dishesData[section]) {
        const dishIndex = dishesData[section].findIndex(dish => dish.id === dishId);
        if (dishIndex !== -1) {
            dishesData[section][dishIndex] = { ...dishesData[section][dishIndex], ...updatedData };
            renderMenuItems();
        }
    }
}

function getDishById(dishId) {
    for (const section in dishesData) {
        const dish = dishesData[section].find(item => item.id == dishId);
        if (dish) return dish;
    }
    return null;
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    renderMenuItems();
    addEventListeners();
    initCarousel();
    
    // Handle form submission
    const form = document.getElementById('requestForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const dishData = {
                dishName: formData.get('dishName'),
                description: formData.get('description'),
                spiceLevel: formData.get('spiceLevel'),
                customerName: formData.get('customerName'),
                customerEmail: formData.get('customerEmail')
            };
            console.log('Dish Request:', dishData);
            alert('Your dish request has been submitted successfully!');
            closeModal();
        });
    }
    
    // Handle video events - FIXED: Improved video event handling
    const video = document.getElementById('mainVideo');
    const overlay = document.getElementById('videoOverlay');
    
    if (video) {
        // When video ends, show the overlay
        video.addEventListener('ended', () => {
            console.log('Video ended');
            if (overlay) overlay.style.display = 'flex';
        });
        
        // When video is paused, show the overlay
        video.addEventListener('pause', () => {
            console.log('Video paused');
            if (overlay && !video.ended) overlay.style.display = 'flex';
        });
        
        // When video starts playing, hide the overlay
        video.addEventListener('play', () => {
            console.log('Video playing');
            if (overlay) overlay.style.display = 'none';
        });
        
        // Handle video loading
        video.addEventListener('loadeddata', () => {
            console.log('Video loaded');
            if (overlay) overlay.style.display = 'flex';
        });
        
        // Handle video errors
        video.addEventListener('error', (e) => {
            console.error('Video error:', e);
        });
    }
    
    // Handle modal close on outside click
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('requestModal');
        if (event.target === modal) closeModal();
    });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { dishesData, createMenuItemHTML, renderMenuItems, addDish, removeDish, updateDish, getDishById };
}