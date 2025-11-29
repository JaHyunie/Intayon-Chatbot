
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { marked } from 'marked';

// Configure marked to open links in a new tab for security and better UX.
const renderer = new marked.Renderer();
// FIX: The marked library's renderer.link function signature has changed in recent versions.
// It now accepts a single object with href, title, and text properties instead of separate arguments.
// The `title` property is optional, so we mark it as such in the type definition to match the expected signature.
renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
  return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer">${text}</a>`;
};
marked.setOptions({ renderer });

enum Author {
  USER = 'user',
  BOT = 'bot',
}

interface Message {
  author: Author;
  text: string;
}

interface Detail {
    name: string;
    description: string;
    googleMapsLink?: string; // Kept for food items that are specific places
}

interface Accommodation extends Detail {
    price?: string;
}

interface LocationInfo {
    name: string;
    keywords: string[];
    description: string;
    touristSpots: Detail[];
    food: Detail[];
    accommodations: Accommodation[];
    souvenirs: Detail[];
    nearbySuggestion?: string | null;
}

const ilocosNorteData: LocationInfo[] = [
    // Cities
    {
        name: "Laoag City",
        keywords: ['laoag'],
        description: "The provincial capital, Laoag is the vibrant heart of Ilocos Norte, offering a mix of historical sites, modern amenities, and delicious Ilocano cuisine.",
        touristSpots: [
            { name: "Sinking Bell Tower", description: "A famous leaning tower that sinks about an inch every year." },
            { name: "St. William's Cathedral", description: "An Italian Renaissance-inspired cathedral and a major landmark in the city." },
            { name: "Museo Ilocos Norte", description: "A museum showcasing the culture and heritage of the Ilocano people." },
            { name: "La Paz Sand Dunes", description: "Another stunning sand dune area offering thrilling 4x4 and sandboarding experiences, easily accessible from the city." },
            { name: "SM City Laoag", description: "The largest shopping mall in the province, offering a wide range of retail stores, dining options, a cinema, and a supermarket.", googleMapsLink: "placeholder" }
        ],
        food: [
            { name: "Bagnet", description: "Crispy, deep-fried pork belly, a must-try Ilocano specialty." },
            { name: "Ilocos Longganisa", description: "A local garlic sausage with a distinctly sour and savory taste." },
            { name: "Saramsam Ylocano Restaurant", description: "A beloved restaurant serving traditional Ilocano dishes with a creative twist in a charming, homey setting. 'Saramsam' means 'informal, happy dining' in Ilocano.", googleMapsLink: "placeholder" },
            { name: "La Preciosa", description: "A famous Laoag restaurant in a heritage house, serving authentic Ilocano dishes and renowned cakes, including their must-try carrot cake. They also offer coffee.", googleMapsLink: "placeholder" },
            { name: "Starbucks", description: "The globally recognized coffeehouse chain, offering a familiar menu of coffee, espresso drinks, teas, and pastries in a modern setting.", googleMapsLink: "placeholder" },
            { name: "Jollibee", description: "The Philippines' most famous fast-food chain, offering favorites like Chickenjoy and Jolly Spaghetti. Multiple branches are available throughout the city.", googleMapsLink: "placeholder" },
            { name: "McDonald's", description: "The global fast-food giant, providing familiar options like burgers, fries, and coffee. A convenient choice for a quick meal.", googleMapsLink: "placeholder" },
            { name: "7-Eleven", description: "A 24/7 convenience store where you can buy snacks, drinks, and other essentials. Many branches are scattered across the city for easy access.", googleMapsLink: "placeholder" }
        ],
        accommodations: [
            { name: "Fort Ilocandia Resort Hotel", description: "A grand resort with a wide range of amenities.", price: "₱4,000 - ₱8,000/night" },
            { name: "Java Hotel", description: "A Balinese-inspired hotel known for its unique architecture.", price: "₱2,500 - ₱5,000/night" },
            { name: "Plaza del Norte Hotel and Convention Center", description: "A modern hotel with extensive facilities.", price: "₱3,000 - ₱6,000/night" },
            { name: "Viven Hotel", description: "A stylish and contemporary hotel located in the city center.", price: "₱2,000 - ₱4,000/night" },
            { name: "UKL Ever Resort Hotel", description: "Offers comfortable rooms and a swimming pool, great for families.", price: "₱1,800 - ₱3,500/night" }
        ],
        souvenirs: [
            { name: "Laoag City Public Market", description: "A great place to find local delicacies like Longganisa and Bagnet, as well as a variety of handicrafts and Chichacorn at local prices.", googleMapsLink: "placeholder" },
            { name: "SM City Laoag", description: "The mall's supermarket and department store have sections dedicated to pasalubong, offering conveniently packaged local goods like Chichacorn, Biscocho, and Longganisa.", googleMapsLink: "placeholder" },
            { name: "Pasalubong Centers", description: "Several shops along the national highway offer pre-packaged goods like Biscocho, garlic, and woven products, perfect for easy souvenir shopping." }
        ],
        nearbySuggestion: null
    },
    {
        name: "Batac City",
        keywords: ['batac'],
        description: "Known as the 'Home of Great Leaders,' Batac is also famous for its mouth-watering empanadas and historical significance.",
        touristSpots: [
            { name: "Marcos Museum and Mausoleum", description: "Showcases memorabilia of the late President Ferdinand Marcos." },
            { name: "Batac Church (Immaculate Conception Parish)", description: "A historic church that is a central landmark of the city." }
        ],
        food: [
            { name: "Batac Riverside Empanadahan", description: "A famous spot to try the authentic Batac Empanada, a deep-fried pastry filled with green papaya, longganisa, and egg.", googleMapsLink: "placeholder" }
        ],
        accommodations: [
            { name: "Balay da Blas Pensionne House", description: "A cozy and affordable guesthouse in the city proper.", price: "₱1,200 - ₱2,500/night" }
        ],
        souvenirs: [
            { name: "Batac Riverside Empanadahan Area", description: "Besides empanadas, you can find local vendors selling snacks and small souvenirs. The nearby public market is also a good spot for local products." }
        ],
        nearbySuggestion: "Laoag City"
    },
    // Municipalities
    {
        name: "Adams",
        keywords: ['adams'],
        description: "A remote, mountainous municipality known for its pristine nature, waterfalls, and eco-tourism.",
        touristSpots: [
            { name: "Anuplig Falls", description: "A stunning multi-tiered waterfall perfect for trekking and swimming." }
        ],
        food: [
            { name: "Bugnay Wine", description: "A local wine made from the fruit of the bugnay tree." }
        ],
        accommodations: [
            { name: "Local Homestays", description: "Experience the local culture by staying with a family. Arrangements are usually made upon arrival or via the local tourism office.", price: "₱500 - ₱1,000/night" }
        ],
        souvenirs: [
            { name: "Local Producers in Adams", description: "The best souvenir here is the local **Bugnay Wine**. Ask your homestay host or the local tourism office where you can buy bottles directly from the producers for the best price." }
        ],
        nearbySuggestion: "Pagudpud or Bangui"
    },
    {
        name: "Bacarra",
        keywords: ['bacarra'],
        description: "A historic town known for its centuries-old church and bell tower, often called the 'Acrobatic Bell Tower of Asia'.",
        touristSpots: [
            { name: "Bacarra Domeless Bell Tower", description: "A ruined bell tower that has survived numerous earthquakes." }
        ],
        food: [
            { name: "Bacarra Chichacorn", description: "A popular local snack made of crispy fried corn kernels." }
        ],
        accommodations: [],
        souvenirs: [
            { name: "Bacarra Public Market", description: "This is the best place to buy local snacks like the town's famous **Chichacorn**. You'll get it fresh and at a good price." }
        ],
        nearbySuggestion: "Laoag City"
    },
    {
        name: "Badoc",
        keywords: ['badoc'],
        description: "The birthplace of the famous Filipino painter Juan Luna, Badoc is a coastal town with rich history and beautiful beaches.",
        touristSpots: [
            { name: "Juan Luna Shrine", description: "A reconstruction of the ancestral home of the painter Juan Luna." },
            { name: "La Virgen Milagrosa de Badoc Church", description: "A minor basilica and a major pilgrimage site, home to the miraculous statue of the Virgin Mary." },
            { name: "Badoc Island", description: "An emerging destination for beach lovers and snorkeling." }
        ],
        food: [
            { name: "Fresh Seafood", description: "Enjoy freshly caught seafood from the local eateries near the coast." },
            { name: "Tupig", description: "This grilled sticky rice cake is a common and beloved snack you can find from local vendors in Badoc." }
        ],
        accommodations: [],
        souvenirs: [
            { name: "Local Stalls near Badoc Church", description: "You can often find vendors selling religious items and local snacks like **Tupig**. For more variety, it's best to head to the public market." }
        ],
        nearbySuggestion: "Currimao or Laoag City"
    },
    {
        name: "Bangui",
        keywords: ['bangui'],
        description: "Famous for its iconic wind farm, Bangui offers a breathtaking view of wind turbines lined up along the coast.",
        touristSpots: [
            { name: "Bangui Windmills", description: "An iconic line of wind turbines that are a major source of renewable energy." }
        ],
        food: [
            //{ }
        ],
        accommodations: [
             { name: "Bangui Windmill Farm Stay", description: "Offers basic accommodations with a direct view of the windmills.", price: "₱1,500 - ₱2,500/night" },
             { name: "Windmill View Inn", description: "A simple guesthouse offering affordable rooms close to the wind farm.", price: "₱1,000 - ₱2,000/night" },
             { name: "18° North Camping Cafe and Diner", description: "Camping site in Bangui, with an onsite cafe/diner overlooking the windmills.", price: "₱1,000 - ₱5,000/night"}
        ],
        souvenirs: [
            { name: "Souvenir Shops at Bangui Windmills", description: "There are numerous stalls near the windmills selling miniature windmill keychains, t-shirts, and other trinkets. Prices are generally affordable." }
        ],
        nearbySuggestion: "Pagudpud"
    },
    {
        name: "Banna",
        keywords: ['banna', 'espiritu'],
        description: "An inland agricultural town known for its rice and corn production, and for its growing adventure tourism.",
        touristSpots: [
            { name: "Banna Zipline and Eco-Park", description: "Offers thrilling zipline rides and a relaxing escape in nature." }
        ],
        food: [],
        accommodations: [],
        souvenirs: [
            { name: "No specific souvenir shops", description: "For pasalubong, your best bet is to visit the nearby **Batac City Public Market** for a wider selection of local products and delicacies." }
        ],
        nearbySuggestion: "Batac City or Laoag City"
    },
    {
        name: "Burgos",
        keywords: ['burgos'],
        description: "A coastal town known for its dramatic landscapes, including pristine rock formations, and a historic lighthouse.",
        touristSpots: [
            { name: "Kapurpurawan Rock Formation", description: "Stunning white rock formations sculpted by wind and sea." },
            { name: "Cape Bojeador Lighthouse", description: "A historic lighthouse offering panoramic views of the South China Sea." },
            { name: "Burgos Wind Farm", description: "A newer wind farm with turbines spread across rolling hills, offering a different but equally stunning view." },
            { name: "Dragon Fruit Farms", description: "Visit a local farm (especially during the fruiting season) to taste fresh dragon fruit and see how it's grown." }
        ],
        food: [
            { name: "Fresh Seafood", description: "Enjoy freshly caught seafood from the local fishermen." }
        ],
        accommodations: [
            { name: "Keahana Resort", description: "A beachfront resort near the Kapurpurawan Rock Formation.", price: "₱2,000 - ₱4,000/night" },
            { name: "Bobon Beach Resort", description: "A serene resort with simple cottages right on the beach.", price: "₱1,500 - ₱3,000/night" }
        ],
        souvenirs: [
            { name: "Stalls near Cape Bojeador & Kapurpurawan", description: "You'll find small stalls selling refreshments, dragon fruit (in season), and simple souvenirs like keychains and t-shirts near the main tourist spots." }
        ],
        nearbySuggestion: "Pagudpud or Bangui"
    },
    {
        name: "Carasi",
        keywords: ['carasi'],
        description: "A landlocked municipality with a rugged terrain, offering opportunities for trekking and immersion in indigenous culture.",
        touristSpots: [
            { name: "Cultural Immersion with Isnag Community", description: "Arrange a visit through the local tourism office to learn about the traditions and way of life of the indigenous Isnag people." },
            { name: "Trekking to Scenic Viewpoints", description: "Explore the mountainous terrain and discover breathtaking views of the Carasi landscape." }
        ],
        food: [],
        accommodations: [],
        souvenirs: [
            { name: "No commercial souvenir shops", description: "The best souvenir from Carasi is the experience itself. However, for pasalubong, you would need to travel to **Laoag City**." }
        ],
        nearbySuggestion: "Laoag City"
    },
    {
        name: "Currimao",
        keywords: ['currimao'],
        description: "A coastal town with beautiful beaches and rock formations, perfect for a relaxing getaway.",
        touristSpots: [
            { name: "Pangil Beach", description: "Known for its coral rock formations and scenic coastline." }
        ],
        food: [
            { name: "Fresh Seafood", description: "Dine at the beachfront restaurants and enjoy the fresh catch of the day." }
        ],
        accommodations: [
            { name: "Sitio Remedios Heritage Village Resort", description: "A unique resort featuring restored heritage houses.", price: "₱5,000 - ₱10,000/night" },
            { name: "Playa Tropical Resort Hotel", description: "A Balinese-inspired resort with modern amenities and a beachfront view.", price: "₱3,500 - ₱7,000/night" },
            { name: "The Mini Suites - Ilocos Norte", description: "Modern, minimalist suites offering a comfortable stay.", price: "₱2,500 - ₱4,500/night" }
        ],
        souvenirs: [
            { name: "No major souvenir shops", description: "While some resorts may have small gift shops, for a better and cheaper selection of souvenirs, it is recommended to visit the public market in **Laoag City** or the shops in **Paoay**." }
        ],
        nearbySuggestion: null
    },
    {
        name: "Dingras",
        keywords: ['dingras'],
        description: "Known as the 'Rice Granary of Ilocos Norte,' Dingras is a vast agricultural plain with a rich history.",
        touristSpots: [
            { name: "Dingras Church Ruins", description: "The ruins of the largest Catholic church in Ilocos Norte." },
            { name: "Scenic Rice Paddies", description: "Drive through the town and enjoy the picturesque views of the vast rice fields, especially during planting or harvest season." }
        ],
        food: [],
        accommodations: [],
        souvenirs: [
            { name: "Dingras Public Market", description: "You can find fresh local produce here. For a wider range of pasalubong and handicrafts, visiting the nearby town of **Sarrat** or **Laoag City** is recommended." }
        ],
        nearbySuggestion: "Sarrat"
    },
    {
        name: "Dumalneg",
        keywords: ['dumalneg'],
        description: "A mountainous town that is home to the Isnag indigenous people and offers stunning natural landscapes.",
        touristSpots: [
             { name: "Dumalneg View Deck", description: "Offers panoramic views of the surrounding mountains and valleys." }
        ],
        food: [],
        accommodations: [],
        souvenirs: [
            { name: "No commercial souvenir shops", description: "Souvenir shopping is not common here. It is best to plan your shopping in larger towns like **Pagudpud** or **Laoag City**." }
        ],
        nearbySuggestion: "Pagudpud or Bangui"
    },
    {
        name: "Marcos",
        keywords: ['marcos'],
        description: "An agricultural town named after the late President Mariano Marcos, father of Ferdinand Marcos.",
        touristSpots: [
            { name: "Marcos Lake (Marcos Dam)", description: "A serene man-made lake that offers a peaceful spot for picnics and enjoying the view." }
        ],
        food: [],
        accommodations: [],
        souvenirs: [
            { name: "No specific souvenir shops", description: "For pasalubong and souvenirs, the nearby **Batac City** offers plenty of options, from food items to local crafts." }
        ],
        nearbySuggestion: "Batac City"
    },
    {
        name: "Nueva Era",
        keywords: ['nueva era'],
        description: "An eco-cultural destination known for its tribal communities and natural attractions.",
        touristSpots: [
            { name: "Nueva Era Eco-Cultural Park", description: "A park showcasing the culture of the Tingguian tribe and the natural beauty of the area." }
        ],
        food: [],
        accommodations: [],
        souvenirs: [
            { name: "Nueva Era Eco-Cultural Park Gift Shop", description: "The park may have a small selection of locally made crafts from the Tingguian community. For more variety, travel to **Laoag City**." }
        ],
        nearbySuggestion: "Banna"
    },
    {
        name: "Pagudpud",
        keywords: ['pagudpud'],
        description: "Often called the 'Boracay of the North,' Pagudpud is famous for its stunning white-sand beaches and crystal-clear waters.",
        touristSpots: [
            { name: "Saud Beach", description: "A long stretch of white sand beach perfect for swimming and relaxation." },
            { name: "Blue Lagoon (Maira-ira Beach)", description: "A picturesque cove with calm, turquoise waters." },
            { name: "Patapat Viaduct", description: "A scenic coastal bridge offering stunning views of the sea." },
            { name: "Kabigan Falls", description: "A beautiful waterfall reachable via a gentle trek through a forest." },
            { name: "Bantay Abot Cave", description: "A fascinating rock formation on the coast with a hole in the middle, offering a picturesque view of the sea." }
        ],
        food: [
            //{ name: "", description: ""},
            { name: "Wilac Foodhouse", description: "This charming eatery offers an array of delicious Ilocano dishes that are sure to satisfy your cravings without breaking the bank"},
            { name: "Fresh Seafood", description: "Enjoy the catch of the day at the various restaurants and eateries lining Saud Beach and Blue Lagoon." },
            { name: "Local Eateries (Carinderias)", description: "For a more authentic and budget-friendly meal, try the local carinderias in the town proper, serving classic Ilocano dishes." }
        ],
        accommodations: [
            { name: "Apo Idon Beach Hotel", description: "A stylish beach hotel with a blend of tropical and Mediterranean style", price: "₱5,000 - ₱9,000/night" },
            { name: "Pannzian Beach Resort", description: "A tranquil resort offering a more rustic and nature-oriented experience.", price: "₱3,000 - ₱6,000/night" },
            { name: "Casa Victoria Resort and Restaurant", description: "A budget-friendly option along Saud Beach.", price: "₱1,500 - ₱3,000/night" },
            { name: "Kingfisher Sand Sea Surf Resort", description: "A haven for kite surfers and water sports enthusiasts.", price: "₱2,500 - ₱5,000/night" },
            { name: "Evangeline Beach Resort", description: "A charming resort on Saud Beach known for its relaxed atmosphere.", price: "₱2,000 - ₱4,000/night" }
        ],
        souvenirs: [
            { name: "Stalls at Blue Lagoon & Saud Beach", description: "You'll find many stalls along the beachfront selling t-shirts, keychains, shell crafts, and other beach-themed souvenirs at very reasonable prices." }
        ],
        nearbySuggestion: null
    },
    {
        name: "Paoay",
        keywords: ['paoay'],
        description: "Home to the magnificent Paoay Church, this town is a blend of history, culture, and natural beauty, including the famous Paoay Sand Dunes.",
        touristSpots: [
            { name: "Paoay Church", description: "A UNESCO World Heritage site, famous for its massive buttresses and distinct baroque architecture." },
            { name: "Paoay Sand Dunes", description: "A vast desert-like landscape where you can enjoy thrilling 4x4 rides and sandboarding." },
            { name: "Malacañang of the North", description: "A former presidential residence, now a museum overlooking the Paoay Lake." }
        ],
        food: [
            { name: "Pinakbet Pizza", description: "An Ilocano twist on a classic. You can find this unique dish at local restaurants near Paoay Church." },
            { name: "Tupig", description: "A popular Ilocano snack made from glutinous rice flour, coconut milk, and molasses, wrapped in banana leaves and grilled over charcoal." }
        ],
        accommodations: [
            { name: "The Bellagio Hills Hotel and Restaurant", description: "A boutique hotel offering scenic views of Paoay Lake.", price: "₱3,000 - ₱5,000/night" },
            { name: "Veranda Suites and Restaurant", description: "A modern hotel with comfortable amenities, located near the town proper.", price: "₱2,500 - ₱4,500/night" }
        ],
        souvenirs: [
            { name: "Shops around Paoay Church", description: "The area surrounding the church is filled with shops selling Inabel woven products, pottery, miniature churches, and local snacks like Tupig. It's a one-stop shop for great souvenirs." }
        ],
        nearbySuggestion: "Laoay City"
    },
    {
        name: "Pasuquin",
        keywords: ['pasuquin'],
        description: "Pasuquin is a coastal town famous for its traditional salt-making industry and its delicious, crispy 'Biscocho.' It offers a glimpse into local industries and has some serene, less-crowded beaches.",
        touristSpots: [
            { name: "Pasuquin Salt Ponds", description: "Witness the traditional method of salt making, where sea water is evaporated in shallow ponds under the sun to produce high-quality sea salt." },
            { name: "Puyupuyan Beach (Sexy Beach)", description: "A quiet and beautiful stretch of coastline with fine gray sand, perfect for a relaxing swim away from the crowds." }
        ],
        food: [
            { name: "Pasuquin Biscocho", description: "A famous local delicacy. It's a crispy, twice-baked bread coated with butter and sugar. A must-try pasalubong, which you can get fresh from the famous Pasuquin Bakery." }
        ],
        accommodations: [],
        souvenirs: [
            { name: "Pasuquin Bakery", description: "The number one pasalubong spot! This is where you can buy the famous **Pasuquin Biscocho** directly. It's cheap, delicious, and authentic.", googleMapsLink: "placeholder" }
        ],
        nearbySuggestion: "Burgos or Laoag City"
    },
    {
        name: "Piddig",
        keywords: ['piddig'],
        description: "A historic town known for its role in the Basi Revolt and its beautiful, rolling hills.",
        touristSpots: [
            { name: "Basi Revolt Shrine", description: "A monument commemorating the 1807 Basi Revolt against the Spanish." },
            { name: "Explore Piddig's Rolling Hills", description: "Enjoy a scenic drive or walk through the town's picturesque green landscapes." }
        ],
        food: [
            { name: "Basi", description: "The traditional Ilocano sugarcane wine. Piddig is historically linked to this famous local beverage due to the Basi Revolt." }
        ],
        accommodations: [],
        souvenirs: [
            { name: "Local Markets", description: "You can buy bottles of locally made **Basi** (sugarcane wine) here. For other types of souvenirs, the nearby town of **Sarrat** or **Laoag City** would have more choices." }
        ],
        nearbySuggestion: "Sarrat"
    },
    {
        name: "Pinili",
        keywords: ['pinili'],
        description: "Known for its garlic production and as a town that fiercely resisted Japanese occupation during WWII. It is also a center for the traditional art of Inabel weaving.",
        touristSpots: [
            { name: "Pinili Garlic Arch", description: "A town arch decorated with garlic, showcasing their main product." },
            { name: "General Artemio Ricarte Shrine", description: "A historical site dedicated to the revolutionary general who retired in Pinili." },
            { name: "Abel Weaving Village", description: "Visit local weavers and see the intricate process of creating traditional Inabel textiles on handlooms. A great place to buy authentic woven products." }
        ],
        food: [
            { name: "Pinili Garlic", description: "Famous for its pungent and high-quality garlic." }
        ],
        accommodations: [],
        souvenirs: [
            { name: "Abel Weaving Village", description: "The best place to buy authentic and affordable **Inabel textiles**. You can purchase blankets, towels, and placemats directly from the weavers." }
        ],
        nearbySuggestion: "Currimao"
    },
    {
        name: "San Nicolas",
        keywords: ['san nicolas'],
        description: "A bustling commercial center and a town known for its traditional pottery-making, called 'Damili'.",
        touristSpots: [
            { name: "Robinsons Ilocos", description: "A major shopping mall in the province." },
            { name: "Damili Centers", description: "Workshops where you can see local artisans craft traditional terracotta pottery." }
        ],
        food: [
            { name: "Food Court at Robinsons Ilocos", description: "Offers a wide variety of local and national food chains in one convenient location, perfect for a quick and affordable meal while shopping.", googleMapsLink: "placeholder" },
            { name: "Various Restaurants at Robinsons Ilocos", description: "The mall hosts several popular sit-down restaurants and cafes, providing more dining options.", googleMapsLink: "placeholder" }
        ],
        accommodations: [
            { name: "Pamulinawen Hotel", description: "A well-known hotel offering comfortable rooms and function halls.", price: "₱2,000 - ₱4,000/night" }
        ],
        souvenirs: [
            { name: "Damili Pottery Centers", description: "Visit the workshops to buy terracotta pots, bricks, and souvenir items like mini-clay pots (banga) at very cheap prices, directly from the artisans." },
            { name: "Robinsons Ilocos", description: "The mall has a supermarket and department store with sections dedicated to local delicacies and pasalubong.", googleMapsLink: "placeholder" }
        ],
        nearbySuggestion: "Laoag City"
    },
    {
        name: "Sarrat",
        keywords: ['sarrat'],
        description: "The birthplace of President Ferdinand Marcos, Sarrat is a town rich in history with well-preserved ancestral houses.",
        touristSpots: [
            { name: "Sarrat Church (Santa Monica Parish)", description: "A massive, earthquake-baroque church with a 137-meter-long nave." },
            { name: "Marcos Birthplace", description: "The ancestral home where Ferdinand Marcos was born." }
        ],
        food: [
            { name: "Bocayo", description: "A sweet local candy made from grated coconut cooked in molasses or brown sugar." }
        ],
        accommodations: [],
        souvenirs: [
            { name: "Sarrat Public Market", description: "A good place to find local sweets like **Bocayo** and other Ilocano snacks. It's a more local shopping experience than a tourist-focused one." }
        ],
        nearbySuggestion: "Laoag City"
    },
    {
        name: "Solsona",
        keywords: ['solsona'],
        description: "An inland town that serves as a gateway to the Cordillera mountains, known for its natural springs and trekking spots.",
        touristSpots: [
            { name: "Garnaden Forest Park", description: "A nature park with waterfalls and hiking trails." },
            { name: "One-Degree Plateau", description: "A rising tourist spot offering a 'sea of clouds' experience and a great view of the sunrise, requires an early morning trek." }
        ],
        food: [],
        accommodations: [],
        souvenirs: [
            { name: "No specific souvenir shops", description: "Solsona is more of an eco-tourism destination. For souvenir shopping, it is best to visit the markets and shops in **Laoag City**." }
        ],
        nearbySuggestion: "Laoag City"
    },
    {
        name: "Vintar",
        keywords: ['vintar'],
        description: "A scenic town with the largest land area in Ilocos Norte, known for the Vintar Dam and its lush, green landscapes.",
        touristSpots: [
            { name: "Vintar Dam", description: "A large reservoir that offers opportunities for boating and picnicking." },
            { name: "Siwawer Eco-Tourism and Nature Park", description: "A nature park along the Vintar River, perfect for picnics, swimming, and enjoying the lush scenery." }
        ],
        food: [
             { name: "Vintar Longganisa", description: "A local version of the Ilocano sausage, known for its distinct flavor." },
             { name: "Royal Bibingka", description: "A special sticky rice cake (kakanin) that's baked and has a chewy, sweet, and savory flavor. A famous delicacy from Vintar." }
        ],
        accommodations: [],
        souvenirs: [
            { name: "Local Bakeries and Market", description: "The best souvenir from Vintar is its famous **Royal Bibingka**. You can buy this delicious rice cake from local bakeries in the town proper. The public market is also great for **Vintar Longganisa**." }
        ],
        nearbySuggestion: "Laoag City"
    }
];

