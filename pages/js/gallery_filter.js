/**
 * Gallery Filter and Rendering System
 * Handles loading, filtering, and displaying gallery images
 */

// ============================================================================
// Constants & DOM Elements
// ============================================================================

let images = [];
const filterBarEl = document.getElementById("countryFilterBar");
const CSV_PATH = window.CSV_PATH || "image_metadata.csv";
const galleryEl = window.galleryEl || document.getElementById("gallery");

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Capitalizes country name properly
 * Keeps acronyms (USA, UK) uppercase, capitalizes others normally
 */
function capitalizeCountry(country) {
    if (country === country.toUpperCase() && country.length > 1) {
        // Keep acronyms like USA, UK, etc. as uppercase
        return country;
    }
    // Normal capitalization: first letter uppercase, rest lowercase
    return country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
}

/**
 * Creates a Pinterest button element
 */
function createPinterestButton(pinurl) {
    const pinBtn = document.createElement("a");
    pinBtn.href = pinurl;
    pinBtn.target = "_blank";
    pinBtn.rel = "noopener noreferrer";
    pinBtn.className = "pinterest-btn";
    pinBtn.innerHTML = `<i class="fab fa-pinterest"></i>`;
    return pinBtn;
}

/**
 * Creates a gallery item element with image and optional Pinterest button
 */
function createGalleryItem(imgData, index) {
    const { url, orientation, country, pinurl } = imgData;

    // Container for image + overlay
    const container = document.createElement("div");
    container.className = `gallery-item ${orientation}`;

    // Lightbox link
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("data-lightbox", "gallery");
    link.setAttribute("data-title", capitalizeCountry(country));
    
    if (pinurl) {
        link.setAttribute("data-pinurl", pinurl);
    }

    // Image element
    const img = document.createElement("img");
    img.src = url;
    img.alt = `Image ${index + 1}`;
    img.className = `post-img ${orientation}`;
    img.loading = "lazy";

    link.appendChild(img);
    container.appendChild(link);

    // Pinterest overlay button (if pinurl exists)
    if (pinurl) {
        container.appendChild(createPinterestButton(pinurl));
    }

    return container;
}

// ============================================================================
// Data Loading
// ============================================================================

/**
 * Fetches and parses CSV data from the specified path
 */
async function fetchCsvData(path) {
    try {
        const res = await fetch(path);
        if (!res.ok) throw new Error(`Failed to fetch CSV: ${res.status}`);
        
        const text = await res.text();
        const lines = text
            .split("\n")
            .map(line => line.trim())
            .filter(line => line && !line.toLowerCase().startsWith("url")); // skip header

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
        console.error("Error fetching CSV data:", err);
        return [];
    }
}

// ============================================================================
// Gallery Rendering
// ============================================================================

/**
 * Renders the gallery with the provided list of images
 */
function renderGallery(list) {
    galleryEl.innerHTML = "";
    const fragment = document.createDocumentFragment();

    list.forEach((imgData, index) => {
        fragment.appendChild(createGalleryItem(imgData, index));
    });

    galleryEl.appendChild(fragment);
}

// ============================================================================
// Filter Functionality
// ============================================================================

/**
 * Sets the active filter button and removes active class from others
 */
function setActiveButton(activeBtn) {
    filterBarEl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    activeBtn.classList.add("active");
}

/**
 * Creates and sets up a country filter button
 */
function createFilterButton(country) {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.country = country;
    btn.textContent = country;
    
    btn.addEventListener("click", () => {
        setActiveButton(btn);
        const filteredImages = images.filter(img => img.country === country);
        renderGallery(filteredImages);
    });
    
    return btn;
}

/**
 * Populates the country filter bar with buttons
 */
function populateCountryFilter() {
    filterBarEl.innerHTML = "";

    // Get unique countries (excluding "all")
    const countries = [...new Set(images.map(img => img.country).filter(c => c.toLowerCase() !== "all"))];

    // Add country filter buttons
    countries.forEach(country => {
        filterBarEl.appendChild(createFilterButton(country));
    });

    // Add "All" button at the end
    const removeBtn = document.createElement("button");
    removeBtn.className = "filter-btn active";
    removeBtn.dataset.country = "all";
    removeBtn.textContent = "All";
    removeBtn.addEventListener("click", () => {
        setActiveButton(removeBtn);
        renderGallery(images);
    });
    filterBarEl.appendChild(removeBtn);
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes the gallery by loading data and setting up filters
 */
async function loadGallery() {
    images = await fetchCsvData(CSV_PATH);
    populateCountryFilter();
    renderGallery(images);
}

// Start the gallery
loadGallery();
