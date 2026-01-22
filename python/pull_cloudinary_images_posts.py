import cloudinary
import cloudinary.api
import csv

from dotenv import load_dotenv
import os

load_dotenv()  # <-- this actually loads .env into the environment

cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
)

FOLDER = "gallery"

# Fetch image metadata from Cloudinary
image_metadata = (
    cloudinary.search.Search()
        .expression(f"folder:{FOLDER}/*")
        .fields("secure_url")
        .fields("url")
        .fields("width")
        .fields("height")
        .fields("context")
        .fields("tags")
        .execute()
)

# Path to overwrite
file_path = 'pages/image_metadata.csv'

# Save to CSV (overwrite)
with open(file_path, 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['url', 'orientation', 'country','pinurl', 'slug', 'alt', 'caption'])  # added new column

    for item in image_metadata['resources']:
        
        url = item['url']
        width = item.get('width', 0)
        height = item.get('height', 0)
        orientation = 'landscape' if width > height else 'portrait'
        custom = item.get('context', {})

        asset_folder = item.get("asset_folder", "")
        parts = asset_folder.split("/")

        country = parts[1] if len(parts) > 1 else ""
        slug    = parts[2] if len(parts) > 2 else ""

        pinurl  = custom.get('pinurl', '')
        alt     = custom.get('alt', '')
        caption = custom.get('caption', '')
        exclude = custom.get('exclude', '')

        writer.writerow([url, orientation, country, pinurl, slug, alt, caption, exclude])

print(f"SUCCESS: CSV file '{file_path}' overwritten successfully!")

# Pinterest path to overwrite
pin_path = 'pages/pinterest_metadata.csv'

# Save to CSV (overwrite)
with open(pin_path, 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['Media URL', 'Title', 'Pinterest board','Description','Thumbnail'])  # added new column

    for i, item in enumerate(image_metadata['resources'], start=1):

        if not item.get('context', {}).get('exclude', '') and not item.get('context', {}).get('pinurl', ''):
        
            url = item['url']
            custom = item.get('context', {})

            asset_folder = item.get("asset_folder", "")
            parts = asset_folder.split("/")

            country = parts[1] if len(parts) > 1 else ""
            slug    = parts[2] if len(parts) > 2 else ""

            alt     = custom.get('alt', '')
            caption = custom.get('caption', '')

            title = f"{slug.replace('_', ' ').capitalize()} {i}" if slug else f"Image {i}"

            if len(caption) == 0:
                print(f"WARNING: Skipping image '{country}' due to missing caption.")
                continue

            if country == 'USA':
                if slug in ['mendocino', 'redwood_nationalpark']:
                    pinboard = 'travel/california'
            else:
                pinboard = 'travel/' + country.lower()

            writer.writerow([url, title, pinboard, caption, url])

print(f"SUCCESS: CSV file '{pin_path}' overwritten successfully!")
