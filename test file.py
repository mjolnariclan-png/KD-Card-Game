from browser import document, window
import random
import os

# Define classes and vigor levels
CLASSES = ['Warrior', 'Mage', 'Rogue', 'Priest']
VIGOR_LEVELS = ['Earth', 'Fairy', 'Fungus', 'Greed', 'Lava', 'Lightning', 'Moon', 'Ocean', 'Sorcery', 'Spirit', 'Sun', 'Tar']

# Full path to the folder containing class images
BASE_IMAGE_FOLDER = 'E://zzz/'

def generate_card():
    # Randomly select a class and vigor level
    card_class = random.choice(CLASSES)
    vigor_level = random.choice(VIGOR_LEVELS)
    description = random_description()
    
    # Construct the path to the folder containing the class images
    class_image_folder = os.path.join(BASE_IMAGE_FOLDER, card_class.lower())
    
    # Construct the path to the image corresponding to the vigor level
    image_filename = f'{vigor_level.lower()}.png'
    if vigor_level.lower() == "earth":
        vigor_image_folder = os.path.join(BASE_IMAGE_FOLDER, 'Mana', image_filename)
    else:
        vigor_image_folder = os.path.join(BASE_IMAGE_FOLDER, 'Mana')
    image_path = os.path.join(vigor_image_folder, image_filename)
    
    return f'{card_class} ({vigor_level} Vigor) - {description}', image_path

def random_description():
    # Sample descriptions
    descriptions = [
        "A fierce warrior wielding a mighty sword.",
        "A cunning mage casting powerful spells.",
        "A stealthy rogue striking from the shadows.",
        "A wise priest offering healing and blessings."
    ]
    return random.choice(descriptions)

def display_card(card, image):
    # Create a paragraph element to display the card
    card_paragraph = document.createElement('p')
    card_paragraph.textContent = card
    document.body.appendChild(card_paragraph)
    
    # Create an image element to display the class image
    class_image = document.createElement('img')
    class_image.src = image
    document.body.appendChild(class_image)

def generate_and_display_card():
    # Generate a card and display it
    card, image = generate_card()
    display_card(card, image)

# Generate and display a card when the button is clicked
button = document.createElement('button')
button.textContent = 'Generate Card'
button.onclick = generate_and_display_card
document.body.appendChild(button)
