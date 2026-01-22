/**
 * Gallery Filter, Rendering, and Pagination System
 * - CSV-backed image gallery
 * - Country → slug sorting
 * - Responsive pagination by portrait-equivalent units
 * - Cloudinary-responsive images (free-tier safe)
 */

// ============================================================================
// State & DOM
// ============================================================================

let images = [];
let filteredImages = [];
let pages = [];
let currentPageIndex = 0;

// Cache pages by (image-set + capacity)
const pageCache = new Map();

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
    return window.innerWidth < 768 ? 12 : 14;
}

function getImageWeight(img) {
    return img.orientation === "landscape" || img.orientation === "horizontal"
        ? 2
        : 1;
}

// ============================================================================
// Pagination Builder (with metadata)
// ============================================================================

function buildPages(imageList) {
    const capacity = getPageCapacity();
    const cacheKey =
        imageList.map(i => i.url).join("|") + `:${capacity}`;

    if (pageCache.has(cacheKey)) {
        return pageCache.get(cacheKey);
    }

    const builtPages = [];
    let currentPage = [];
    let currentWeight = 0;
    let startIndex = 0;

    imageList.forEach(img => {
        const weight = getImageWeight(img);

        if (currentWeight + weight > capacity) {
            builtPages.push({
                images: currentPage,
                startIndex
            });
            startIndex += currentPage.length;
            currentPage = [];
            currentWeight = 0;
        }

        currentPage.push(img);
        currentWeight += weight;
    });

    if (currentPage.length) {
        builtPages.push({
            images: currentPage,
            startIndex
        });
    }

    pageCache.set(cacheKey, builtPages);
    return builtPages;
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

// ---------- Slug + Sorting ----------

function getSlugFromUrl(url) {
    return url
        .split("/")
        .pop()
        .replace(/\.[^/.]+$/, "")
        .toLowerCase();
}

function compareByCountryThenSlug(a, b) {
    const countryDiff = a.country.localeCompare(b.country, undefined, {
        sensitivity: "base"
    });
    if (countryDiff !== 0) return countryDiff;

    const slugA = getSlugFromUrl(a.url);
    const slugB = getSlugFromUrl(b.url);

    return slugA.localeCompare(slugB, undefined, {
        numeric: true,
        sensitivity: "base"
    });
}

// ---------- Cloudinary Helpers ----------

function isCloudinaryUrl(url) {
    if (!url) return false;
    return url.includes("res.cloudinary.com");
}

function cloudinaryTransform(url, width) {
    if (!url) return url;

    // Ensure protocol is HTTPS to avoid mixed-content blocking when the site
    // is served over HTTPS (GitHub Pages). Also keep non-cloudinary URLs
    // unchanged except for the protocol normalization.
    const normalized = url.replace(/^http:\/\//i, "https://");

    if (!isCloudinaryUrl(normalized)) return normalized;

    return normalized.replace(
        "/upload/",
        `/upload/f_auto,q_auto,w_${width}/`
    );
}

function buildCloudinarySrcSet(url) {
    if (!isCloudinaryUrl(url)) return "";

    return `
        ${cloudinaryTransform(url, 400)} 400w,
        ${cloudinaryTransform(url, 800)} 800w,
        ${cloudinaryTransform(url, 1600)} 1600w
    `.trim();
}

const IMAGE_SIZES = `
    (max-width: 767px) 50vw,
    (max-width: 1200px) 33vw,
    25vw
`.trim();

// ---------- Pinterest ----------

function createPinterestButton(pinurl) {
    const pinBtn = document.createElement("a");
    pinBtn.href = pinurl;
    pinBtn.target = "_blank";
    pinBtn.rel = "noopener noreferrer";
    pinBtn.className = "pinterest-btn";
    pinBtn.innerHTML = `<i class="fab fa-pinterest"></i>`;
    return pinBtn;
}

// ============================================================================
// Gallery Item Creation (Cloudinary-aware)
// ============================================================================

function createGalleryItem(imgData, absoluteIndex) {
    const { url, orientation, country, pinurl, exclude } = imgData;

    const container = document.createElement("div");
    container.className = `gallery-item ${orientation}`;

    // Lightbox always uses original
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("data-lightbox", "gallery");
    link.setAttribute("data-title", capitalizeCountry(country));

    if (pinurl) {
        link.setAttribute("data-pinurl", pinurl);
    }

    const img = document.createElement("img");

    // Responsive Cloudinary delivery
    img.src = cloudinaryTransform(url, 800); // fallback
    img.srcset = buildCloudinarySrcSet(url);
    img.sizes = IMAGE_SIZES;

    img.alt = `Image ${absoluteIndex + 1}`;
    img.className = `post-img ${orientation}`;
    img.loading = "lazy";
    img.decoding = "async";

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
            const rawUrl = url?.trim() || "";
            // Normalize protocol to HTTPS to prevent mixed-content blocking
            const normalizedUrl = rawUrl.replace(/^http:\/\//i, "https://");

            return {
                url: normalizedUrl,
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
    const page = pages[currentPageIndex];
    if (!page) return;

    galleryEl.innerHTML = "";
    const fragment = document.createDocumentFragment();

    page.images.forEach((imgData, index) => {
        fragment.appendChild(
            createGalleryItem(imgData, page.startIndex + index)
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

function applyFilter(country) {
    filteredImages =
        country === "All"
            ? images
            : images.filter(img => img.country === country);

    pages = buildPages(filteredImages);
    currentPageIndex = 0;
    renderGallery();
}

function createFilterButton(country) {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.textContent = country;

    btn.addEventListener("click", () => {
        setActiveButton(btn);
        applyFilter(country);
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
        applyFilter("All");
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

// ============================================================================
// Resize Handling (debounced)
// ============================================================================

let resizeTimeout;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        pageCache.clear();
        pages = buildPages(filteredImages);
        currentPageIndex = Math.min(currentPageIndex, pages.length - 1);
        renderGallery();
    }, 150);
});

// ============================================================================
// Initialization
// ============================================================================

async function loadGallery() {
    images = await fetchCsvData(CSV_PATH);

    // Sort once: country → slug
    images.sort(compareByCountryThenSlug);

    filteredImages = images;

    populateCountryFilter();
    pages = buildPages(filteredImages);
    renderGallery();

    // Preload first page thumbnails
    pages[0]?.images.forEach(img => { 
        const preload = new Image();
        preload.src = cloudinaryTransform(img.url, 800);
    });
}

loadGallery();
