from PIL import Image, ImageDraw, ImageFont

# JSON data
data = {
    "policyNumber": "LIC123456789",
    "policyHolder": "Jane Smith",
    "policyType": "Term Life Insurance",
    "coverageAmount": 1000000,
    "premiumAmount": 50000,
    "startDate": "01-01-2023",
    "endDate": "01-01-2043"
}

# Convert JSON to a formatted string
formatted_text = "\n".join([f"{key}: {value}" for key, value in data.items()])

# Create a blank image with a white background
image_width = 800
image_height = 600
image = Image.new("RGB", (image_width, image_height), "white")
draw = ImageDraw.Draw(image)

# Load a font (you may need to specify the path to a .ttf file)
try:
    font = ImageFont.truetype("arial.ttf", 20)
except IOError:
    font = ImageFont.load_default()

# Add text to the image
draw.text((10, 10), formatted_text, fill="black", font=font)

# Save the image as a JPG file
image.save("policy_data.jpg")

print("JSON data saved as policy_data.jpg")