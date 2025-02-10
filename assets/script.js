document.addEventListener("DOMContentLoaded", function () {
    // HERO SLIDER: Array of image paths
    const heroImages = [
        "assets/images/slider1.jpg",
        "assets/images/slider2.jpg",
        "assets/images/slider3.jpg"
    ];
    let currentImageIndex = 0;
    const heroSection = document.querySelector(".hero-section");

    // Function to change the hero background image with fade-in effect
    function changeHeroImage() {
        currentImageIndex = (currentImageIndex + 1) % heroImages.length;
        heroSection.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${heroImages[currentImageIndex]}')`;
        // Restart fade-in animation by forcing reflow
        heroSection.classList.remove("fade-in");
        void heroSection.offsetWidth;
        heroSection.classList.add("fade-in");
    }

    // Change hero image every 5 seconds
    setInterval(changeHeroImage, 5000);

    // Additional animations or scroll-triggered code can be added here
});