const alternativeSuggestions: { [key: string]: { name: string; reason: string } } = {
    // Tourist Spots
    "Saud Beach": { name: "Pangil Beach in Currimao", reason: "a beautiful and less crowded coastline" },
    "Blue Lagoon (Maira-ira Beach)": { name: "Puyupuyan Beach in Pasuquin", reason: "a quieter and serene beach experience" },
    "Paoay Sand Dunes": { name: "La Paz Sand Dunes in Laoag", reason: "another fantastic spot for thrilling 4x4 rides and sandboarding" },
    "La Paz Sand Dunes": { name: "Paoay Sand Dunes", reason: "another fantastic spot for thrilling 4x4 rides and sandboarding" },
    "Kapurpurawan Rock Formation": { name: "Pangil Beach in Currimao", reason: "stunning coral rock formations along the coast" },
    "Cape Bojeador Lighthouse": { name: "Sinking Bell Tower in Laoag", reason: "another historic tower with a unique story" },
    // Locations (Towns/Cities)
    "Pagudpud": { name: "Currimao", reason: "beautiful beaches and heritage resorts with a more relaxed atmosphere" },
    "Paoay": { name: "Laoag City", reason: "a mix of historical sites like the Sinking Bell Tower and modern city amenities" }
};

const getHolidayInfo = (date: Date): string | null => {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // A simplified list of fixed-date major holidays in the Philippines.
    // Note: Holy Week, National Heroes Day, and other moving holidays are not included for simplicity.
    const holidays: { [key: string]: string } = {
        '1-1': 'New Year\'s Day',
        '4-9': 'Araw ng Kagitingan',
        '5-1': 'Labor Day',
        '6-12': 'Independence Day',
        '11-1': 'All Saints\' Day',
        '11-30': 'Bonifacio Day',
        '12-25': 'Christmas Day',
        '12-30': 'Rizal Day'
    };
    const dateString = `${month}-${day}`;
    return holidays[dateString] || null;
};

