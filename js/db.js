/**
 * db.js — CoffeeNote coffee database
 * All dropdown option data: drink types, origins, varietals,
 * process methods, roast profiles, and tasting notes.
 */

const DB = {

  drinkTypes: [
    { group: 'Espresso-Based', items: [
      'Espresso', 'Ristretto', 'Lungo', 'Americano', 'Macchiato',
      'Cortado', 'Flat White', 'Cappuccino', 'Latte', 'Mocha', 'Affogato', 'Con Panna',
    ]},
    { group: 'Filter / Pour Over', items: [
      'Pour Over (V60)', 'Pour Over (Chemex)', 'Pour Over (Kalita Wave)',
      'Pour Over (Origami)', 'Drip / Batch Brew', 'Clever Dripper', 'Aeropress',
    ]},
    { group: 'Immersion', items: [
      'French Press', 'Siphon / Vacuum Pot', 'Moka Pot',
      'Turkish / Ibrik', 'Cold Brew (Immersion)', 'Cupping',
    ]},
    { group: 'Cold', items: [
      'Cold Brew', 'Nitro Cold Brew', 'Iced Latte',
      'Iced Americano', 'Iced Pour Over', 'Cold Drip',
    ]},
  ],

  origins: [
    { group: 'Africa', items: [
      'Ethiopia — Yirgacheffe', 'Ethiopia — Sidama', 'Ethiopia — Harrar',
      'Ethiopia — Guji', 'Ethiopia — Bench Maji',
      'Kenya', 'Kenya — Nyeri', 'Kenya — Kirinyaga', "Kenya — Murang'a",
      'Rwanda', 'Burundi', 'Uganda', 'Tanzania',
      'Democratic Republic of Congo', 'Zambia', 'Malawi',
      'Madagascar', 'Cameroon', 'Ivory Coast',
    ]},
    { group: 'Central America', items: [
      'Guatemala', 'Guatemala — Huehuetenango', 'Guatemala — Antigua',
      'Honduras', 'Costa Rica', 'El Salvador', 'Mexico',
      'Nicaragua', 'Panama', 'Panama — Boquete', 'Belize',
    ]},
    { group: 'South America', items: [
      'Colombia', 'Colombia — Huila', 'Colombia — Nariño', 'Colombia — Antioquia',
      'Brazil', 'Brazil — Minas Gerais', 'Brazil — Sul de Minas', 'Brazil — Cerrado',
      'Peru', 'Bolivia', 'Ecuador', 'Venezuela',
    ]},
    { group: 'Caribbean', items: [
      'Jamaica — Blue Mountain', 'Haiti', 'Dominican Republic', 'Puerto Rico', 'Cuba',
    ]},
    { group: 'Asia & Pacific', items: [
      'Yemen', 'Yemen — Mokha', 'India — Coorg', 'India — Chikmagalur',
      'Indonesia — Sumatra', 'Indonesia — Java', 'Indonesia — Sulawesi (Toraja)', 'Indonesia — Flores',
      'Papua New Guinea', 'Philippines', 'Vietnam', 'Myanmar',
      'Thailand', 'Laos', 'Timor-Leste', 'Taiwan',
    ]},
  ],

  varietals: [
    { group: 'Classic / Arabica', items: [
      'Typica', 'Bourbon', 'Red Bourbon', 'Yellow Bourbon', 'Pink Bourbon',
      'Caturra', 'Catuai (Red)', 'Catuai (Yellow)', 'Mundo Novo',
      'Maragogipe', 'Pacamara', 'Pacas', 'Villa Sarchi', 'Tekisic',
    ]},
    { group: 'Ethiopian Heirlooms', items: [
      'Heirloom (Ethiopian)', 'JARC 74110', 'JARC 74112',
      'Dega', 'Kurume', 'Wolisho', 'Geisha / Gesha',
    ]},
    { group: 'Kenyan', items: [
      'SL28', 'SL34', 'Ruiru 11', 'Batian', 'K7',
    ]},
    { group: 'Hybrid & Modern', items: [
      'Catimor', 'Sarchimor', 'Castillo', 'Tabi', 'Centroamericano',
      'Obata', 'Icatu', 'Marsellesa', 'H3', 'Laurina (Bourbon Pointu)',
    ]},
    { group: 'Asian', items: [
      'S795 (India)', 'Kent (India)', 'TimTim (Sumatra)', 'Lini S-795', 'Jember',
    ]},
    { group: 'Other Species', items: [
      'Robusta (Canephora)', 'Liberica', 'Excelsa', 'Stenophylla',
    ]},
  ],

  processMethods: [
    { group: 'Wet / Washed', items: [
      'Washed', 'Double Washed', 'Kenyan Washed (72hr Ferment)', 'Extended Wet Fermentation',
    ]},
    { group: 'Natural / Dry', items: [
      'Natural (Dry)', 'African Bed Dried', 'Raised Bed Natural',
    ]},
    { group: 'Honey', items: [
      'Yellow Honey', 'Red Honey', 'Black Honey', 'White Honey',
    ]},
    { group: 'Anaerobic', items: [
      'Anaerobic Natural', 'Anaerobic Washed',
      'Carbonic Maceration Natural', 'Carbonic Maceration Washed',
      'Lactic Anaerobic', 'Acetic Anaerobic',
    ]},
    { group: 'Other / Specialty', items: [
      'Wet-Hulled (Giling Basah)', 'Pulped Natural (Semi-Washed)',
      'Thermal Shock', 'Koji Fermentation', 'Wine / Barrel Aged', 'Cold Maceration',
    ]},
  ],

  roastProfiles: [
    { group: 'Light', items: [
      'Light (Cinnamon)', 'Light (City-)', 'Light-Medium (City)',
    ]},
    { group: 'Medium', items: [
      'Medium (City+)', 'Medium (Full City-)', 'Medium-Dark (Full City)',
    ]},
    { group: 'Dark', items: [
      'Dark (Full City+)', 'Dark (Vienna)', 'Extra Dark (French)', 'Extra Dark (Italian / Espresso)',
    ]},
    { group: 'Special', items: [
      'Omni Roast', 'Filter Roast', 'Espresso Roast', 'Nordic / Scandinavian Light',
    ]},
  ],

  tastingNotes: [
    { group: '🍒 Stone Fruit',    items: ['Peach','Apricot','Plum','Cherry','Black Cherry','Red Cherry','Nectarine','Lychee'] },
    { group: '🫐 Berry',          items: ['Blueberry','Strawberry','Raspberry','Blackberry','Cranberry','Grape','Currant','Elderberry'] },
    { group: '🍊 Citrus',         items: ['Lemon','Orange','Grapefruit','Lime','Mandarin','Bergamot','Yuzu','Blood Orange'] },
    { group: '🍍 Tropical',       items: ['Mango','Pineapple','Papaya','Passion Fruit','Guava','Coconut','Melon','Jackfruit'] },
    { group: '🍏 Tree Fruit',     items: ['Apple','Pear','Green Apple','Fig','Pomegranate','Quince'] },
    { group: '🍇 Dried Fruit',    items: ['Raisin','Date','Prune','Dried Apricot','Dried Cranberry','Tamarind'] },
    { group: '🍫 Chocolate',      items: ['Dark Chocolate','Milk Chocolate','White Chocolate','Cocoa','Cacao Nib','Brownie','Mocha'] },
    { group: '🍬 Sweet',          items: ['Caramel','Brown Sugar','Molasses','Honey','Maple Syrup','Toffee','Butterscotch','Vanilla','Praline','Candy','Marshmallow'] },
    { group: '🌸 Floral',         items: ['Jasmine','Rose','Lavender','Hibiscus','Orange Blossom','Chamomile','Violet','Elderflower','Geranium'] },
    { group: '🌿 Herbal / Tea',   items: ['Black Tea','Green Tea','Oolong','Mint','Lemongrass','Basil','Thyme','Sage'] },
    { group: '🌰 Nutty',          items: ['Almond','Hazelnut','Walnut','Peanut','Macadamia','Pecan','Pistachio','Cashew'] },
    { group: '🌶 Spice',          items: ['Cinnamon','Clove','Cardamom','Black Pepper','Nutmeg','Allspice','Star Anise','Ginger'] },
    { group: '🌾 Roasty / Grain', items: ['Toast','Malt','Cereal','Biscuit','Oat','Granola','Dark Toast','Smoke'] },
    { group: '🍷 Winey / Earthy', items: ['Wine','Red Wine','Whiskey','Brandy','Rum','Tobacco','Leather','Cedar','Earthy','Mushroom'] },
    { group: '🧈 Creamy / Body',  items: ['Butter','Cream','Full Body','Creamy','Silky','Juicy','Bright','Clean'] },
  ],
};
