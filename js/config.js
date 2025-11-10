/**
 * Site Configuration
 * Centralized configuration for paths and constants
 */

const CONFIG = {
    // Paths
    paths: {
        partials: 'partials',
        css: 'css',
        posts: 'posts',
        images: 'images'
    },
    
    // Gallery settings
    gallery: {
        csvPath: 'pages/image_metadata.csv',
        defaultOrientation: 'portrait'
    },
    
    // Site metadata
    site: {
        title: 'McKenzie DuBois',
        copyright: 'McKenzie DuBois',
        year: new Date().getFullYear()
    }
};

// Make config available globally
window.CONFIG = CONFIG;