const App = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    if (isChatVisible) {
        setMessages([{
            author: Author.BOT,
            text: "Welcome to INtayon, your Ilocos Norte tour guide! How can I help you explore our beautiful province today? You can ask about tourist spots, food, or where to stay in any town.",
        }]);
    }
  }, [isChatVisible]);
  
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    return date.toLocaleString('en-US', options);
  };
  
  const generateBotResponse = (userInput: string, messages: Message[]): string => {
    const lowerInput = userInput.toLowerCase().trim();

    const generateMapLink = (query: string) => {
        const encodedQuery = encodeURIComponent(query);
        return `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;
    };

    // 1. Handle greetings
    if (/\b(hi|hello|hey|good day|good morning|good afternoon|good evening)\b/.test(lowerInput)) {
        return "Hello! I'm INtayon, your friendly guide to Ilocos Norte. How can I help you plan your trip today?";
    }

    // 2. Handle capability questions
    if (/\b(help|what can you do|what do you do|help me)\b/.test(lowerInput)) {
        return "I can help you explore Ilocos Norte! You can ask me about:\n\n*   **Tourist Spots** in a specific town.\n*   **Local Food** to try.\n*   **Places to Stay** (including price estimates).\n*   **Where to buy cheap souvenirs** and local products.\n*   **Transportation** questions like 'How do I get to Pagudpud from Laoag?'.\n\nWhen you ask about a specific place, I'll show you an **interactive map** right here in the chat! For example, try asking 'Tell me about Paoay Church'.";
    }

    // 3. Handle thank yous
    if (/\b(thanks|thank you|salamat)\b/.test(lowerInput)) {
        return "You're welcome! Is there anything else I can help you with for your Ilocos Norte adventure?";
    }

    // 4. Handle crowd level questions
    const wantsCrowdLevel = /\b(crowd|crowded|busy|peak|off-peak|people)\b/.test(lowerInput);
    if (wantsCrowdLevel) {
        let targetLocation: LocationInfo | undefined;
        let targetSpotName: string | undefined;

        const allSpots = ilocosNorteData.flatMap(location =>
            location.touristSpots.map(spot => ({ ...spot, locationName: location.name }))
        );

        for (const spot of allSpots) {
            if (lowerInput.includes(spot.name.toLowerCase())) {
                targetLocation = ilocosNorteData.find(loc => loc.name === spot.locationName);
                targetSpotName = spot.name;
                break;
            }
        }

        if (!targetLocation) {
            for (const location of ilocosNorteData) {
                if (location.keywords.some(kw => lowerInput.includes(kw))) {
                    targetLocation = location;
                    targetSpotName = location.name;
                    break;
                }
            }
        }

        if (targetLocation && targetSpotName) {
            const now = new Date();
            const day = now.getDay();
            const month = now.getMonth();
            const isWeekend = day === 0 || day === 6;
            const isPeakSeason = [2, 3, 4, 11].includes(month); // Mar, Apr, May, Dec
            const holiday = getHolidayInfo(now);

            let score = 1;
            const reasons: string[] = [];

            if (isWeekend) {
                score++;
                reasons.push("it's a weekend");
            }
            if (isPeakSeason) {
                score++;
                reasons.push("it's peak tourist season");
            }
            if (holiday) {
                score += 2;
                reasons.push(`it's ${holiday}`);
            }

            let crowdLevelText = "";
            let advice = "";
            let alternativeSuggestionText = "";

            if (score >= 3) {
                const alternative = alternativeSuggestions[targetSpotName];
                if (alternative) {
                    alternativeSuggestionText = `\n\n**Alternative suggestion:** If you'd like to avoid the crowds, you might enjoy **${alternative.name}**. It offers ${alternative.reason}.`;
                }
            }

            if (score <= 1) {
                crowdLevelText = "<span style='color: #28a745; font-weight: bold;'>not too busy</span>";
                advice = "It should be a great time to visit and explore at your own pace.";
            } else if (score === 2) {
                crowdLevelText = "<span style='color: #ffc107; font-weight: bold;'>moderately busy</span>";
                advice = "You can expect a comfortable number of visitors.";
            } else if (score === 3) {
                crowdLevelText = "<span style='color: #fd7e14; font-weight: bold;'>quite busy</span>";
                advice = "To have a more relaxed experience, I recommend visiting early in the morning on a weekday if possible.";
            } else {
                crowdLevelText = "<span style='color: #dc3545; font-weight: bold;'>very busy</span>";
                advice = "I strongly recommend visiting early in the morning to avoid the largest crowds, especially if you're visiting a popular spot.";
            }

            let reasonText = "";
            if (reasons.length > 0) {
                reasonText = ` This is because ${reasons.join(' and ')}.`;
            }

            return `Based on my estimates for today, **${targetSpotName}** is likely to be ${crowdLevelText}.${reasonText}\n\n**My advice:** ${advice}${alternativeSuggestionText}`;
        } else {
            return "I can try to estimate crowd levels for a specific tourist spot or town. Which place are you curious about?";
        }
    }
    
    // 5. Special handler for Empanada queries to override generic location matching
    if (/\b(empanada)\b/.test(lowerInput)) {
        // Handle queries comparing Batac and Laoag empanadas
        if (/\b(batac)\b/.test(lowerInput) && /\b(laoag)\b/.test(lowerInput)) {
            return "Both Batac and Laoag have delicious empanadas, but **Batac is famously considered the 'home' of the orange Ilocos empanada**. The **Batac Riverside Empanadahan** is the most iconic place to try it. Laoag also has great stalls, often with their own unique twist, but for the most 'authentic' experience, many people would point you to Batac.";
        }

        // Handle queries asking for empanadas *outside* of Batac, or specifically in Laoag.
        if ((/\b(outside|other than|except|not in)\b/.test(lowerInput) && /\b(batac)\b/.test(lowerInput)) || lowerInput.includes("laoag")) {
            return "While Batac is the most famous for empanadas, you can definitely find delicious versions in other places too! **Laoag City** is another excellent spot to try Ilocos empanada. You'll find many popular stalls around the city, especially near the Sinking Bell Tower and inside the Laoag City Public Market. Each stall often has its own slightly different recipe, so it's fun to compare!";
        }

        // Default to Batac for general empanada questions. This catches "empanada", "where is empanada", "empanada in batac".
        return "For the most authentic Ilocano empanada, you should head to **Batac City**! It's famous for the **Batac Riverside Empanadahan**, where you can watch them being made fresh. It's a crispy orange pastry filled with green papaya, monggo beans, longganisa, and a fresh egg. It's a must-try!";
    }

    // A flag to determine if the query is general (not tied to a specific location keyword).
    const isGeneralQuery = !ilocosNorteData.some(loc => loc.keywords.some(kw => lowerInput.includes(kw)));
    
    // A flag to determine if the query is a new query about a specific location.
    const isNewLocationQuery = ilocosNorteData.some(loc => loc.keywords.some(kw => lowerInput.includes(kw)));


    // 6. Handle contextual follow-up about nearby suggestions
    // This should ONLY run if the user's query is general and does NOT contain a new location keyword.
    if (!isNewLocationQuery && /\b(nearby|suggestion|that place|there|about it|tell me more)\b/.test(lowerInput)) {
        const lastBotMessage = [...messages].filter(m => m.author === Author.BOT).pop();

        if (lastBotMessage) {
            const suggestionMatch = lastBotMessage.text.match(/recommend combining your visit with a trip to the nearby \*\*(.*?)\*\*/);
            
            if (suggestionMatch && suggestionMatch[1]) {
                const nearbyTownName = suggestionMatch[1];
                const nearbyLocation = ilocosNorteData.find(loc => loc.name.toLowerCase() === nearbyTownName.toLowerCase());

                if (nearbyLocation) {
                    let response = `Of course! Here is some information about the nearby **${nearbyLocation.name}**:\n\n`;
                    response += `### About ${nearbyLocation.name}\n${nearbyLocation.description}\n\n`;

                    if (nearbyLocation.touristSpots.length > 0) {
                        response += `**Tourist Spots:**\n`;
                        nearbyLocation.touristSpots.forEach(spot => {
                            const mapQuery = `${spot.name}, ${nearbyLocation.name}, Ilocos Norte`;
                            const name = `[${spot.name}](${generateMapLink(mapQuery)})`;
                            response += `- **${name}:** ${spot.description}\n`;
                        });
                    } else {
                        response += `I don't have specific tourist spots listed for ${nearbyLocation.name}, but it's known for its general scenery and local culture!\n`;
                    }
                    response += `\n`;

                    if (nearbyLocation.food.length > 0) {
                        response += `**Local Food to Try:**\n`;
                        nearbyLocation.food.forEach(item => {
                            if ('googleMapsLink' in item) {
                                const mapQuery = `${item.name}, ${nearbyLocation.name}, Ilocos Norte`;
                                const name = `[${item.name}](${generateMapLink(mapQuery)})`;
                                response += `- **${name}:** ${item.description}\n`;
                            } else {
                                response += `- **${item.name}:** ${item.description}\n`;
                            }
                        });
                    } else {
                        response += `While there are no specific dishes listed for ${nearbyLocation.name}, you can always find delicious Ilocano staples like Bagnet and Longganisa nearby.\n`;
                    }
                    response += `\n`;

                    if (nearbyLocation.accommodations.length > 0) {
                        response += `**Places to Stay:**\n`;
                        nearbyLocation.accommodations.forEach(acc => {
                            const mapQuery = `${acc.name}, ${nearbyLocation.name}, Ilocos Norte`;
                            const name = `[${acc.name}](${generateMapLink(mapQuery)})`;
                            response += `- **${name}:** ${acc.description}`;
                            if (acc.price) {
                                response += ` (Est. Price: ${acc.price})\n`;
                            } else {
                                response += `\n`;
                            }
                        });
                    }
                    return response;
                }
            }
        }
    }

    // 7. Handle direct queries for specific spots
    const allSpots = ilocosNorteData.flatMap(location => [
        ...location.touristSpots.map(spot => ({ ...spot, locationName: location.name, type: 'Tourist Spot', isPlace: true })),
        ...location.food.map(item => ({ ...item, locationName: location.name, type: 'Food', isPlace: 'googleMapsLink' in item })),
        ...location.accommodations.map(acc => ({ ...acc, locationName: location.name, type: 'Accommodation', isPlace: true })),
        ...location.souvenirs.map(item => ({ ...item, locationName: location.name, type: 'Souvenir Spot', isPlace: 'googleMapsLink' in item }))
    ]);

    for (const spot of allSpots) {
        if (lowerInput.includes(spot.name.toLowerCase())) {
            let response = `Ah, you're asking about **${spot.name}**! It's a famous ${spot.type.toLowerCase()}`;
            if (spot.isPlace) {
                 response += ` in **${spot.locationName}**`;
            }
            response += `.\n\n${spot.description}`;

            if ('price' in spot && spot.price) {
                response += ` (Est. Price: ${spot.price})`;
            }
            response += `\n`;

            if (spot.isPlace) {
                const mapQuery = `${spot.name}, ${spot.locationName}, Ilocos Norte`;
                const encodedQuery = encodeURIComponent(mapQuery);
                response += ` <div class="map-embed-container">
                        <iframe
                            width="100%"
                            height="250"
                            style="border:0;"
                            loading="lazy"
                            allowfullscreen
                            src="https://maps.google.com/maps?q=${encodedQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed">
                        </iframe>
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodedQuery}" target="_blank" rel="noopener noreferrer" class="map-link">View on Google Maps</a>
                    </div>`;
            }
            return response;
        }
    }

    // 8. Handle very specific food queries that need to be prioritized (if no location is mentioned)
    if (isGeneralQuery && /\b(bagnet)\b/.test(lowerInput)) {
        return "You can find delicious **Bagnet** all over Ilocos Norte, especially in **Laoag City**. Many local restaurants and eateries feature it on their menu. While there isn't one single 'best' place, trying it at a popular local restaurant in Laoag is a great start. You can also buy it vacuum-sealed from pasalubong centers to take home.";
    }
    if (isGeneralQuery && /\b(biscocho)\b/.test(lowerInput)) {
        return "When you hear 'Biscocho' in Ilocos Norte, everyone thinks of **Pasuquin**! The **Pasuquin Bakery** is famous for its crispy, buttery biscocho, which is a perfect pasalubong (souvenir) to take home. It's a must-visit when you're in the area.";
    }

    // 9. Prioritize location-based logic
    for (const location of ilocosNorteData) {
        if (location.keywords.some(kw => lowerInput.includes(kw))) {
            const wantsLocation = /\b(where|location|map)\b/.test(lowerInput);
            const isSimpleLocationQuery = wantsLocation && !/\b(spot|food|eat|stay|hotel|accommodation|see|do|get|transport|commute|travel|itinerary|plan|souvenir|pasalubong|buy|shop)\b/.test(lowerInput);
            const isNegativeQuery = /\b(outside|other than|except|not in)\b/.test(lowerInput);

            // Handle negative queries first to override default behavior
            if (isNegativeQuery) {
                if (/\b(stay|hotel|accommodation)\b/.test(lowerInput)) {
                    return `Looking for a place to stay outside of **${location.name}**? I can help with that!\n\nFor a beach getaway, **Pagudpud** offers many beautiful resorts. For a quieter, more historic vibe, you could check out the heritage resorts in **Currimao** or hotels near Paoay Lake in **Paoay**.\n\nWhich kind of atmosphere are you looking for?`;
                }
                if (/\b(food|eat)\b/.test(lowerInput)) {
                    return `If you're looking for dining options outside of **${location.name}**, **Laoag City** offers the most diverse selection of restaurants. You can find everything from traditional Ilocano cuisine at places like Saramsam and La Preciosa to popular cafes and fast-food chains.`;
                }
            }
            
            if (isSimpleLocationQuery) {
                let response = `Here is the location of **${location.name}** on the map.`;
                const mapQuery = `${location.name}, Ilocos Norte`;
                const encodedQuery = encodeURIComponent(mapQuery);
                response += `<div class="map-embed-container">
                        <iframe
                            width="100%"
                            height="250"
                            style="border:0;"
                            loading="lazy"
                            allowfullscreen
                            src="https://maps.google.com/maps?q=${encodedQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed">
                        </iframe>
                        <a href="https://www.google.com/maps/search/?api=1&query=${encodedQuery}" target="_blank" rel="noopener noreferrer" class="map-link">View on Google Maps</a>
                    </div>`;
                 response += `\n\nWhat would you like to know about ${location.name}? You can ask about tourist spots, food, places to stay, or where to buy souvenirs.`;
                return response;
            }

            // Handle specific transportation questions related to this location FIRST
            if (/\b(transportation|get around|how to travel|commute|get to|tricycle|van|bus|jeepney|car rental|rent|vehicle|hire)\b/.test(lowerInput)) {
                if (location.name === "Pagudpud") {
                    return "In **Pagudpud**, the most common way to get around is by **hiring a tricycle** for a day tour. They can take you to all the famous spots like Saud Beach, Blue Lagoon, and the Patapat Viaduct. \n\nFor **car or van rentals**, you'll have more options in **Laoag City**. Many tourists rent a vehicle from Laoag for their entire Ilocos Norte trip, which gives them the flexibility to explore Pagudpud at their own pace.";
                }
                // Generic transport answer for other towns
                return `The main way to get around **${location.name}** is by **tricycle** for short distances. For traveling to other towns, you can usually find jeepneys or buses at a local terminal. \n\nIf you're looking for dedicated **car or van rentals**, your best bet is to check in **Laoag City**, which is the provincial hub for most rental services.`;
            }
            
            // Handle itinerary requests
            const wantsItinerary = /\b(itinerary|plan|day trip|schedule|one day|1 day)\b/.test(lowerInput);
            if (wantsItinerary) {
                // Special case for Pagudpud
                if (location.name === "Pagudpud") {
                    return "Of course! Here's a packed one-day itinerary for an amazing adventure in **Pagudpud**:\n\n" +
                           "**MORNING (8:00 AM - 12:00 PM): Northern Wonders**\n" +
                           "*   Start your day by visiting the stunning **Blue Lagoon (Maira-ira Beach)**. Its calm, turquoise waters are perfect for a morning swim.\n" +
                           "*   Just nearby, check out **Bantay Abot Cave**, a unique rock formation with a picturesque hole overlooking the sea.\n" +
                           "*   Drive along the scenic **Patapat Viaduct**, the famous coastal bridge offering breathtaking views.\n\n" +
                           "**LUNCH (12:00 PM - 1:00 PM)**\n" +
                           "*   Have lunch at one of the local restaurants in the Blue Lagoon or Saud Beach area.\n\n" +
                           "**AFTERNOON (1:00 PM - 5:00 PM): Falls & Beach**\n" +
                           "*   Take a refreshing trek to **Kabigan Falls**. It's an easy 30-minute walk through a beautiful forest leading to the waterfall.\n" +
                           "*   End your day relaxing on the long stretch of white sand at **Saud Beach**, often called the 'Boracay of the North.' It's perfect for watching the sunset.\n\n" +
                           "You can hire a local tricycle for a whole-day tour, and they'll take you to all these spots. Enjoy Pagudpud!";
                }

                // Special case for Paoay
                if (location.name === "Paoay") {
                    return "Absolutely! Paoay offers a perfect blend of history and adventure. Here's a suggested itinerary for a day trip:\n\n" +
                           "**MORNING (9:00 AM - 12:00 PM): History and Culture**\n" +
                           "*   Begin at the magnificent **Paoay Church**, a UNESCO World Heritage Site. Take your time to admire its incredible baroque architecture and massive buttresses.\n" +
                           "*   Next, visit the **Malacañang of the North**, the former presidential residence overlooking the serene Paoay Lake. Explore the grand rooms and historical exhibits.\n\n" +
                           "**LUNCH (12:00 PM - 1:30 PM)**\n" +
                           "*   Enjoy lunch at a restaurant near Paoay Church. This is the perfect opportunity to try the unique **Pinakbet Pizza**!\n\n" +
                           "**AFTERNOON (1:30 PM onwards): Desert Adventure**\n" +
                           "*   Head to the **Paoay Sand Dunes** for a thrilling experience. The best time to go is late afternoon when the sun is less intense.\n" +
                           "*   Hop on a 4x4 vehicle for a roller-coaster ride across the dunes and try sandboarding down the sandy slopes. It's an unforgettable adventure!\n\n" +
                           "This itinerary gives you a fantastic taste of what Paoay has to offer. Have a great time!";
                }
                
                // Special case for Burgos
                if (location.name === "Burgos") {
                     return "Great choice! Burgos is full of dramatic landscapes. Here's a suggested itinerary for a day in Burgos:\n\n" +
                           "**MORNING (9:00 AM - 12:00 PM): Natural Wonders**\n" +
                           "*   Start your day at the **Kapurpurawan Rock Formation**. The walk to the pristine white rocks is best done in the morning to avoid the midday heat. The view is absolutely stunning!\n" +
                           "*   Afterward, visit the nearby **Burgos Wind Farm**, where you can see the giant turbines up close against the rolling hills.\n\n" +
                           "**LUNCH (12:00 PM - 1:00 PM)**\n" +
                           "*   Have lunch at a local eatery in Burgos town proper. Enjoy some fresh seafood if it's available.\n\n" +
                           "**AFTERNOON (1:00 PM - 5:00 PM): History and Sunset**\n" +
                           "*   During the fruiting season, you can visit one of the **Dragon Fruit Farms** for a quick tour and tasting.\n" +
                           "*   End your day at the historic **Cape Bojeador Lighthouse**. Climb to the top for a panoramic view of the West Philippine Sea. It's one of the best spots in Ilocos Norte to watch the sunset!\n\n" +
                           "Enjoy the breathtaking scenery of Burgos!";
                }

                // Generic Itinerary Logic for other municipalities
                if (location.touristSpots.length < 2) {
                    let response = `While **${location.name}** is a lovely place to visit, it has fewer major attractions for a full-day itinerary. `;
                    if(location.touristSpots.length > 0){
                         response += `You can easily see its main spot, the **${location.touristSpots[0].name}**, in a short amount of time. `
                    }
                    response += `I would recommend combining your visit with a trip to the nearby **${location.nearbySuggestion || 'area'}** to make the most of your day!`;
                    return response;
                }

                const spots = [...location.touristSpots];
                let response = `Of course! Here's a suggested one-day itinerary for **${location.name}**:\n\n`;

                const morningSpot = spots.shift();
                response += `**MORNING**\n`;
                response += `*   Start your day at the **${morningSpot!.name}**. ${morningSpot!.description}\n\n`;

                response += `**LUNCH**\n`;
                if (location.food.length > 0) {
                    const foodSuggestion = location.food.map(f => `**${f.name}**`).join(' or ');
                    response += `*   Enjoy lunch at a local eatery and be sure to try some ${foodSuggestion}.\n\n`;
                } else {
                    response += `*   Find a local restaurant and enjoy some classic Ilocano dishes.\n\n`;
                }

                if (spots.length > 0) {
                    response += `**AFTERNOON**\n`;
                    response += `*   Spend your afternoon exploring the other key sights in the area:\n`;
                    spots.forEach(spot => {
                        response += `    *   **${spot.name}**\n`;
                    });
                    response += `\n`;
                }
                
                response += `This is a flexible plan, so feel free to explore at your own pace. Enjoy your trip to ${location.name}!`;

                return response;
            }

            let response = `### About ${location.name}\n${location.description}\n\n`;

            const wantsSpots = lowerInput.includes("spot") || lowerInput.includes("see") || lowerInput.includes("do");
            const wantsFood = lowerInput.includes("food") || lowerInput.includes("eat") || lowerInput.includes("coffee");
            const wantsAccommodation = lowerInput.includes("hotel") || lowerInput.includes("stay") || lowerInput.includes("accommodation");
            const wantsSouvenirs = /\b(souvenir|pasalubong|buy|shop|gift|cheap)\b/.test(lowerInput);
            
            const isSpecificQuery = wantsSpots || wantsFood || wantsAccommodation || wantsSouvenirs;

            if (wantsSpots || !isSpecificQuery) {
                if (location.touristSpots.length > 0) {
                    response += `**Tourist Spots:**\n`;
                    location.touristSpots.forEach(spot => {
                        const mapQuery = `${spot.name}, ${location.name}, Ilocos Norte`;
                        const name = `[${spot.name}](${generateMapLink(mapQuery)})`;
                        response += `- **${name}:** ${spot.description}\n`;
                    });
                } else {
                    response += `I don't have specific tourist spots listed for ${location.name}, but it's known for its general scenery and local culture!\n`;
                }
                 response += `\n`;
            }

            if (wantsFood || !isSpecificQuery) {
                if (location.food.length > 0) {
                    response += `**Local Food to Try:**\n`;
                    location.food.forEach(item => {
                         if ('googleMapsLink' in item) { // Check if it's a mappable place
                            const mapQuery = `${item.name}, ${location.name}, Ilocos Norte`;
                            const name = `[${item.name}](${generateMapLink(mapQuery)})`;
                            response += `- **${name}:** ${item.description}\n`;
                         } else {
                            response += `- **${item.name}:** ${item.description}\n`;
                         }
                    });
                } else {
                     response += `While there are no specific dishes listed for ${location.name}, you can always find delicious Ilocano staples like Bagnet and Longganisa nearby.\n`;
                }
                response += `\n`;
            }
            
            if (wantsAccommodation || (!isSpecificQuery && location.accommodations.length > 0)) {
                 if (wantsAccommodation) {
                    response = `Here are some places to stay in **${location.name}**:\n`;
                 } else {
                    response += `**Places to Stay:**\n`;
                 }
                
                if (location.accommodations.length > 0) {
                     location.accommodations.forEach(acc => {
                        const mapQuery = `${acc.name}, ${location.name}, Ilocos Norte`;
                        const name = `[${acc.name}](${generateMapLink(mapQuery)})`;
                        response += `- **${name}:** ${acc.description}`;
                        if (acc.price) {
                            response += ` (Est. Price: ${acc.price})\n`;
                        } else {
                            response += `\n`;
                        }
                    });
                    if (wantsAccommodation && location.nearbySuggestion) {
                        response += `\nFor more options, you might also want to check for hotels in nearby **${location.nearbySuggestion}**.\n`;
                    }
                } else {
                    response = `There are no major hotels listed directly in **${location.name}**. `;
                    if (location.nearbySuggestion) {
                        response += `I recommend looking for accommodations in the nearby town of **${location.nearbySuggestion}**, which has more options.`;
                    }
                }
            }
            
            if (wantsSouvenirs || !isSpecificQuery) {
                if (wantsSouvenirs) {
                    response = `Here are some great spots for cheap souvenirs and local products in **${location.name}**:\n\n`;
                } else {
                    response += `**Where to Buy Souvenirs:**\n`;
                }
            
                if (location.souvenirs.length > 0) {
                    location.souvenirs.forEach(item => {
                        if ('googleMapsLink' in item) {
                            const mapQuery = `${item.name}, ${location.name}, Ilocos Norte`;
                            const name = `[${item.name}](${generateMapLink(mapQuery)})`;
                            response += `- **${name}:** ${item.description}\n`;
                        } else {
                            response += `- **${item.name}:** ${item.description}\n`;
                        }
                    });
                    if (!wantsSouvenirs) {
                        response += `\n`;
                    }
                }
            }

            return response;
        }
    }

    // Handle "outside Ilocos Norte" queries
    if (/\b(outside|other than|beyond|not in|near)\b/.test(lowerInput) && /\b(ilocos norte)\b/.test(lowerInput)) {
        return "I'm sorry, my knowledge is currently focused only on the beautiful province of Ilocos Norte. I can't provide information about places outside of it. Is there a place within Ilocos Norte you would like to know about?";
    }

    // Handle general accommodation question if no location is specified
    if (isGeneralQuery && /\b(stay|hotel|accommodation)\b/.test(lowerInput)) {
        return "I can certainly help you find a place to stay! To give you the best recommendations, could you tell me which city or municipality in Ilocos Norte you're interested in? For example, you can ask, 'Where can I stay in Pagudpud?'.";
    }

    // Handle general itinerary question if no location is specified
    if (isGeneralQuery && /\b(itinerary|plan|day trip|schedule|one day|1 day)\b/.test(lowerInput)) {
        return "Of course! I can help with that. To give you the best plan, could you tell me which city or municipality in Ilocos Norte you'd like an itinerary for? For example, you can ask 'Create a one-day plan for Pagudpud'.";
    }

    // 10. Handle general food/dietary/pasalubong queries
    const foodKeywords = /\b(food|eat|dish|cuisine|pastry|snack|kakanin|delicacy|vegetarian|vegan|halal|pasalubong|souvenir|chichacorn|cornick|biscocho|longganisa|coffee)\b/;
    if (isGeneralQuery && foodKeywords.test(lowerInput)) {
        // Pastry/Snack questions
        if (/\b(pastry|snack|kakanin|delicacy)\b/.test(lowerInput) && !/\b(empanada)\b/.test(lowerInput)) {
            return "Beyond the famous Empanada, Ilocos Norte has several delicious local pastries and delicacies, often called 'kakanin' (rice cakes). Here are a few notable ones:\n\n" +
                   "*   **Royal Bibingka:** A must-try from **Vintar**. It's a chewy and rich baked sticky rice cake.\n" +
                   "*   **Tupig:** A grilled sticky rice snack wrapped in banana leaves. You'll find delicious versions in **Paoay** and **Badoc**.\n" +
                   "*   **Bocayo:** A sweet coconut candy, a specialty of **Sarrat**.\n\n" +
                   "Keep an eye out for local vendors as you travel, as they often sell the most authentic treats.";
        }
        // Pasalubong questions
        if (/\b(pasalubong|souvenir|bring home|chichacorn|cornick|biscocho)\b/.test(lowerInput) || (/\b(buy)\b/.test(lowerInput) && /\b(longganisa)\b/.test(lowerInput))) {
            return "Ilocos Norte is famous for its delicious pasalubong! Here are the top items to bring home:\n\n" +
                   "*   **Chichacorn/Cornick:** A crunchy and savory corn snack. A very popular brand is 'Ilocos Chichacorn'.\n" +
                   "*   **Biscocho:** The best ones are from **Pasuquin Bakery**. They are crispy and buttery.\n" +
                   "*   **Ilocos Longganisa:** The famous garlic-infused sausage. Best bought from public markets in Laoag.\n" +
                   "*   **Bagnet:** You can buy vacuum-sealed packs that are ready to travel.\n" +
                   "*   **Ilocos Garlic:** The province is known for its pungent, high-quality garlic.\n\n" +
                   "You can find these at **public markets** (like in Laoag and Batac) and dedicated **pasalubong centers** scattered along the main highways.";
        }
        // Dietary restrictions
        if (/\b(vegetarian|vegan)\b/.test(lowerInput)) {
            return "Ilocano cuisine is quite meat-heavy, but you can find vegetarian options! Look for:\n\n" +
                   "*   **Poqui-poqui:** A classic Ilocano dish made from grilled eggplants, tomatoes, onions, and scrambled eggs. It's delicious and widely available.\n" +
                   "*   **Pinakbet:** This is a vegetable stew. You'll need to request it **without meat (bagnet) and bagoong (shrimp paste)**. Many restaurants can accommodate this.\n\n" +
                   "Always communicate your dietary needs clearly, as many vegetable dishes are traditionally prepared with meat or fish paste.";
        }
        if (/\b(halal)\b/.test(lowerInput)) {
            return "Finding certified Halal restaurants in Ilocos Norte can be challenging as there are very few, if any. Your best options would be:\n\n" +
                   "*   **Focus on seafood restaurants.**\n" +
                   "*   **Look for vegetarian options** like Poqui-poqui.\n" +
                   "*   **Communicate your dietary restrictions clearly** with the restaurant staff when ordering.\n\n" +
                   "It's recommended to do some specific research for Halal-friendly eateries closer to your travel dates, as availability can change.";
        }
        // General food question - CATCH-ALL for general food queries. This is intentionally broad.
        if (/\b(food|foods|eat|dish|dishes|cuisine)\b/.test(lowerInput)) {
            const empanadahanMapQuery = encodeURIComponent(`Batac Riverside Empanadahan, Batac City, Ilocos Norte`);
            const empanadahanLink = `https://www.google.com/maps/search/?api=1&query=${empanadahanMapQuery}`;
            return "You're in for a culinary adventure! Ilocos Norte boasts some of the most iconic and flavorful dishes in the Philippines. Here are the absolute must-haves for your trip:\n\n" +
                   "### Top 5 Must-Try Dishes\n" +
                   "1.  **Bagnet:** The king of Ilocano cuisine! It's a deep-fried crispy pork belly with a crunchy skin and succulent meat. It's a truly indulgent treat.\n" +
                   "    *   **Where to find it:** Laoag City is a great place to try it, but you'll find it in most authentic Ilocano restaurants across the province.\n\n" +
                   "2.  **Ilocos Empanada:** A signature street food snack. This vibrant orange pastry is filled with green papaya, monggo beans, Ilocos longganisa, and a whole egg, then deep-fried to crispy perfection. Don't forget the 'sukang Iloko' (local vinegar) for dipping!\n" +
                   `    *   **Where to find it:** **Batac City** is the undisputed home of the best empanadas, especially at the [**Batac Riverside Empanadahan**](${empanadahanLink}).\n\n` +
                   "3.  **Ilocos Longganisa:** A local garlic sausage that's small in size but huge in flavor. It has a distinctively savory and slightly sour taste that's perfect for breakfast with fried rice and egg (Longsilog).\n" +
                   "    *   **Where to find it:** The Laoag Public Market is a fantastic place to try fresh ones and buy some to take home.\n\n" +
                   "4.  **Pinakbet:** The authentic Ilocano vegetable stew. It's made with local vegetables like bitter melon, eggplant, and okra, and flavored with 'bagoong' (fermented fish paste). The local version is often simpler and more intense than what you find elsewhere.\n" +
                   "    *   **Where to find it:** Local eateries (carinderias) often serve the most authentic and delicious versions.\n\n" +
                   "5.  **Poqui-poqui:** A simple but delicious dish made from grilled eggplants, tomatoes, onions, and scrambled eggs. It's a perfect vegetarian option or a side dish for bagnet.\n" +
                   "    *   **Where to find it:** It's a staple on the menu of almost every Ilocano restaurant.";
        }
    }
    
    // Handle Cultural Product Queries
    if (isGeneralQuery && /\b(inabel|abel iloco|abel|woven|textile)\b/.test(lowerInput)) {
        return "Ah, you're asking about one of Ilocos Norte's most treasured cultural products! **Inabel** (also called Abel Iloco) is a traditional handwoven textile known for its beautiful, intricate designs and incredible durability.\n\n" +
               "It's a very significant part of Ilocano heritage. Here's where you can experience it:\n\n" +
               "*   **Pinili:** This town is particularly famous for its community of master weavers. You can visit the **Abel Weaving Village** to see the traditional process on handlooms and buy authentic products directly from the artisans.\n" +
               "*   **Paoay & San Nicolas:** You can also find weaving centers in these towns.\n" +
               "*   **Laoag City Market & Pasalubong Centers:** For a wide variety of finished products like blankets, table runners, and clothing, the public markets and souvenir shops are great places to look.\n\n" +
               "Buying Inabel is a wonderful way to support local artisans and bring home a truly unique piece of Ilocos Norte.";
    }

    if (isGeneralQuery && /\b(pottery|damili|clay pot|terracotta|banga)\b/.test(lowerInput)) {
        return "You're asking about a very important local craft! Ilocos Norte is known for its traditional pottery, called **Damili**.\n\n" +
               "This is the art of creating terracotta (red clay) products by hand. The craft has been passed down through generations.\n\n" +
               "*   **Where to find it:** The undisputed center for Damili is the town of **San Nicolas**. You can visit **Damili Centers** where you can see local artisans skillfully shape the clay on a potter's wheel.\n" +
               "*   **What to see:** You can buy all sorts of items, from traditional cooking pots ('banga') and water jugs to decorative souvenirs. Some workshops even let you try making your own pot!\n\n" +
               "It's a wonderful cultural experience and a great place to get authentic, handmade souvenirs.";
    }

    if (isGeneralQuery && /\b(wine|basi|bugnay|inabel|abel|pottery|damili)\b/.test(lowerInput)) {
        if (/\b(wine)\b/.test(lowerInput) && !/\b(basi|sugarcane wine|bugnay)\b/.test(lowerInput)) {
            return "Ilocos Norte has a couple of unique local wines you should definitely try:\n\n" +
                "1.  **Basi (Sugarcane Wine):** This is the most famous and traditional Ilocano beverage. It's a wine made from fermented sugarcane juice. It's historically significant (it even caused the Basi Revolt of 1807 in **Piddig**!) and you can find it in markets and souvenir shops throughout the province.\n\n" +
                "2.  **Bugnay Wine:** A sweet and fruity wine made from the local 'bugnay' berries. It's a specialty of the mountainous town of **Adams**. If you visit Adams, it's a must-try local product.\n\n" +
                "So, if you're looking for something traditional and widely available, go for **Basi**. If you're up for an adventure and a unique fruit wine, look for **Bugnay Wine** from Adams!";
        }

        if (/\b(basi|sugarcane wine)\b/.test(lowerInput)) {
            return "**Basi** is the traditional Ilocano sugarcane wine, a famous and historic local beverage. It's made by fermenting sugarcane juice and has a unique, slightly sweet and tangy flavor.\n\n" +
                "It's so important to Ilocano culture that it even sparked the **Basi Revolt of 1807** when the Spanish tried to monopolize its production! You can visit a shrine for this event in **Piddig**.\n\n" +
                "You can buy bottles of Basi at local markets, wineries, and pasalubong centers throughout the province. It's a great souvenir to experience the taste of Ilocos Norte.";
        }

        if (/\b(bugnay|bugnay wine)\b/.test(lowerInput)) {
            return "**Bugnay Wine** is a unique and delicious fruit wine made from the local 'bugnay' berries, which are small, tart, and red. It's a specialty of the mountainous town of **Adams**.\n\n" +
                "It has a sweet and slightly tangy flavor, similar to a cherry or cranberry wine. It's a perfect souvenir if you're looking for something truly local and unique to the region.\n\n" +
                "The best place to get it is directly from local producers in Adams. If you visit the town, you can ask your host or the tourism office where to buy it for the most authentic experience.";
        }
    }

    // 11. Handle general Ilocos Norte questions
    if (isGeneralQuery && lowerInput.includes("ilocos norte")) {
        return "Ilocos Norte is a beautiful province in the Philippines known for its stunning beaches, historical landmarks, and unique culture. Some of the most popular places to visit are Laoag City, Pagudpud for its beaches, and Paoay for the famous Paoay Church. Which area are you interested in exploring first?";
    }

    // 12. Handle questions about maps (if a specific town isn't mentioned)
    if (isGeneralQuery && /\b(map|maps|google maps|location)\b/.test(lowerInput)) {
        return "Yes, I can provide Google Maps links for specific locations! Just ask me about a tourist spot, restaurant, or hotel in any town in Ilocos Norte, and I'll do my best to give you the location to help you navigate.";
    }

    // 13. General Travel FAQs
    if (isGeneralQuery && /\b(top spots|must-see|highlights|famous places|must visit|where to travel|where to go)\b/.test(lowerInput)) {
        return "Ilocos Norte is packed with amazing sights! The absolute must-visits are:\n\n*   **Pagudpud Beaches:** Saud Beach and Blue Lagoon for stunning white sand.\n*   **Paoay Church:** A UNESCO World Heritage site with incredible architecture.\n*   **Bangui Windmills:** The iconic wind turbines along the coast.\n*   **Kapurpurawan Rock Formation:** Breathtaking white rock formations in Burgos.\n*   **La Paz Sand Dunes:** For a thrilling 4x4 ride and sandboarding experience.";
    }

    if (/\b(how many days|how long|duration|ideal trip)\b/.test(lowerInput)) {
        return "A **3 to 4-day trip** is ideal to cover the main highlights of Ilocos Norte without rushing. This gives you enough time to explore:\n\n*   **Day 1:** The northern coast (Pagudpud, Bangui, Burgos).\n*   **Day 2:** The central area (Laoag, Paoay, Batac).\n*   **Day 3:** A mix of culture, food, and maybe some souvenir shopping.";
    }

    if (/\b(best time|when to go|best season|weather)\b/.test(lowerInput)) {
        return "The best time to visit Ilocos Norte is during the **dry season, from November to May**. The weather is generally sunny and perfect for beaches and sightseeing. The summer months of March to May can be quite hot, so be prepared!";
    }

    if (/\b(safe|solo traveler|alone)\b/.test(lowerInput)) {
        return "Yes, Ilocos Norte is generally considered **safe for solo travelers**. Ilocanos are known for their hospitality. Like anywhere, always practice standard safety precautions: be aware of your surroundings, inform someone of your itinerary, and secure your belongings.";
    }
    
    if (/\b(how far|distance from manila|travel time)\b/.test(lowerInput) && !(/\b(pagudpud)\b/.test(lowerInput) && /\b(laoag)\b/.test(lowerInput))) {
        return "Ilocos Norte is about **480 kilometers (300 miles)** north of Manila. Here's how you can get there:\n\n*   **By Bus:** 10-12 hours.\n*   **By Car:** 8-10 hours.\n*   **By Plane:** The fastest way! About a 1-hour flight from Manila to Laoag International Airport.";
    }

    if (/\b(budget|how much|cost|expenses)\b/.test(lowerInput) && !/\b(airport)\b/.test(lowerInput)) {
        return "For a 3-day trip, a budget of **₱5,000 to ₱8,000 per person** (excluding airfare) is a good estimate. This can cover:\n\n*   Mid-range accommodations.\n*   Food (lots of delicious, affordable options!).\n*   Local transportation and tour fees.\n\nThis can be adjusted based on your travel style, of course!";
    }
    
    if (/\b(guided tours|tour packages|tour guide)\b/.test(lowerInput)) {
        return "Absolutely! Many guided tours are available. You can arrange them through your hotel or find local tour operators in Laoag. A very popular option is to **hire a tricycle or van for a day tour**. They often have fixed routes covering the main spots in an area (like a Pagudpud tour or a Laoag-Paoay tour).";
    }

    if (/\b(cash|credit card|payment|atm)\b/.test(lowerInput)) {
        return "It's highly recommended to **bring enough cash**. While major hotels and some restaurants in Laoag accept credit cards, most smaller eateries, local shops, and transportation (like tricycles) are cash-only. ATMs are available in major towns like Laoag, Batac, and San Nicolas, but can be hard to find in remote areas.";
    }

    if (/\b(wi-fi|wifi|mobile data|internet|connection|signal)\b/.test(lowerInput)) {
        return "Mobile data (Globe/Smart) is generally reliable in cities and major tourist spots. Wi-Fi is common in hotels and cafes but can be slow. In more remote areas like Adams or parts of Pagudpud, the signal can be weak, so it's a good chance to disconnect and enjoy the scenery!";
    }

    if (/\b(pack|packing|what to bring|what to wear|clothes)\b/.test(lowerInput)) {
        return "Planning what to pack is a great idea! Ilocos Norte has a tropical climate and diverse activities. Here’s a handy packing list to help you prepare:\n\n" +
               "**Clothing:**\n" +
               "*   **Lightweight & Breathable Clothes:** Think cotton t-shirts, tank tops, shorts, and light dresses. The weather is usually hot and humid.\n" +
               "*   **Swimsuit:** A must for the beautiful beaches of Pagudpud and Currimao!\n" +
               "*   **A Light Jacket or Cardigan:** For cooler evenings or if you get cold in air-conditioned buses and establishments.\n" +
               "*   **Respectful Attire:** A scarf, shawl, or pants/long skirt to cover your shoulders and knees when visiting churches like the Paoay Church.\n\n" +
               "**Footwear:**\n" +
               "*   **Comfortable Sandals or Flip-Flops:** Perfect for the beach and casual walks.\n" +
               "*   **Sturdy Walking Shoes or Sneakers:** Highly recommended for exploring towns, trekking to waterfalls (like Kabigan Falls), or for the 4x4 ride at the sand dunes.\n\n" +
               "**Health & Safety:**\n" +
               "*   **Sun Protection:** High-SPF sunscreen, sunglasses, and a wide-brimmed hat or cap are essential.\n" +
               "*   **Insect Repellent:** Especially useful if you're visiting natural areas or staying near the beach in the evening.\n" +
               "*   **Basic First-Aid Kit:** Include band-aids, pain relievers, and any personal medications.\n\n" +
               "**Essentials:**\n" +
               "*   **Reusable Water Bottle:** Stay hydrated and be eco-friendly.\n" +
               "*   **Power Bank/Portable Charger:** To keep your devices charged while you're out exploring.\n" +
               "*   **Camera:** To capture all the beautiful scenery!\n" +
               "*   **Cash:** Many local eateries, tricycle drivers, and small shops do not accept credit cards, so having enough cash is very important.\n\n" +
               "Have a fantastic and well-prepared trip!";
    }

    // 14. Handle Transportation FAQs
    if (/\b(transportation|get around|how to travel|commute|commutes|get to|tricycle|fare|van|bus|jeepney|car rental|travel time|how long|rent|hire|vehicle)\b/.test(lowerInput)) {
        // Specific query: "North Coast Adventure" commute
        if (/\b(north coast adventure)\b/.test(lowerInput)) {
            return "That's a great choice for a day trip! The 'North Coast Adventure' covers spots in Burgos, Bangui, and Pagudpud, which are located one after another along the main highway.\n\n" +
                   "The **best and most common way** to do this tour is by **hiring a private vehicle for the day**:\n\n" +
                   "*   **Tricycle Tour:** If you're a solo traveler or a pair, you can hire a tricycle from Burgos or Pagudpud. They have standard tour rates that cover all these spots.\n" +
                   "*   **Van Rental:** For a more comfortable ride, especially for groups, renting a van with a driver from Laoag City is the ideal option. This gives you the most flexibility.\n\n" +
                   "There isn't a single bus or jeepney that will conveniently hop between all these specific tourist spots, so a private hire is definitely the way to go. Enjoy the amazing views!";
        }
        // Specific travel time query
        if (/\b(travel time|how long)\b/.test(lowerInput) && /\b(pagudpud)\b/.test(lowerInput) && /\b(laoag)\b/.test(lowerInput)) {
            return "The travel time between Laoag and Pagudpud is typically **1.5 to 2 hours** by bus or car, depending on traffic and stops along the way.";
        }
        // Specific route: Pagudpud from Laoag
        if (/\b(pagudpud)\b/.test(lowerInput) && /\b(laoag)\b/.test(lowerInput)) {
            return "To get to Pagudpud from Laoag, you have a few options:\n\n" +
                   "*   **By Bus:** This is the most common and budget-friendly way. Buses heading to Cagayan pass through Pagudpud. You can catch one at the Laoag bus terminal. Travel time is about **1.5 to 2 hours**.\n" +
                   "*   **By Van (UV Express):** Faster than the bus, these vans also operate from the terminal and can take around **1 to 1.5 hours**.\n" +
                   "*   **By Hired Tricycle/Van:** You can hire a private vehicle for a day tour that includes Pagudpud and other northern spots. This offers the most flexibility.";
        }
        // Specific spot: Paoay Church
        if (/\b(paoay church)\b/.test(lowerInput) && /\b(commute|get to)\b/.test(lowerInput)) {
            return "To commute to Paoay Church:\n\n" +
                   "*   **From Laoag:** Take a jeepney bound for Paoay from the terminal near the provincial capitol. Ask the driver to drop you off at the church. It's a well-known stop.\n" +
                   "*   **Within Paoay:** You can easily hire a tricycle to take you directly to the church from anywhere in the Paoay town proper.";
        }
        // Specific spot: Kapurpurawan Rock Formation
        if (/\b(kapurpurawan)\b/.test(lowerInput) && /\b(public transport|commute)\b/.test(lowerInput)) {
            return "Getting to Kapurpurawan Rock Formation via public transport can be challenging. Your best bet is to:\n\n" +
                   "1.  Take a bus from Laoag heading towards Pagudpud or Burgos.\n" +
                   "2.  Ask to be dropped off at the junction leading to the rock formation in Burgos.\n" +
                   "3.  From the main highway, you'll need to hire a **tricycle** to take you the rest of the way to the site, which is a few kilometers in. It's highly recommended to arrange for the same tricycle to wait for you for your return trip.";
        }
        // Fare estimate: Laoag Airport
        if (/\b(fare|how much|cost)\b/.test(lowerInput) && /\b(airport)\b/.test(lowerInput)) {
            return "The fare from Laoag International Airport to the city proper can vary:\n\n" +
                   "*   **By Tricycle:** This is the most common option. Expect to pay around **₱150 - ₱250** (this is an estimate, it's always good to agree on the price beforehand).\n" +
                   "*   **By Van/Taxi:** There might be vans or taxis available which would cost more.";
        }
        // How to hire/rent vehicles
        const wantsToHireVehicle = /\b(hire|rent)\b/.test(lowerInput) && /\b(vehicle|car|van)\b/.test(lowerInput);
        if (wantsToHireVehicle) {
            return "Hiring a vehicle is a great way to explore Ilocos Norte at your own pace! Here’s how you can do it:\n\n" +
                   "**Where to Hire:**\n" +
                   "*   **Laoag City** is the main hub for vehicle rentals. You'll find the most options here, from small cars to large tourist vans.\n\n" +
                   "**How to Hire:**\n" +
                   "*   **Rental Agencies:** There are several local car and van rental agencies in Laoag. You can often find them online or through their Facebook pages. It's best to book in advance, especially during peak season.\n" +
                   "*   **Ask Your Hotel:** Your hotel's front desk can be a great resource. They often have partnerships with trusted local tour operators and can help you arrange a rental, sometimes with a driver.\n" +
                   "*   **Laoag International Airport:** You may find rental services available upon arrival at the airport.\n\n" +
                   "**Types of Rentals:**\n" +
                   "*   **Self-Drive (Car Rental):** If you're comfortable driving, you can rent a car. Make sure you have your driver's license ready.\n" +
                   "*   **Van with Driver:** This is the most popular option for tourists. You get a van for a day (or multiple days) and the driver often acts as a knowledgeable guide, taking you to all the best spots. This is highly recommended for a hassle-free experience.";
        }
        // Availability: Tricycles
        if (/\b(tricycle)\b/.test(lowerInput)) {
            return "Yes, tricycles are the primary mode of short-distance transportation within towns and are readily available, especially near major attractions, town plazas, and terminals. They are perfect for getting around a specific municipality.";
        }
        
        // Default transportation question
        return "Getting around Ilocos Norte is part of the adventure! Here are your options:\n\n*   **Tricycles:** Best for short trips within towns.\n*   **Jeepneys & Buses:** Great for traveling between different towns.\n*   **Van/Car Rental:** Perfect for groups or families wanting convenience.\n*   **Hire a Tricycle/Van for a Day:** The most common way tourists explore. You can hire one for a fixed price to take you to all the spots on a tour route.";
    }

    // 15. Handle recommendation requests
    if (isGeneralQuery && /\b(recommend|suggest|your favorite|what should i do)\b/.test(lowerInput)) {
        return "If you're looking for a truly memorable Ilocos Norte experience, I'd recommend the **'North Coast Adventure'**!\n\n" +
               "1.  **Morning:** Start at the **Kapurpurawan Rock Formation** in Burgos. The sight of the stunning white rocks against the deep blue sea is breathtaking.\n" +
               "2.  **Mid-day:** Head over to the iconic **Bangui Windmills**. Walking along the shore with those giant turbines is an experience you won't forget.\n" +
               "3.  **Afternoon:** End your day relaxing on the pristine white sands of **Saud Beach** in Pagudpud, often called the 'Boracay of the North.'\n\n" +
               "This route gives you a perfect blend of natural wonders, iconic landmarks, and world-class beaches. Does that sound like a good plan?";
    }

    // 16. Fallback message
    return "I'm sorry, I'm not sure how to answer that. You can ask me about tourist spots, food, or places to stay in a specific city or municipality in Ilocos Norte, like 'What are the tourist spots in Pagudpud?' or 'Where to eat in Laoag?'.";
  };


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { author: Author.USER, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Simulate bot thinking time and generate response
    setTimeout(() => {
        const botText = generateBotResponse(input, messages);
        const botMessage: Message = {
            author: Author.BOT,
            text: botText,
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
    }, 1000);
  };

  if (!isChatVisible) {
    return (
      <div className="landing-container">
        <div className="landing-content">
          <div className="landing-header">
            <img src="/img/intayon-logo.png" alt="INtayon Logo" className="logo-landing" />
            <h1 className="landing-title">INtayon</h1>
          </div>
          <p className="landing-subtitle">Experience Ilocos Better</p>
          <button className="explore-button" onClick={() => setIsChatVisible(true)}>
            Start Exploring
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
            <img src="/img/intayon-logo.png" alt="Bot" className="logo-chat" />
            <div>
                <h2>INtayon Chatbot</h2>
                <div className="status">
                    <span className="status-dot"></span>
                    Active Now
                </div>
            </div>
        </div>
        <div className="header-right">
            <div className="date-time">{formatDateTime(currentDateTime)}</div>
            <button className="exit-button" onClick={() => setIsChatVisible(false)}>Exit</button>
        </div>
      </div>
      <div className="chat-box" ref={chatBoxRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.author}`}>
            <div className="message-icon">
                <img src={msg.author === Author.BOT ? "/img/intayon-logo.png" : "/img/user.png"} alt={`${msg.author} icon`} />
            </div>
            <div
              className="message-content"
              dangerouslySetInnerHTML={{ __html: marked(msg.text) }}
            />
          </div>
        ))}
        {isLoading && (
            <div className="message bot">
                <div className="message-icon">
                    <img src="/img/intayon-logo.png" alt="Bot icon" />
                </div>
                <div className="message-content">
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
          </div>
        )}
      </div>
      <div className="chat-footer">
        <form className="chat-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Ilocos Norte..."
            aria-label="Your message"
          />
          <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
            </svg>
          </button>
        </form>
        <p className="footer-disclaimer">INtayon is an AI assistant. Information may not be 100% accurate.</p>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
