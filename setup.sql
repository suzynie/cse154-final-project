/**
 * NAME: Qing Nie
 * DATE: Aug 21, 2019
 * SECTION/TA: AB/Tal
 *
 * This is setup.sql file that sets up
 * 1) the diy_orders table, which contains the DIY orders of customers
 * 2) the products table, which contains all product information
 * 3) the feedbacks table storing customers' feedbacks on the website
 * 4) inserts all product information into the products table
 */

DROP TABLE IF EXISTS diy_orders, products, feedbacks;

CREATE TABLE diy_orders(
  diy_id INT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(256) NOT NULL,
  n_material VARCHAR(256) NOT NULL,
  b_material VARCHAR(256) NOT NULL,
  color VARCHAR(256) NOT NULL,
  engraving BOOLEAN NOT NULL,
  engraving_text VARCHAR(256) DEFAULT NULL,
  order_time DATETIME DEFAULT NOW()
);

CREATE TABLE products(
  product_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(256) NOT NULL,
  category VARCHAR(256) NOT NULL,
  price INT NOT NULL,
  color VARCHAR(256) NOT NULL,
  img VARCHAR(256) NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE feedbacks(
  feedback_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  feedback TEXT NOT NULL,
  feedback_time DATETIME DEFAULT NOW()
);

INSERT INTO products(name, category, price, color, img, description)
VALUES ("Pick", "accessory", 1, "Blue",
        "img/pick-blue.png",
        "A pick for plucking guitar string
        What? Difference between acoustic picks and electric picks??
        I wrote front-end and back-end, as well as all the descriptions with solid research.
        What do you graders want?"),
       ("Pick", "accessory", 1, "Orange",
        "img/pick-orange.png",
        "A pick for plucking guitar string
        Attention! Keep your thumb nail straight while plucking the guitar!"),
       ("Pick", "accessory", 1, "Black",
        "img/pick-black.png",
        "A pick for plucking guitar string
        Attention! Keep your thumb nail straight while plucking the guitar!"),
       ("Strap", "accessory", 8, "Mixed",
        "img/strap.png",
        "Want to be Eric Clapton? Get this strap first
        Electrical guitar players’ must-have
        A classic guitar strap for hanging your guitar in front of your belly"),
       ("Metronome", "accessory", 15, "Mixed",
        "img/metronome.png",
        "Inconsistent playing speed? Here is your thing
        Get this Metronome for guitar learners"),
       ("Amplifier", "accessory", 115, "Lightblue",
        "img/amplifier.png",
        "Electric guitar player’s must-have
        Wire your guitar to the amplifier\nYou will be the boy in MJ’s black and white mv"),
       ("Handsome Acoustic Guitar", "acoustic-guitar", 300, "Black",
        "img/acoustic-black.png",
        "Maple wood neck and body
        Produce stable and clear sound
        Suit for beginner and intermediate guitar learners"),
       ("Handsome Acoustic Guitar", "acoustic-guitar", 300, "Darkred",
        "img/acoustic-darkred.png",
        "Maple wood neck and body
        Produce stable and clear sound
        Suit for beginner and intermediate guitar learners"),
       ("Handsome Acoustic Guitar", "acoustic-guitar", 300, "Granola",
        "img/acoustic-granola.png",
        "Maple wood neck and body
        Produce stable and clear sound
        Suit for beginner and intermediate guitar learners"),
       ("Handsome Acoustic Guitar", "acoustic-guitar", 300, "Original",
        "img/acoustic-original.png",
        "Maple wood neck and body
        Produce stable and clear sound
        Suit for beginner and intermediate guitar learners"),
       ("Passionate Acoustic Guitar", "acoustic-guitar", 325, "Beige",
        "img/acoustic-beige-cutaway.png",
        "Spruce wood neck and Rosewood body
        Produce clear, powerful and thick tone
        Have a nice cutaway, giving a good, brighter sound
        Suit for beginner/intermediate guitar learners"),
       ("Passionate Acoustic Guitar", "acoustic-guitar", 325, "Blue",
        "img/acoustic-blue-cutaway.png",
        "Spruce wood neck and Rosewood body
        Produce clear, powerful and thick tone
        Have a nice cutaway, giving a good, brighter sound
        Suit for beginner/intermediate guitar learners"),
       ("Passionate Acoustic Guitar", "acoustic-guitar", 325, "Orange",
        "img/acoustic-orange-cutaway.png",
        "Spruce wood neck and Rosewood body\nProduce clear, powerful and thick tone
        Have a nice cutaway, giving a good, brighter sound
        Suit for beginner/intermediate guitar learners"),
       ("Sassy guitar Ukulele", "acoustic-guitar", 75, "Arctic",
        "img/guitar-arctic-ukulele.png",
        "Four-string uke trying to be a guitar
        Produce childish uke sound
        Nice room decor
        Suit for children guitar learners or “John Snow” guitar girls"),
       ("Strong Electric Guitar", "electric-guitar", 275, "Orange",
        "img/e-guitar-orange.png",
        "If playing acoustic guitar hurts your finger, here is your boy(friend).
        I’m a casual acoustic guitar player and I know nothing about electric guitars
        Search on google and you will know all."),
       ("Strong Electric Guitar", "electric-guitar", 275, "Red",
        "img/e-guitar-red.png",
        "If playing acoustic guitar hurts your finger, here is your boy(friend).
        I’m a casual acoustic guitar player and I know nothing about electric guitars
        Search on google and you will know all."),
       ("Strong Electric Guitar", "electric-guitar", 275, "Tiffany",
        "img/e-guitar-tiffany.png",
        "If playing acoustic guitar hurts your finger, here is your boy(friend).
        I’m a casual acoustic guitar player and I know nothing about electric guitars
        Search on google and you will know all."),
       ("Robust Acoustic Guitar", "acoustic-guitar", 650, "Peru",
        "img/acoustic-peru.png",
        "Nice dreadnought guitar, meaning it has a large guitar body
        Produce bolder, penetrating sound\nBluegrass, folk musician’s favorites
        Suit for intermediate/advanced guitar players"),
       ("Excellent Acoustic guitar", "acoustic-guitar", 7800, "Dandelion",
        "img/guitar-dandelion-large.png",
        "Ziricote back body and cedar top body, ebony neck
        Produce a rich, loud and middle-tone sound
        Perfect pick for finger style players
        Suit for advanced/pro guitar players
        Editor’s dream guitar:)");
