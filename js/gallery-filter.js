/**
 * Gallery Filter, Rendering, and Pagination System
 * - CSV-backed image gallery
 * - Country filtering
 * - Responsive pagination by portrait-equivalent units
 */

// ============================================================================
// State & DOM
// ============================================================================

let images = [];
let filteredImages = [];
let pages = [];
let currentPageIndex = 0;

const galleryEl = window.galleryEl || document.getElementById("gallery");
const filterBarEl = document.getElementById("countryFilterBar");
const CSV_PATH = window.CSV_PATH || "image_metadata.csv";

// Pagination UI
const prevBtn = document.getElementById("prevPage");
const nextBtn = document.getElementById("nextPage");
const pageIndicator = document.getElementById("pageIndicator");

// ============================================================================
// Pagination Rules
// ============================================================================

function getPageCapacity() {
    // Mobile vs desktop breakpoint
    return window.innerWidth < 768 ? 12 : 14;
}

function getImageWeight(img) {
    // Landscape / horizontal images count as 2 portraits
    return img.orientation === "landscape" || img.orientation === "horizontal"
        ? 2
        : 1;
}

function buildPages(imageList) {
    const pages = [];
    let currentPage = [];
    let currentWeight = 0;
    const capacity = getPageCapacity();

    imageList.forEach(img => {
        const weight = getImageWeight(img);

        if (currentWeight + weight > capacity) {
            pages.push(currentPage);
            currentPage = [];
            currentWeight = 0;
        }

        currentPage.push(img);
        currentWeight += weight;
    });

    if (currentPage.length) {
        pages.push(currentPage);
    }

    return pages;
}

// ============================================================================
// Utilities
// ============================================================================

function capitalizeCountry(country) {
    if (country === country.toUpperCase() && country.length > 1) {
        return country;
    }
    return country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
}

function createPinterestButton(pinurl) {
    const pinBtn = document.createElement("a");
    pinBtn.href = pinurl;
    pinBtn.target = "_blank";
    pinBtn.rel = "noopener noreferrer";
    pinBtn.className = "pinterest-btn";
    pinBtn.innerHTML = `<i class="fab fa-pinterest"></i>`;
    return pinBtn;
}

function createGalleryItem(imgData, index) {
    const { url, orientation, country, pinurl } = imgData;

    const container = document.createElement("div");
    container.className = `gallery-item ${orientation}`;

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("data-lightbox", "gallery");
    link.setAttribute("data-title", capitalizeCountry(country));

    if (pinurl) {
        link.setAttribute("data-pinurl", pinurl);
    }

    const img = document.createElement("img");
    img.src = url;
    img.alt = `Image ${index + 1}`;
    img.className = `post-img ${orientation}`;
    img.loading = "lazy";

    link.appendChild(img);
    container.appendChild(link);

    if (pinurl) {
        container.appendChild(createPinterestButton(pinurl));
    }

    return container;
}

// ============================================================================
// Data Loading
// ============================================================================

async function fetchCsvData(path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);

        const text = await res.text();
        const lines = text
            .split("\n")
            .map(l => l.trim())
            .filter(l => l && !l.toLowerCase().startsWith("url"));

        return lines.map(line => {
            const [url, orientation, country, pinurl] = line.split(",");
            return {
                url: url?.trim() || "",
                orientation: (orientation || "portrait").trim(),
                country: (country || "Remove Filter").trim(),
                pinurl: pinurl ? pinurl.trim() : ""
            };
        });
    } catch (err) {
        console.error("Error loading gallery CSV:", err);
        return [];
    }
}

// ============================================================================
// Rendering
// ============================================================================

function renderGallery() {
    galleryEl.innerHTML = "";
    const fragment = document.createDocumentFragment();

    const page = pages[currentPageIndex] || [];

    // Calculate absolute index for Lightbox captions
    const baseIndex = pages
        .slice(0, currentPageIndex)
        .flat().length;

    page.forEach((imgData, index) => {
        fragment.appendChild(
            createGalleryItem(imgData, baseIndex + index)
        );
    });

    galleryEl.appendChild(fragment);
    updatePaginationControls();
}

function updatePaginationControls() {
    const totalPages = pages.length || 1;

    pageIndicator.textContent = `Page ${currentPageIndex + 1} of ${totalPages}`;
    prevBtn.disabled = currentPageIndex === 0;
    nextBtn.disabled = currentPageIndex === totalPages - 1;
}

// ============================================================================
// Filtering
// ============================================================================

function setActiveButton(activeBtn) {
    filterBarEl
        .querySelectorAll(".filter-btn")
        .forEach(b => b.classList.remove("active"));
    activeBtn.classList.add("active");
}

function createFilterButton(country) {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = country;

    btn.addEventListener("click", () => {
        setActiveButton(btn);
        filteredImages = images.filter(img => img.country === country);
        pages = buildPages(filteredImages);
        currentPageIndex = 0;
        renderGallery();
    });

    return btn;
}

function populateCountryFilter() {
    filterBarEl.innerHTML = "";

    const countries = [
        ...new Set(
            images
                .map(img => img.country)
                .filter(c => c.toLowerCase() !== "all")
        )
    ];

    countries.forEach(country => {
        filterBarEl.appendChild(createFilterButton(country));
    });

    const allBtn = document.createElement("button");
    allBtn.className = "filter-btn active";
    allBtn.textContent = "All";

    allBtn.addEventListener("click", () => {
        setActiveButton(allBtn);
        filteredImages = images;
        pages = buildPages(filteredImages);
        currentPageIndex = 0;
        renderGallery();
    });

    filterBarEl.appendChild(allBtn);
}

// ============================================================================
// Pagination Events
// ============================================================================

prevBtn.addEventListener("click", () => {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        renderGallery();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

nextBtn.addEventListener("click", () => {
    if (currentPageIndex < pages.length - 1) {
        currentPageIndex++;
        renderGallery();
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

// Recompute pages on resize
window.addEventListener("resize", () => {
    pages = buildPages(filteredImages);
    currentPageIndex = Math.min(currentPageIndex, pages.length - 1);
    renderGallery();
});

// ============================================================================
// Initialization
// ============================================================================

async function loadGallery() {
    images = await fetchCsvData(CSV_PATH);
    filteredImages = images;
    populateCountryFilter();
    pages = buildPages(filteredImages);
    renderGallery();
}

loadGallery();
