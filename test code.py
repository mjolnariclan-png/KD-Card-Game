import random
import textwrap
import os
import json
from PIL import Image, ImageDraw, ImageFont

# Function to create directory if it doesn't exist
def create_directory_if_not_exists(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

project_directory = "E:\\zzz\\"
os.chdir(project_directory)
cards_directory = os.path.join(project_directory, "Test Game", "cards")
card_info_directory = os.path.join(cards_directory,"Test Game", "card info")
create_directory_if_not_exists(card_info_directory)

# Load the background image
bg_image = Image.open("background.png")

# Rest# Define paths
rarity_path = os.path.join(os.getcwd(), "Rarity")
master_photo_list_path = os.path.join(os.getcwd(), "Master Photo List")

# Define fonts
mana_font = ImageFont.truetype("FairyDustB.ttf", 20)
Name_font = ImageFont.truetype("Viking.ttf", 12)
class_font = ImageFont.truetype("Viking.ttf", 12)
text_font = ImageFont.truetype("Viking.ttf", 8)
mana_font2 = ImageFont.truetype("Viking.ttf", 12)

# Define class mappings
class_mapping = {
    folder_name: [
        os.path.join(master_photo_list_path, folder_name, filename)
        for filename in os.listdir(os.path.join(master_photo_list_path, folder_name))
    ]
    for folder_name in os.listdir(master_photo_list_path)
}

# Randomly select a class folder
selected_class_folder = random.choice(list(class_mapping.keys()))

# Randomly select an image from the selected class folder
selected_image_path = random.choice(class_mapping[selected_class_folder])

# Load and paste the selected image onto the background image
class_image = Image.open(selected_image_path)
bg_image.paste(class_image, (11, 33))

# Define mana colors and their strengths/weaknesses
insight_strengths = {
    'Lava': ['Greed', 'Sorcery', 'Ocean', 'Earth', 'Spirit'],
    'Ocean': ['Fairy', 'Earth', 'Sorcery', 'Lava', 'Tar'],
    'Sun': ['Fairy', 'Moon', 'Ocean', 'Tar', 'Lightning'],
    'Fungus': ['Spirit', 'Sorcery', 'Lightning', 'Ocean', 'Earth'],
    'Tar': ['Sorcery', 'Spirit', 'Ocean', 'Fairy', 'Greed'],
    'Lightning': ['Fungus', 'Spirit', 'Sun', 'Moon', 'Lava'],
    'Moon': ['Greed', 'Fairy', 'Earth', 'Lightning', 'Tar'],
    'Earth': ['Sorcery', 'Greed', 'Sun', 'Fungus', 'Lightning'],
    'Greed': ['Tar', 'Ocean', 'Sun', 'Lightning', 'Sorcery'],
    'Spirit': ['Fairy', 'Ocean', 'Greed', 'Sun', 'Sorcery'],
    'Sorcery': ['Spirit', 'Fairy', 'Lava', 'Moon', 'Sun'],
    'Fairy': ['Lightning', 'Earth', 'Sorcery', 'Tar', 'Lava']
}

insight_weaknesses = {
    'Lava': ['Fungus', 'Tar', 'Fairy', 'Lightning', 'Moon'],
    'Ocean': ['Greed', 'Sun', 'Fungus', 'Spirit', 'Lightning'],
    'Sun': ['Spirit', 'Greed', 'Earth', 'Lava', 'Fungus'],
    'Fungus': ['Sun', 'Lava', 'Moon', 'Greed', 'Fairy'],
    'Tar': ['Lava', 'Earth', 'Moon', 'Fungus', 'Sun'],
    'Lightning': ['Ocean', 'Sorcery', 'Greed', 'Tar', 'Earth'],
    'Moon': ['Fungus', 'Sorcery', 'Spirit', 'Ocean', 'Sun'],
    'Earth': ['Spirit', 'Ocean', 'Tar', 'Fairy', 'Moon'],
    'Greed': ['Moon', 'Spirit', 'Fairy', 'Lava', 'Earth'],
    'Spirit': ['Lightning', 'Earth', 'Moon', 'Lava', 'Fungus'],
    'Sorcery': ['Earth', 'Fungus', 'Ocean', 'Greed', 'Tar'],
    'Fairy': ['Greed', 'Ocean', 'Moon', 'Spirit', 'Fungus']
}

# Define attack mappings
attack_mappings = {
'Abyssal Abyss': 'Creates abyss, disables attacks 15 turns'
}



# Randomly select a mana color
selected_insight_color = random.choice(list(insight_strengths.keys()))

# Get the strengths and weaknesses for the selected mana color
strengths = insight_strengths.get(selected_insight_color, [])
weaknesses = insight_weaknesses.get(selected_insight_color, [])

# Randomly select one mana from strengths and one from weaknesses
selected_strength = random.choice(strengths)
selected_weakness = random.choice(weaknesses)

# Load mana images
insight_image_path = f"Mana/{selected_insight_color}.png"
strength_image_path = f"SMana/{selected_strength}.png"
weakness_image_path = f"WMana/{selected_weakness}.png"

# Load and paste mana image
insight_image = Image.open(insight_image_path)
bg_image.paste(insight_image, (223, 11))

# Load and paste strength image
strength_image = Image.open(strength_image_path)
bg_image.paste(strength_image, (133, 322))

# Load and paste weakness image
weakness_image = Image.open(weakness_image_path)
bg_image.paste(weakness_image, (220, 322))

# Choose a random image for rarity
selected_rarity_image = random.choice(os.listdir(rarity_path))
rarity_image_path = os.path.join(rarity_path, selected_rarity_image)
rarity = Image.open(rarity_image_path)
bg_image.paste(rarity, (218, 187))

                # Remove the existing logic for selecting the bottom photo
# Get the bottom photo path based on selected_insight_color
bottom_photo_path = os.path.join(os.getcwd(), project_directory, "Primordial(Bot)", selected_insight_color, f"{selected_insight_color}.png")

# Open the bottom image using the bottom_photo_path
bottom_photo_image = Image.open(bottom_photo_path)

# Paste the bottom image onto the background image
bg_image.paste(bottom_photo_image, (11, 208))


# Randomly select values for text
mana_cost1 = ["1", "2", '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
mana_cost2 = ["1", "2", '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
mana_cost3 = ["1", "2", '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

mana1 = random.choice(mana_cost1)
mana2 = random.choice(mana_cost2)
mana3 = random.choice(mana_cost3)

class_assignment = selected_class_folder
attack_point = [f"AP {i}" for i in range(1, 13)]
ap = random.choice(attack_point)
defense_point = [f"DP {i}" for i in range(1, 13)]
dp = random.choice(defense_point)
attack_name = ['Abyssal Abyss'
                ]
attack_description = ['Creates abyss, disables attacks 15 turns']
first_name = ['Adna']
first = random.choice(first_name)
strength = ['Strength:']
weakness = ['Weakness:']
AN = random.choice(list(attack_mappings.keys()))
AD = attack_mappings[AN]
wrapped_ad = textwrap.wrap(AD, 25)
AN1 = random.choice(list(attack_mappings.keys()))
AD1 = attack_mappings[AN1]
wrapped_ad1 = textwrap.wrap(AD1, 25)

# Add text to the image
draw = ImageDraw.Draw(bg_image)
draw.text((44 - 25, 45 - 35), mana1, fill="black", font=mana_font)
draw.text((42 - 25, 223 - 35), class_assignment, fill="black", font=class_font)
draw.text((110 - 25, 47 - 35), first, fill="white", font=Name_font)
draw.text((38 - 27, 342 - 34), ap, fill="black", font=mana_font2)
draw.text((38 - 27, 357 - 34), dp, fill="black", font=mana_font2)
draw.text((70 - 29, 245 - 35), AN, fill="black", font=text_font)
draw.text((70 - 29, 295 - 35), AN1, fill="black", font=text_font)
for i, line in enumerate(wrapped_ad):
    draw.text((70 - 29, 260 - 35 + i * 11), line, fill="black", font=text_font)
for i, line in enumerate(wrapped_ad1):
    draw.text((70 - 29, 310 - 35 + i * 11), line, fill="black", font=text_font)
draw.text((45 - 25, 245 - 35), mana2, fill="black", font=mana_font)
draw.text((45 - 25, 295 - 35), mana3, fill="black", font=mana_font)
draw.text((97 - 25, 358 - 35), random.choice(strength), fill="black", font=text_font)
draw.text((177 - 25, 358 - 35), random.choice(weakness), fill="black", font=text_font)

# Save and display the modified image
bg_image.show()


card_subfolder = "Creature"

card_info = {
    "name": first,
    
    "className": selected_class_folder,
    "classImage": selected_image_path,  # Modify path as per your folder structure
    "attacks": [
        {"name": AN, "description": AD, "manaCost": mana2},
        {"name": AN1, "description": AD1, "manaCost": mana3}
    ],
    "Mana Card Cost": mana1,
    "ap": ap,
    "dp": dp,
    "strength": {"element": selected_strength, "image": f"{strength_image_path}"},
    "weakness": {"element": selected_weakness, "image": f"{weakness_image_path}"},
    "deckManaImage": f"{insight_image_path}",
    "rarityImage": rarity_image_path,  # Use the full path to the rarity image
    "backgroundImage": "E:\\zzz\\background.png"
}

# Save card information to JSON file
card_info_filename = os.path.join(card_info_directory, f"{selected_class_folder}_{selected_insight_color}_{selected_rarity_image}.json")
with open(card_info_filename, 'w') as json_file:
    json.dump(card_info, json_file, indent=4)

# Construct the folder path with the correct structure using slashes to separate folder names
card_save_path = os.path.join(cards_directory, selected_insight_color, selected_rarity_image, card_subfolder)
create_directory_if_not_exists(card_save_path)

# Construct the file path including the folder path and the filename with extension
card_save = os.path.join(card_save_path, f"{first_name}.png")
try:
    bg_image.save(card_save)
    print("Image saved successfully.")
except Exception as e:
    print(f"An error occurred while saving the image: {e}")

print(mana1)
print(mana2)
print(mana3)
