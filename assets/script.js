document.addEventListener("DOMContentLoaded", function () {
    // HERO SLIDER: Array of image paths
    const heroImages = [
        "assets/images/slider1.jpg",
        "assets/images/slider2.jpg",
        "assets/images/slider3.jpg"
    ];
    let currentImageIndex = 0;
    const heroSection = document.querySelector(".hero-section");

    // Preload slider images for faster reload
    heroImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });

    // Function to change the hero background image without a fade overlay
    function changeHeroImage(index) {
        currentImageIndex = index;
        if (currentImageIndex < 0) {
            currentImageIndex = heroImages.length - 1;
        } else if (currentImageIndex >= heroImages.length) {
            currentImageIndex = 0;
        }
        heroSection.style.backgroundImage = `url('${heroImages[currentImageIndex]}')`;
        // Restart fade-in animation by forcing reflow
        heroSection.classList.remove("fade-in");
        void heroSection.offsetWidth;
        heroSection.classList.add("fade-in");
    }

    function nextHeroImage() {
        changeHeroImage(currentImageIndex + 1);
    }

    function prevHeroImage() {
        changeHeroImage(currentImageIndex - 1);
    }

    // Automatic slider: change every 5 seconds
    let sliderInterval = setInterval(nextHeroImage, 5000);

    // Slider control buttons
    const nextBtn = document.querySelector(".next-btn");
    const prevBtn = document.querySelector(".prev-btn");

    nextBtn.addEventListener("click", function () {
        clearInterval(sliderInterval);
        nextHeroImage();
        sliderInterval = setInterval(nextHeroImage, 5000);
    });

    prevBtn.addEventListener("click", function () {
        clearInterval(sliderInterval);
        prevHeroImage();
        sliderInterval = setInterval(nextHeroImage, 5000);
    });
});
