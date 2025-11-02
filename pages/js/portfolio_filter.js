let images = [];
const filterBarEl = document.getElementById("countryFilterBar");

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
            const [url, orientation, country] = line.split(",");
            return { 
                url: url?.trim() || "", 
                orientation: (orientation || "portrait").trim(),
                country: (country || "Remove Filter").trim()
            };
        });
    } catch (err) {
        console.error(err);
        return [];
    }
}

function renderGallery(list) {
    galleryEl.innerHTML = "";
    const fragment = document.createDocumentFragment();

    list.forEach((imgData, index) => {
        const { url, orientation, country } = imgData;

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("data-lightbox", "portfolio");
        link.setAttribute("data-title", `Country: ${country}, Orientation: ${orientation}`);

        const img = document.createElement("img");
        img.src = url;
        img.alt = `Image ${index + 1}`;
        img.className = `post-img ${orientation}`;
        img.loading = "lazy";

        link.appendChild(img);
        fragment.appendChild(link);
    });

    galleryEl.appendChild(fragment);
}

function populateCountryFilter() {
    filterBarEl.innerHTML = ""; // clear existing buttons

    // Unique countries (excluding "all")
    const countries = [...new Set(images.map(img => img.country).filter(c => c.toLowerCase() !== "all"))];

    // Add country buttons first
    countries.forEach(country => {
        const btn = document.createElement("button");
        btn.className = "filter-btn";
        btn.dataset.country = country;
        btn.textContent = country;
        filterBarEl.appendChild(btn);

        btn.addEventListener("click", () => {
            setActiveButton(btn);
            const filteredImages = images.filter(img => img.country === country);
            renderGallery(filteredImages);
        });
    });

    // "Remove Filter" button at the end
    const removeBtn = document.createElement("button");
    removeBtn.className = "filter-btn active";
    removeBtn.dataset.country = "all";
    removeBtn.textContent = "All";
    filterBarEl.appendChild(removeBtn);

    removeBtn.addEventListener("click", () => {
        setActiveButton(removeBtn);
        renderGallery(images);
    });
}


function setActiveButton(activeBtn) {
    filterBarEl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    activeBtn.classList.add("active");
}

async function loadGallery() {
    images = await fetchCsvData(CSV_PATH);
    populateCountryFilter();
    renderGallery(images);
}

loadGallery();
