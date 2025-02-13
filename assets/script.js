document.addEventListener("DOMContentLoaded", function () {
    // Define slider images with relative paths
    const sliderImages = [
        'assets/images/slider1.jpg',
        'assets/images/slider5.jpg',
        'assets/images/slider4.jpg',
        'assets/images/slider2.jpg',
        'assets/images/slider3.jpg',
        'assets/images/slider6.jpg'
    ];

    const sliderContainer = document.getElementById('slider');
    const sliderButtonsContainer = document.getElementById('slider-buttons');
    let currentIndex = 0;
    const slideInterval = 5000; // 5 seconds

    // Dynamically create slider slides and buttons
    sliderImages.forEach((image, index) => {
        // Create slide element
        const slide = document.createElement('div');
        slide.classList.add('slide');
        if (index === 0) slide.classList.add('active');
        slide.style.backgroundImage = `url(${image})`;
        sliderContainer.appendChild(slide);

        // Create corresponding navigation button
        const button = document.createElement('button');
        button.setAttribute('data-index', index);
        sliderButtonsContainer.appendChild(button);
    });

    const slides = document.querySelectorAll('.slide');
    const sliderButtons = document.querySelectorAll('.slider-buttons button');

    // Function to display a slide by index
    function showSlide(index) {
        slides.forEach((slide, idx) => {
            slide.classList.toggle('active', idx === index);
        });
        currentIndex = index;
    }

    // Automatic slide change
    let timer = setInterval(() => {
        let nextIndex = (currentIndex + 1) % slides.length;
        showSlide(nextIndex);
    }, slideInterval);

    // Manual slide navigation via buttons
    sliderButtons.forEach(button => {
        button.addEventListener('click', () => {
            clearInterval(timer);
            const index = parseInt(button.getAttribute('data-index'));
            showSlide(index);
            timer = setInterval(() => {
                let nextIndex = (currentIndex + 1) % slides.length;
                showSlide(nextIndex);
            }, slideInterval);
        });
    });

    // Mobile Navigation Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    menuToggle.addEventListener('click', () => {
        navList.classList.toggle('active');
    });
});
