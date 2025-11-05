function initLightbox() {
  const gallery = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".close");
  const prevBtn = document.querySelector(".prev");
  const nextBtn = document.querySelector(".next");

  let imageLinks = [];
  let currentIndex = 0;

  // Refresh imageLinks once gallery is loaded
  imageLinks = Array.from(document.querySelectorAll("#gallery a"));

  function showImage(index) {
    const link = imageLinks[index];
    const imgSrc = link.getAttribute("href");
    lightboxImg.src = imgSrc;
    currentIndex = index;
    lightbox.style.display = "flex";
  }

  // 🎯 Event delegation: capture clicks on any <a> inside #gallery
  gallery.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    e.preventDefault(); // stop navigation

    const index = imageLinks.indexOf(link);
    if (index !== -1) showImage(index);
  });

  closeBtn.addEventListener("click", () => {
    lightbox.style.display = "none";
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + imageLinks.length) % imageLinks.length;
    showImage(currentIndex);
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % imageLinks.length;
    showImage(currentIndex);
  });

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.style.display = "none";
  });

  document.addEventListener("keydown", (e) => {
    if (lightbox.style.display === "flex") {
      if (e.key === "ArrowRight") nextBtn.click();
      if (e.key === "ArrowLeft") prevBtn.click();
      if (e.key === "Escape") closeBtn.click();
    }
  });
}
