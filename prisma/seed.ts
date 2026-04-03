import {
    generateRandomFeatures,
    generateRandomProductDesc,
    generateRandomProductDetails,
} from "./helpers";

import { prisma } from "@/lib/prisma";

const prebuiltProducts = [
    {
        name: "Ghost ( Set of 3 )",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/the_latest/1.1.png",
            "/landingpage/product_images/the_latest/1.2.png",
        ],
        description:
            "The perfect way to add some spooky charm to your home decor ! This set can be customised according to your needs. The unique design of these figurines adds a touch of whimsy to any room and makes a great conversation starter! The Tall ghost is ghosty, frightening and weird.",
        isCustomizable: false,
        category: "The-Latest",
        colorData: [
            { name: "White", hexCode: "#FFFFFF" },
            { name: "Gray", hexCode: "#808080" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Set of 3 unique ghost figurines",
            "Hand-crafted with attention to detail",
            "Made from high-quality, durable materials",
            "Perfect for Halloween decor or year-round spooky ambiance",
            "Customizable positioning for versatile display options",
        ],
        productDetails: [
            "Material: Eco-friendly resin",
            'Dimensions: Tall Ghost - 8" H, Medium Ghost - 6" H, Small Ghost - 4" H',
            "Weight: 1.5 lbs total for the set",
            "Care instructions: Dust with a soft, dry cloth",
            "Indoor use recommended",
        ],
        highlighted: true,
        productdesc:
            "Bring a touch of the supernatural to your living space with our Ghost (Set of 3) figurines. Each ghost in this set has its own unique personality, from the tall, imposing specter to the playful smaller spirits. Crafted with meticulous attention to detail, these figurines showcase a range of ghostly expressions and poses that are sure to captivate and maybe even give a gentle fright! The matte finish and subtle textures make these ghosts look like they've just materialized from the beyond. Whether you're decorating for Halloween or simply love a year-round spooky aesthetic, this set is the perfect addition to your home. Place them on a mantel, bookshelf, or as a centerpiece to instantly transform any room into a hauntingly beautiful space. The Ghost (Set of 3) is not just decor; it's a conversation starter and a whimsical way to embrace the mysterious and unknown.",
    },

    {
        name: "Hulk Keychain -- Avengers Smash Fist Miniature",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/hulkkeychain/1.png",
            "/landingpage/renamedprod/hulkkeychain/2.png",
        ],
        description:
            "Unleash the power of the Hulk with this Hulk Smash Fist Keychain, a miniature replica of the Green Goliath's mighty hand. Crafted from high-quality metal alloy with a textured green finish, this keychain is bold, durable, and perfect for Marvel fans, collectors, and Avengers enthusiasts. Whether attached to your keys, bag, or backpack, this strong and stylish keychain showcases your love for the Incredible Hulk.",
        isCustomizable: false,
        category: "Marvel-Collectibles",
        colorData: [{ name: "Green", hexCode: "#008000" }],
        sizeData: [{ name: "One Size", price: 9999, originalPrice: 9999 }],
        features: [
            "Miniature Hulk fist design with metallic green finish",
            "Durable and scratch-resistant alloy construction",
            "Lightweight and portable for everyday use",
            "Ideal for Marvel fans and superhero lovers",
        ],
        productDetails: [
            "Material: Zinc Alloy with Enamel Paint",
            "Dimensions: 5 cm (L) x 3 cm (B)",
            "Weight: 90 g",
        ],
        highlighted: true,
        productdesc:
            "The Hulk Smash Fist Keychain is more than just an accessory—it's a statement piece for true Marvel fans. The intricate detailing and rugged texture capture the essence of the Hulk's raw power, making it a must-have for collectors and enthusiasts alike. Whether you're gifting it or keeping it for yourself, this keychain is a perfect blend of style and fandom. Its compact size ensures it fits effortlessly into your daily life, while its sturdy build guarantees long-lasting durability. Carry a piece of the Avengers wherever you go with this iconic Hulk keychain.",
    },
    {
        name: "Instagram Logo Keychain -- Social Media Inspired Accessory",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/instagramkeychain/1.png",
            "/landingpage/renamedprod/instagramkeychain/2.png",
        ],
        description:
            "Show off your love for Instagram with this trendy Instagram Logo Keychain. Featuring a miniature version of the app's classic logo, this stylish keychain is perfect for influencers, social media lovers, and digital creators!",
        isCustomizable: false,
        category: "Accessories",
        colorData: [{ name: "Multicolor", hexCode: "#E1306C" }],
        sizeData: [{ name: "One Size", price: 9999, originalPrice: 9999 }],
        features: [
            "Compact and lightweight",
            "Durable plastic",
            "High-quality print",
            "Ideal for bags & keys",
        ],
        productDetails: [
            "Dimensions: 5 cm x 5 cm",
            "Keyring attachment included",
        ],
        highlighted: false,
        productdesc:
            "Express your passion for social media with this Instagram Logo Keychain. Designed to resemble the iconic Instagram app logo, this keychain is a fun and fashionable way to showcase your digital lifestyle. Its vibrant colors and sleek design make it a standout accessory for your keys, backpack, or purse. Perfect for influencers and content creators, this keychain is a small but mighty way to celebrate your love for Instagram. Lightweight yet durable, it's built to last and adds a pop of color to your everyday essentials.",
    },
    {
        name: "Ghost ( Tall )",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/the_latest/2.1.png",
            "/landingpage/product_images/the_latest/2.2.png",
        ],
        description:
            "The perfect way to add some spooky charm to your home decor ! It can be customised according to your needs. The unique design of these figurines adds a touch of whimsy to any room and makes a great conversation starter! The Tall ghost is ghosty, frightening and weird",
        isCustomizable: true,
        highlighted: true,
        category: "The-Latest",
        colorData: [
            { name: "White", hexCode: "#FFFFFF" },
            { name: "Gray", hexCode: "#808080" },
        ],
        sizeData: [
            {
                name: "R",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
        ],
    },
    {
        name: "Moon Lamp",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/the_latest/3.1.png",
            "/landingpage/product_images/the_latest/3.2.png",
        ],
        description:
            "Donal Duck, yeah that Disney's grumbling duck. Let's embellish your place with your favourite Donald Duck. A bit of aesthetic touch is here for you and not just a regular",
        isCustomizable: true,
        highlighted: true,
        category: "The-Latest",
        colorData: [
            { name: "White", hexCode: "#FFFFFF" },
            { name: "Yellow", hexCode: "#FFFF00" },
        ],
        sizeData: [
            {
                name: "R",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
        ],
    },
    {
        name: "FengShui Frog",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/1.1.png",
            "/landingpage/product_images/home_essentials/1.2.png",
        ],
        description:
            "A feng shui frog is a symbol of health. Placing a feng shui frog in the house will attract good energy that will keep the members of the family healthy and happy. The frog's red eyes are said to ward off evil and it is said to eliminate the negative energy that latches on to a family .",
        isCustomizable: true,
        highlighted: true,
        category: "Home-Essentials",
        colorData: [
            { name: "Green", hexCode: "#008000" },
            { name: "Gold", hexCode: "#FFD700" },
        ],
        sizeData: [
            {
                name: "S",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
            {
                name: "M",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
            {
                name: "L",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
        ],
    },
    {
        name: "Makhanchor Idol",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/2.1.png",
            "/landingpage/product_images/home_essentials/2.2.png",
        ],
        description:
            "Makhanchor stories emphasize the Hindu concept of lila, playing for the sake of fun rather for competition. Grace your place with the divine Lord Krishna. Endowed with innocence, mischief in eyes and a carefree disposition, Lord Krishna is dear to his devotees and is pleasant to look upon.",
        isCustomizable: true,
        highlighted: true,
        category: "Home-Essentials",
        colorData: [
            { name: "Blue", hexCode: "#0000FF" },
            { name: "Gold", hexCode: "#FFD700" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "FengShui Tortoise",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/3.1.png",
            "/landingpage/product_images/home_essentials/3.2.png",
        ],
        description:
            "Enhance the beauty of the room with a centre table that has a tortoise as a pedestal. Turtle especially in the North direction increases positive energy. Place this turtle in your home to protect the family from bad luck and unfortunate events.",
        isCustomizable: false,
        highlighted: true,
        category: "Home-Essentials",
        colorData: [
            { name: "Green", hexCode: "#008000" },
            { name: "Brown", hexCode: "#A52A2A" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Bronze Ganesha Idol",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/4.1.png",
            "/landingpage/product_images/home_essentials/4.2.png",
        ],
        description:
            "Worshiping Lord Ganesha regularly wards off negative energy from one's home and life, while worshiping him before starting something new keeps obstacles out of one's path. If pleased, Lord Ganesha brings success, prosperity, and good luck into one's life.",
        isCustomizable: false,
        category: "Home-Essentials",
        colorData: [{ name: "Bronze", hexCode: "#CD7F32" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Nagmani Krishna",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/5.1.png",
            "/landingpage/product_images/home_essentials/5.2.png",
        ],
        description:
            "By possessing this priceless gemstone, one can attain an abundance of money, luck, and wealth. Poverty will end and the person will get the victory and divine blessings for life. Grace your Car's Dashboard, Desk, Home Temple with the divine beauty of Lord Krishna.",
        isCustomizable: true,
        category: "Home-Essentials",
        colorData: [
            { name: "Blue", hexCode: "#0000FF" },
            { name: "Gold", hexCode: "#FFD700" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Ivory Ganesha Idol",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/6.1.png",
            "/landingpage/product_images/home_essentials/6.2.png",
        ],
        description:
            "Worshiping Lord Ganesha regularly wards off negative energy from one's home and life, while worshiping him before starting something new keeps obstacles out of one's path. If pleased, Lord Ganesha brings success, prosperity, and good luck into one's life.",
        isCustomizable: true,
        category: "Home-Essentials",
        colorData: [{ name: "Ivory", hexCode: "#FFFFF0" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Universal HandBlender Mount 1.0",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/7.1.png",
            "/landingpage/product_images/home_essentials/7.2.png",
        ],
        description:
            "Most of the brands don't provide blender mounts and it's a massive problem , so here is universal hand blender mount for everyone with any kind of hand blender. Environment-friendly polymer. Durability & strength for your hand blender anywhere.",
        isCustomizable: false,
        category: "Home-Essentials",
        colorData: [{ name: "White", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Universal HandBlender Mount 2.0 ( Wire Holder )",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/8.1.png",
            "/landingpage/product_images/home_essentials/8.2.png",
        ],
        description:
            "Most of the brands don't provide blender mounts and it's a massive problem , so here is universal hand blender mount for everyone with any kind of hand blender. Environment-friendly polymer. Durability & strength for your hand blender anywhere.",
        isCustomizable: true,
        category: "Home-Essentials",
        colorData: [
            { name: "White", hexCode: "#FFFFFF" },
            { name: "Black", hexCode: "#000000" },
        ],
        sizeData: [
            {
                name: "R",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
        ],
    },
    {
        name: "Continuity Camera Mount",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/9.1.png",
            "/landingpage/product_images/home_essentials/9.2.png",
        ],
        description:
            "We have the continuity camera mount in which you can plug and play your iPhone just like that. And you can use your iPhone as Webcam  , you can use this feature in The-Latest MacOS . It can be personalized and it can be customized according to the customer's choice.",
        isCustomizable: false,
        category: "Home-Essentials",
        colorData: [{ name: "Black", hexCode: "#000000" }],
        sizeData: [
            {
                name: "R",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
        ],
    },
    {
        name: "Guitar Key Hanger",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/10.1.png",
            "/landingpage/product_images/home_essentials/10.2.png",
        ],
        description:
            "Guitar aspirants or guitarists, get ready to have a custom-made guitar key hanger. You can get this hanger according to your guitar design. It is durable and strong and holds a capacity of six keys.  It can be customised in any way you wants.",
        isCustomizable: true,
        category: "Home-Essentials",
        colorData: [
            { name: "Brown", hexCode: "#A52A2A" },
            { name: "Black", hexCode: "#000000" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Octopus Key Hanger",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/11.1.png",
            "/landingpage/product_images/home_essentials/11.2.png",
        ],
        description:
            "Octopus for all the aspiring ones who like an aquatic animal and be most beautiful in the ocean. The octopus tentacles are used to hang keys or any other stuff. It is durable and strong and holds a capacity of five to six keys . It can be hung anywhere wall, door or inside the cupboard.",
        isCustomizable: true,
        category: "Home-Essentials",
        colorData: [
            { name: "Blue", hexCode: "#0000FF" },
            { name: "Red", hexCode: "#FF0000" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Starwars Door Hanging",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/home_essentials/12.1.png",
            "/landingpage/product_images/home_essentials/12.2.png",
        ],
        description:
            "Darth Wader most iconic villain of Star Wars. This Use the Force is a comic design which can be used anywhere as a washroom door label, room poster, or almirah poster. It can be stuck or hung in your room. The Use The Force Door Hanger can also be gifted to anyone who likes  Darth Wader or is StarWars Fan .",
        isCustomizable: false,
        category: "Home-Essentials",
        colorData: [{ name: "Black", hexCode: "#000000" }],
        sizeData: [
            { name: "Single", price: 9999, originalPrice: 9999 },
            { name: "3 Pack", price: 9999, originalPrice: 9999 },
        ],
    },
    {
        name: "Short Ghost",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/new_launch/2.1.png",
            "/landingpage/product_images/new_launch/2.2.png",
        ],
        description:
            "Introducing the Little Ghost - the perfect way to add some spooky charm to your home decor! This little ghost figurine can be customised according to your needs. The unique design of these figurines adds a touch of whimsy to any room and makes a great conversation starter! ",
        isCustomizable: true,
        highlighted: true,
        category: "New-Launch",
        colorData: [
            { name: "White", hexCode: "#FFFFFF" },
            { name: "Gray", hexCode: "#808080" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Astronaut Watch Holder (Glow in Dark)",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/new_launch/1.1.png",
            "/landingpage/product_images/new_launch/1.2.png",
        ],
        description:
            "Unveil the cosmic allure of our Astro Watch Holder, a stunning blend of form and function. Crafted with precision and inspired by the wonders of the universe.",
        isCustomizable: true,
        highlighted: true,
        category: "New-Launch",
        colorData: [
            { name: "White", hexCode: "#FFFFFF" },
            { name: "Glow", hexCode: "#00FF00" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Elk In The Forest Hanging",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/new_launch/3.1.png",
            "/landingpage/product_images/new_launch/3.2.png",
        ],
        description:
            "Elk in the Forest is for all those who aspire to nature, calm refreshing jungle scenic views with Elk and vegetation are all on your wall. The forest view is quirky and can be stuck or hung in your room. The elk wall hanger can also be gifted to youngsters for refreshing mornings in this stressful life.",
        isCustomizable: false,
        highlighted: true,
        category: "New-Launch",
        colorData: [
            { name: "Brown", hexCode: "#A52A2A" },
            { name: "Green", hexCode: "#008000" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Laughing Baba",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/new_launch/4.1.png",
            "/landingpage/product_images/new_launch/4.2.png",
        ],
        description:
            "This beautiful golden sitting Laughing Buddha statue is the perfect addition to your home decor. The Laughing Buddha is a symbol of happiness, contentment, and prosperity, and having one in your home can bring positive energy and good luck.",
        isCustomizable: false,
        category: "New-Launch",
        colorData: [{ name: "Gold", hexCode: "#FFD700" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Lithophane Frame (Coloured)",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/new_launch/5.1.png",
            "/landingpage/product_images/new_launch/5.2.png",
        ],
        description:
            "This personalised and customized lithophane-coloured curved frame is a unique and beautiful way to display your favourite memories. The frame is made from high-quality porcelain and features a unique etched or moulded design.",
        isCustomizable: true,
        category: "New-Launch",
        colorData: [{ name: "Multi", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Grim Reaper Figurine",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/trending_now/1.1.png",
            "/landingpage/product_images/trending_now/1.2.png",
        ],
        description:
            "Billy and Mandy toy, The grim reaper figurine is an action figure which has Reaper in hand. You will love to play with it as billy and mandy do , So grab yours today.",
        isCustomizable: true,
        highlighted: true,
        category: "Trending-Now",
        colorData: [
            { name: "Black", hexCode: "#000000" },
            { name: "Gray", hexCode: "#808080" },
        ],
        sizeData: [
            { name: "S", price: 9999, originalPrice: 9999 },
            { name: "M", price: 9999, originalPrice: 9999 },
            { name: "L", price: 9999, originalPrice: 9999 },
        ],
    },
    {
        name: "Kaws",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/trending_now/2.1.png",
            "/landingpage/product_images/trending_now/2.2.png",
        ],
        description:
            "KAWS is a New York-based artist who has made a name for himself designing limited-edition toys and clothing. Kaws Dummy Toy can be personalised and customised according to the user's needs, size, design and whatnot.",
        isCustomizable: true,
        highlighted: true,
        category: "Trending-Now",
        colorData: [
            { name: "Black", hexCode: "#000000" },
            { name: "White", hexCode: "#FFFFFF" },
            { name: "Red", hexCode: "#FF0000" },
        ],
        sizeData: [
            { name: "S", price: 9999, originalPrice: 9999 },
            { name: "M", price: 9999, originalPrice: 9999 },
            { name: "L", price: 9999, originalPrice: 9999 },
        ],
    },
    {
        name: "Goofy Figurine",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/trending_now/3.1.png",
            "/landingpage/product_images/trending_now/3.2.png",
        ],
        description:
            "Goofey, yeah Disney's tall sweet dog-faced cartoon. Get Disney collectibles and decorate your dream place. Let's embellish your place with your favourite Goofey. Goofey Dummy Toy can be personalised and customised according to your needs .",
        isCustomizable: true,
        highlighted: true,
        category: "Trending-Now",
        colorData: [
            { name: "Black", hexCode: "#000000" },
            { name: "Orange", hexCode: "#FFA500" },
        ],
        sizeData: [
            { name: "S", price: 9999, originalPrice: 9999 },
            { name: "M", price: 9999, originalPrice: 9999 },
            { name: "L", price: 9999, originalPrice: 9999 },
        ],
    },
    {
        name: "Harry Potter Headphone Stand",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/trending_now/4.1.png",
            "/landingpage/product_images/trending_now/4.2.png",
        ],
        description:
            "This Headphone Stand is a Phenomenal thing to have on a gaming desk and its elegant look will augment your place. This headphone stand is based on Harry Potter Logo.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Gold", hexCode: "#FFD700" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },
    {
        name: "Astronaut On Moon Statue",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/trending_now/5.1.png",
            "/landingpage/product_images/trending_now/5.2.png",
        ],
        description:
            "For all the aspiring ones who want to travel to space on their spacecraft. The astronaut is quirky and can be displayed as a showpiece on the bookshelf or table or the dresser or on any table.",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [
            { name: "White", hexCode: "#FFFFFF" },
            { name: "Silver", hexCode: "#C0C0C0" },
        ],
        sizeData: [
            { name: "S", price: 9999, originalPrice: 9999 },
            { name: "M", price: 9999, originalPrice: 9999 },
            { name: "L", price: 9999, originalPrice: 9999 },
        ],
    },
    {
        name: "Shenron Dragon",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/product_images/trending_now/6.1.png",
            "/landingpage/product_images/trending_now/6.2.png",
        ],
        description:
            "Get your Shenron Dragon today , It can be your next DragonBall Z collectible decor. The size and colour of each figurine can be customised, allowing you to make your unique decorations. These fun and festive figurines are sure to bring some extra cheer to your home this holiday !",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [
            { name: "Green", hexCode: "#008000" },
            { name: "Gold", hexCode: "#FFD700" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
    },

    {
        name: "Deadpool Katana -- Dual Sword Replica Set",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/deadpoolkatana/1.png",
            "/landingpage/renamedprod/deadpoolkatana/2.png",
            "/landingpage/renamedprod/deadpoolkatana/3.png",
        ],
        description:
            "Authentic dual-sword set featuring Deadpool's signature weapons with high-carbon steel blades.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Red/Black", hexCode: "#ED1C24/#000000" },
            { name: "Silver Blade", hexCode: "#C0C0C0" },
        ],
        sizeData: [{ name: "Set of 2", price: 9999, originalPrice: 9999 }],
        features: [
            "Anime-accurate detailing",
            "High-carbon stainless steel",
            "Deadpool logo scabbards",
            "Adjustable back straps",
            "Battle-ready construction",
        ],
        productDetails: [
            "Material: High-carbon stainless steel",
            "Dimensions (each): 104 x 3 x 4 cm",
            "Weight: 1.2 kg total",
            "Edge: Blunt (for cosplay)",
            "Includes: Dual katanas with scabbards",
        ],
        highlighted: true,
        productdesc:
            "Unleash your inner Merc with a Mouth with this premium Deadpool katana set. The authentic replica swords feature razor-sharp detailing with polished steel blades and Deadpool-branded scabbards. Perfect for cosplay events, martial arts demonstrations, or as striking display pieces in any Marvel collection.",
    },
    {
        name: "Deadpool Mask -- Full-Face Cosplay Helmet",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/deadpoolmask/1.png",
            "/landingpage/renamedprod/deadpoolmask/2.png",
            "/landingpage/renamedprod/deadpoolmask/3.png",
            "/landingpage/renamedprod/deadpoolmask/4.png",
        ],
        description:
            "Transform into Wade Wilson with this full-face mask featuring Deadpool's iconic expressive design.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Red/Black", hexCode: "#ED1C24/#000000" }],
        sizeData: [{ name: "One Size", price: 9999, originalPrice: 9999 }],
        features: [
            "Mesh eye covers for visibility",
            "Flexible fabric construction",
            "Snug and comfortable fit",
            "Iconic Deadpool expressions",
            "Lightweight design",
        ],
        productDetails: [
            "Material: Stretchable fabric with plastic lenses",
            "Weight: 400 g",
            "One-size-fits-most adults",
            "Care: Hand wash recommended",
            "Officially licensed Marvel product",
        ],
        highlighted: false,
        productdesc:
            "Channel Deadpool's irreverent spirit with this high-quality full-face mask that perfectly captures the anti-hero's signature look. The breathable fabric and mesh eye covers ensure comfort during extended wear, while the detailed stitching recreates Wade Wilson's iconic facial expressions. Whether for cosplay, Halloween, or display, this mask brings the Merc with a Mouth to life.",
    },
    {
        name: "Doctor Doom Mask -- Latverian War Armor Edition",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/doctordoommask/1.png",
            "/landingpage/renamedprod/doctordoommask/2.png",
            "/landingpage/renamedprod/doctordoommask/3.png",
            "/landingpage/renamedprod/doctordoommask/4.png",
        ],
        description:
            "Menacing mask featuring Doctor Doom's iconic armored look with realistic battle damage.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Metallic Green", hexCode: "#2C5545" },
            { name: "Gunmetal Gray", hexCode: "#2C3539" },
        ],
        sizeData: [{ name: "One Size", price: 9999, originalPrice: 9999 }],
        features: [
            "High-detail sculpting",
            "Metallic textures",
            "Adjustable fit",
            "Battle-scarred finish",
            "Villainous presence",
        ],
        productDetails: [
            "Material: ABS plastic with metallic paint",
            "Weight: 900 g",
            "Interior padding for comfort",
            "Authentic comic book design",
            "Display stand included",
        ],
        highlighted: true,
        productdesc:
            "Rule Latveria in style with this premium Doctor Doom mask that captures every menacing detail of Marvel's most feared dictator. The metallic green finish and battle-worn textures recreate Doom's armored visage with comic-accurate precision. Perfect for cosplay, display, or intimidating your enemies, this mask commands respect and fear in equal measure.",
    },
    {
        name: "Doctor Strange Figure -- Sorcerer Supreme Collectible Statue",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/doctorstrangefigure/1.png",
            "/landingpage/renamedprod/doctorstrangefigure/2.png",
            "/landingpage/renamedprod/doctorstrangefigure/3.png",
        ],
        description:
            "Highly detailed collectible figure of the Sorcerer Supreme in spell-casting action pose.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Blue/Red", hexCode: "#0000FF/#FF0000" },
            { name: "Gold Accents", hexCode: "#FFD700" },
        ],
        sizeData: [{ name: "Standard", price: 9999, originalPrice: 9999 }],
        features: [
            "Movie-accurate details",
            "Glossy paint finish",
            "Dynamic action pose",
            "Magical energy effects",
            "Cloak of Levitation",
        ],
        productDetails: [
            "Material: Premium PVC",
            "Dimensions: 12 x 10 x 18 cm",
            "Weight: 500 g",
            "Articulation: Static pose",
            "Includes: Display base",
        ],
        highlighted: false,
        productdesc:
            "Master the mystic arts with this exquisitely crafted Doctor Strange figure that captures the Sorcerer Supreme mid-incantation. The intricate detailing showcases Strange's flowing Cloak of Levitation and glowing magical energy rings. A must-have for Marvel collectors, this figure brings the magic of the Sanctum Sanctorum to your display shelf.",
    },

    // 🦸‍♂️ Superheroes & Anime Characters - Anime
    {
        name: "Demon Slayer Keychain -- Mini Nichirin Blade Replica",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/demonslayerkeychain/1.png",
            "/landingpage/renamedprod/demonslayerkeychain/2.png",
            "/landingpage/renamedprod/demonslayerkeychain/3.png",
        ],
        description:
            "Miniature katana keychain inspired by Demon Slayer's iconic Nichirin blades.",
        isCustomizable: true,
        category: "Trending-Now",

        colorData: [
            { name: "Black Blade", hexCode: "#000000" },
            { name: "Blue Hilt", hexCode: "#0000FF" },
            { name: "Red Hilt", hexCode: "#FF0000" },
            { name: "Yellow Hilt", hexCode: "#FFD700" },
        ],
        sizeData: [{ name: "Standard", price: 9999, originalPrice: 9999 }],
        features: [
            "Anime-accurate design",
            "Durable zinc alloy",
            "Polished finish",
            "Compact and lightweight",
            "Perfect for everyday carry",
        ],
        productDetails: [
            "Material: Zinc alloy",
            "Dimensions: 8 x 1 cm",
            "Weight: 80 g",
            "Keyring included",
            "Character options available",
        ],
        highlighted: false,
        productdesc:
            "Carry the spirit of the Demon Slayer Corps wherever you go with this meticulously crafted Nichirin blade keychain. The miniature katana features authentic details from the anime, available in various hilt colors representing different characters. A stylish accessory for anime fans that combines fandom with everyday utility.",
    },

    {
        name: "Handcrafted Ceremonial Mask",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/ceremonialmask/1.png",
            "/landingpage/renamedprod/ceremonialmask/2.png",
            "/landingpage/renamedprod/ceremonialmask/3.png",
        ],
        description:
            "Intricately designed ceremonial mask inspired by ancient traditions, handcrafted with premium materials.",
        isCustomizable: true,
        category: "Trending-Now",

        colorData: [
            { name: "Deep Red", hexCode: "#8B0000" },
            { name: "Earth Brown", hexCode: "#654321" },
            { name: "Matte Black", hexCode: "#000000" },
            { name: "Gold Accents", hexCode: "#FFD700" },
        ],
        sizeData: [{ name: "Standard", price: 9999, originalPrice: 9999 }],
        features: [
            "Handcrafted by skilled artisans",
            "Traditional ceremonial design",
            "Wall-mountable",
            "Intricate detailing",
            "Culturally inspired artwork",
        ],
        productDetails: [
            "Material: Wood and resin with natural pigments",
            "Dimensions: 30 x 20 x 8 cm",
            "Weight: 1.2 kg",
            "Hand-painted details",
            "Ethically sourced materials",
        ],
        highlighted: true,
        productdesc:
            "This exquisite ceremonial mask brings cultural heritage to life with its intricate carvings and authentic hand-painted details. Each piece is uniquely crafted by skilled artisans using traditional techniques, making it a striking decorative piece that tells a story of ancient traditions. Perfect for collectors and spiritual enthusiasts.",
    },

    {
        name: "Dragon Ball Z Keychain – Super Saiyan & Dragon Ball Replica",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/dragonballzkeychain/1.png",
            "/landingpage/renamedprod/dragonballzkeychain/2.png",
            "/landingpage/renamedprod/dragonballzkeychain/3.png",
        ],
        description:
            "Carry the power of the Saiyans with this DBZ Keychain featuring Goku, Vegeta, Shenron, and more! Made with premium zinc alloy and enamel coating, it's the perfect collectible for any anime fan.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Iconic DBZ-inspired designs (Dragon Ball, Super Saiyan, Shenron, Capsule Corp.)",
            "Durable metal construction with enamel paint finish",
            "Lightweight and easy to carry",
            "Perfect for Dragon Ball fans and anime collectors",
        ],
        productDetails: [
            "Material: Zinc Alloy with Enamel Coating",
            "Dimensions: 5 cm (L) x 3 cm (B)",
            "Weight: 90 g",
        ],
        highlighted: true,
        productdesc:
            "This Dragon Ball Z Keychain brings your favorite anime to life in the palm of your hand. Made from sturdy zinc alloy with high-quality enamel, it's ideal for backpacks, keyrings, or collector displays.",
    },

    {
        name: "Drifting Car Interior Décor – Motion LED Dashboard Ornament",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/driftingcarinteriordecor/1.png",
            "/landingpage/renamedprod/driftingcarinteriordecor/2.png",
        ],
        description:
            "Upgrade your dashboard with this motion-activated drifting car model featuring LED underglow and realistic movement. A must-have for JDM and racing fans.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Realistic drifting motion effect",
            "LED underglow lighting for added flair",
            "Strong adhesive base for secure placement",
            "Compact and stylish for dashboard display",
        ],
        productDetails: [
            "Material: ABS Plastic & Metal",
            "Dimensions: 10 cm (L) x 6 cm (B) x 8 cm (H)",
            "Weight: 350 g",
        ],
        highlighted: true,
        productdesc:
            "Turn your ride into a drift scene with this dynamic ornament. The LED base and interactive movement will make your dashboard come alive with energy.",
    },

    {
        name: "Harry Potter Platform 9¾ Sign – Wizarding World Wall Hanging",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/harrypotterheadphonestand/1.png",
            "/landingpage/renamedprod/harrypotterheadphonestand/2.png",
            "/landingpage/renamedprod/harrypotterheadphonestand/3.png",
            "/landingpage/renamedprod/harrypotterheadphonestand/4.png",
            "/landingpage/renamedprod/harrypotterheadphonestand/5.png",
            "/landingpage/renamedprod/harrypotterheadphonestand/6.png",
            "/landingpage/renamedprod/harrypotterheadphonestand/7.png",
            "/landingpage/renamedprod/harrypotterheadphonestand/8.png",
        ],
        description:
            "Bring a piece of the Wizarding World to your walls with this iconic Platform 9¾ sign. Perfect for fans of all ages.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Accurate Platform 9¾ design",
            "Durable material variants: wood, metal, acrylic",
            "Easy to hang on walls or doors",
            "Perfect for Harry Potter themed décor",
        ],
        productDetails: [
            "Material: Wood / Metal / Acrylic",
            "Dimensions: 30 cm (L) x 20 cm (B)",
            "Weight: 700 g",
        ],
        highlighted: true,
        productdesc:
            "Step into the Hogwarts Express world with this official-looking Platform 9¾ sign. Whether for your bedroom or a themed event, it brings magic to your space.",
    },

    // {
    //   name: "Harry Potter Sorting Hat",
    //   price: 9999,
    //   originalPrice: 9999,
    //   images: [
    //     "/landingpage/product_images/sortinghat/1.png",
    //     "/landingpage/product_images/sortinghat/2.png",
    //   ],
    //   description:
    //     "This realistic Sorting Hat replica brings the magic of Hogwarts to life. A must-have for cosplay, décor, or true fans.",
    //   isCustomizable: false,
    //   category: "Cosplay-Accessories",
    //   colorData: [
    //     { name: "Rustic Brown", hexCode: "#8B4513" },
    //     { name: "Dark Brown", hexCode: "#654321" },
    //   ],
    //   sizeData: [],
    //   features: [
    //     "Authentic Hogwarts Sorting Hat design",
    //     "High-quality plush material with stitched facial features",
    //     "Foldable brim and adjustable fit",
    //     "Ideal for cosplay, themed parties, and collectors",
    //   ],
    //   productDetails: [
    //     "Material: Premium-quality faux suede",
    //     "Dimensions: 38 cm x 35 cm x 45 cm",
    //     "Weight: 600 g",
    //   ],
    //   highlighted: true,
    //   productdesc:
    //     "Find out your true house with this lifelike Sorting Hat. Intricate details, soft fabric, and magical vibes make it the centerpiece of any Harry Potter collection.",
    // },

    {
        name: "Hello Kitty Figure – Cute Mini Collectible",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/hellokittyfigure/1.png",
            "/landingpage/renamedprod/hellokittyfigure/2.png",
        ],
        description:
            "This adorable Hello Kitty collectible brings a dash of kawaii charm to your shelf. Made from durable PVC and perfect for gifting.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "White", hexCode: "#FFFFFF" },
            { name: "Red", hexCode: "#FF0000" },
        ],

        sizeData: [{ name: "Standard", price: 9999, originalPrice: 9999 }],
        features: [
            "Authentic Hello Kitty design",
            "Bright and detailed finish",
            "Durable PVC construction",
            "Great for desks, shelves, or as a gift",
        ],
        productDetails: [
            "Material: High-quality PVC",
            "Dimensions: 8 cm (L) x 6 cm (B) x 10 cm (H)",
            "Weight: 200 g",
        ],
        highlighted: true,
        productdesc:
            "Whether you're a Sanrio fan or just love cute collectibles, this Hello Kitty figure is a joy to own. Compact, colorful, and full of personality.",
    },

    // 🎄 Seasonal & Festive Decor
    {
        name: "Christmas Lantern -- LED Festive Décor Light",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/christmaslantern/1.png",
            "/landingpage/renamedprod/christmaslantern/2.png",
            "/landingpage/renamedprod/christmaslantern/3.png",
        ],
        description:
            "Beautifully crafted LED lantern with intricate holiday designs for warm festive ambiance.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Warm White", hexCode: "#F5F5DC" },
            { name: "Gold", hexCode: "#FFD700" },
            { name: "Silver", hexCode: "#C0C0C0" },
        ],
        sizeData: [{ name: "Standard", price: 9999, originalPrice: 9999 }],
        features: [
            "Warm LED glow",
            "Holiday-themed cutouts",
            "Battery/USB powered",
            "Durable construction",
            "Indoor/outdoor use",
        ],
        productDetails: [
            "Material: Metal/wood/plastic variants",
            "Dimensions: 15 x 10 x 25 cm",
            "Weight: 750 g",
            "LED lifespan: 50,000 hours",
            "Power options available",
        ],
        highlighted: false,
        productdesc:
            "Create magical holiday memories with this enchanting Christmas lantern featuring delicate snowflake cutouts that cast beautiful patterns when illuminated. The warm LED glow brings cozy festive charm to any space, perfect for mantelpieces, tabletops, or outdoor holiday displays.",
    },

    // 🦸‍♂️ Superheroes & Anime Characters - Marvel/DC
    {
        name: "Deadpool & Wolverine Merged Figure -- Marvel Hybrid Statue",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/deadpoolandwolverinemergedfigure/1.png",
            "/landingpage/renamedprod/deadpoolandwolverinemergedfigure/2.png",
            "/landingpage/renamedprod/deadpoolandwolverinemergedfigure/3.png",
        ],
        description:
            "Unique crossover collectible combining Deadpool's humor with Wolverine's claws in one epic figure.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Red/Black", hexCode: "#ED1C24/#000000" },
            { name: "X-Men Yellow", hexCode: "#FFD700" },
        ],
        sizeData: [{ name: "Standard", price: 9999, originalPrice: 9999 }],
        features: [
            "Hybrid character design",
            "Battle-ready pose",
            "Premium paint finish",
            "Sturdy display base",
            "Official Marvel product",
        ],
        productDetails: [
            "Material: High-quality PVC",
            "Dimensions: 15 x 10 x 18 cm",
            "Weight: 450 g",
            "Articulated: No",
            "Collector's item",
        ],
        highlighted: true,
        productdesc:
            "This extraordinary Marvel crossover collectible merges two fan-favorite characters into one stunning action figure. The detailed sculpt captures Deadpool's signature red-black suit perfectly blended with Wolverine's iconic claws and combat stance, making it a centerpiece-worthy addition to any superhero collection.",
    },

    // 🖊️ Office & Desk Accessories
    {
        name: "Business Card Holder -- Sleek & Modern Desk Accessory",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/businesscardholder/1.png",
            "/landingpage/renamedprod/businesscardholder/2.png",
        ],
        description:
            "Elegant card holder crafted from premium materials for professional organization.",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [
            { name: "Stainless Steel", hexCode: "#E0E0E0" },
            { name: "Clear Acrylic", hexCode: "#FFFFFF" },
            { name: "Walnut Wood", hexCode: "#5C4033" },
        ],
        sizeData: [{ name: "Standard", price: 9999, originalPrice: 9999 }],
        features: [
            "Premium construction",
            "Holds 50+ cards",
            "Anti-slip base",
            "Minimalist design",
            "Professional look",
        ],
        productDetails: [
            "Material: Steel/acrylic/wood options",
            "Dimensions: 10 x 5 x 7 cm",
            "Weight: 0.3 kg",
            "Capacity: 50 standard cards",
            "Non-tip design",
        ],
        highlighted: false,
        productdesc:
            "Make a lasting impression with this sophisticated business card holder that combines functionality with elegant design. The weighted base keeps cards securely in place while the premium materials add a touch of class to any professional setting, perfect for executives and entrepreneurs alike.",
    },

    // 🕯️ Home & Decorative Items
    {
        name: "Cabinet Spice Rack -- Adjustable Kitchen Storage Organizer",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/cabinetspicerack/1.png",
            "/landingpage/renamedprod/cabinetspicerack/2.png",
        ],
        description:
            "Space-saving multi-tier organizer for spices and kitchen essentials.",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [
            { name: "Stainless Steel", hexCode: "#E0E0E0" },
            { name: "White Plastic", hexCode: "#FFFFFF" },
            { name: "Black Plastic", hexCode: "#000000" },
        ],
        sizeData: [{ name: "Standard", price: 9999, originalPrice: 9999 }],
        features: [
            "Adjustable shelves",
            "Non-slip base",
            "Durable construction",
            "Maximizes cabinet space",
            "Easy to clean",
        ],
        productDetails: [
            "Material: Steel/BPA-free plastic",
            "Dimensions: 30 x 15 x 25 cm",
            "Weight: 1.2 kg",
            "Capacity: 15-20 spice jars",
            "Installation: No tools needed",
        ],
        highlighted: false,
        productdesc:
            "Revolutionize your kitchen organization with this versatile spice rack designed to optimize cabinet space. The adjustable shelves accommodate various jar sizes while the sturdy construction ensures long-lasting use, making cooking more efficient and enjoyable.",
    },

    {
        name: "Batman Armored Mask -- Justice League Edition",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/batmanarmoredmask/1.png",
            "/landingpage/renamedprod/batmanarmoredmask/2.png",
            "/landingpage/renamedprod/batmanarmoredmask/3.png",
        ],
        description:
            "Embrace Gotham's protector with this Batman Armored Mask, featuring a battle-worn metallic finish, adjustable straps, and high-quality detailing. Perfect for cosplay, Halloween, and Batman fans.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Metallic Black", hexCode: "#1A1A1A" },
            { name: "Gunmetal Gray", hexCode: "#2C3539" },
        ],
        sizeData: [{ name: "One Size", price: 9999, originalPrice: 9999 }],
        features: [
            "Metallic silver detailing with reinforced armor look",
            "Breathable and comfortable fit",
            "Perfect for display or cosplay",
            "Adjustable straps for secure wearing",
            "High-quality ABS plastic construction",
        ],
        productDetails: [
            "Material: ABS plastic with metallic finish",
            "Weight: 700 g",
            "Dimensions: Fits most adult head sizes",
            "Care instructions: Wipe clean with dry cloth",
            "Officially licensed Justice League product",
        ],
        highlighted: true,
        productdesc:
            "Channel the Dark Knight with this premium Batman Armored Mask from the Justice League collection. The meticulously crafted metallic finish gives it an authentic battle-worn appearance straight from the DC universe. Designed for both display and wear, this mask features comfortable padding and adjustable straps to ensure a secure fit during cosplay events or Halloween. The attention to detail in the armor plating and sculpted design makes this a must-have for serious Batman collectors and casual fans alike. Whether you're completing your Justice League costume or adding to your superhero memorabilia collection, this mask brings Gotham's vigilante to life with stunning realism.",
    },
    {
        name: "Articulated Candle Set -- Decorative Home & Event Lighting",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/articulatedcandleset/1.png",
            "/landingpage/renamedprod/articulatedcandleset/2.png",
        ],
        description:
            "Add a touch of elegance and ambiance to any space with this Articulated Candle Set. Designed for modern and classic aesthetics, these candles feature movable, bendable designs that create a unique lighting effect.",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [
            { name: "Ivory", hexCode: "#FFFFF0" },
            { name: "Burgundy", hexCode: "#800020" },
            { name: "Slate Gray", hexCode: "#708090" },
        ],
        sizeData: [
            {
                name: "Set of 3",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
        ],
        features: [
            "Bendable candle design",
            "Wax-coated for authentic look",
            "Smokeless burning",
            "Long-lasting",
            "Creates unique lighting effects",
        ],
        productDetails: [
            "Set of 3 candles",
            "Height: 20 cm each",
            "Material: High-quality synthetic wax blend",
            "Burn time: Approximately 50 hours total",
            "Indoor use recommended",
        ],
        highlighted: false,
        productdesc:
            "Transform your living space with these innovative Articulated Candles that combine artistic design with ambient lighting. Unlike traditional candles, these bendable wonders allow you to sculpt dramatic shapes and arrangements that evolve with your decor. The realistic wax coating gives them an authentic candlelit appearance while eliminating the mess and danger of real flames. Perfect for dinner parties, romantic evenings, or simply adding a warm glow to your everyday spaces. The smokeless, drip-free design makes them ideal for sensitive environments while the long-lasting construction ensures you'll enjoy their soft illumination for countless evenings. Whether arranged straight for a classic look or bent into artistic formations, these candles add a touch of modern sophistication to any setting.",
    },
    {
        name: "3D Name Changing Plate -- LED Custom Name Display",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/3dnamechangingplate/1.png",
            "/landingpage/renamedprod/3dnamechangingplate/2.png",
        ],
        description:
            "Make your name stand out with this 3D Name Changing Plate, a customizable LED name display that illuminates with multiple colors! Designed for offices, gaming setups, or personalized gifting.",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [
            { name: "Acrylic Clear", hexCode: "#FFFFFF" },
            { name: "Walnut Wood", hexCode: "#5C4033" },
        ],
        sizeData: [
            {
                name: "Standard",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
        ],
        features: [
            "Customizable with any name or text",
            "Multi-color LED lighting with adjustable brightness",
            "Premium acrylic or wooden base options",
            "USB-powered for easy use",
            "Sleek modern design",
        ],
        productDetails: [
            "Material: Acrylic/Wood variants available",
            "Dimensions: 20 cm (L) x 5 cm (B) x 8 cm (H)",
            "Weight: 450 g",
            "Power: USB powered (cable included)",
            "LED Colors: RGB with 16 million color combinations",
        ],
        highlighted: true,
        productdesc:
            "Personalize your space in brilliant light with this innovative 3D Name Display that puts your name in the spotlight—literally! This cutting-edge name plate combines elegant materials with dazzling LED technology to create a truly unique decorative piece. Choose between sleek transparent acrylic for a modern look or warm walnut wood for classic sophistication. The customizable illumination lets you select from millions of color combinations to match your mood, decor, or special occasion. Perfect for desk name plates, door signs, or as a memorable gift, this display adds a professional yet personal touch to any environment. The easy USB power means you can use it anywhere, while the premium construction ensures durability. Whether you're highlighting your name, a special message, or a motivational quote, this luminous display makes every word shine with style.",
    },
    {
        name: "Baymax Figure -- Disney's Big Hero 6 Action Statue",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/baymax/1.png",
            "/landingpage/renamedprod/baymax/2.png",
        ],
        description:
            "Get your healthcare companion with this adorable Baymax Figure, inspired by Disney's Big Hero 6. Crafted from soft vinyl with a smooth matte finish, this figurine perfectly captures Baymax's lovable and huggable design.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "White", hexCode: "#FFFFFF" }],
        sizeData: [
            {
                name: "Standard",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
        ],
        features: [
            "Authentic Baymax design with soft curves",
            "Durable and lightweight material",
            "Compact size for easy placement",
            "Perfect for Disney collectors",
            "Officially licensed merchandise",
        ],
        productDetails: [
            "Material: Soft Vinyl PVC",
            "Dimensions: 10 cm (L) x 8 cm (B) x 12 cm (H)",
            "Weight: 280 g",
            "Care: Wipe clean with damp cloth",
            "Age recommendation: 3+ years",
        ],
        highlighted: false,
        productdesc:
            "Bring home everyone's favorite healthcare companion with this officially licensed Baymax figurine from Disney's Big Hero 6. Meticulously crafted to capture every adorable detail, from his pillowy white form to his gentle expression, this collectible perfectly embodies Baymax's huggable personality. The high-quality soft vinyl construction gives the figure a pleasant tactile feel while maintaining precise sculpting that stays true to the animated character. Compact enough for desk display yet substantial enough to stand out, this Baymax makes a wonderful addition to any Disney collection or a heartwarming gift for fans of all ages. Whether placed beside your computer for workday comfort or displayed proudly on a shelf, this charming figure is guaranteed to deliver smiles and remind you that 'I am satisfied with my care.'",
    },
    {
        name: "Batman Logo Projector (LED Bat-Signal Light)",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/batmanlogoprojector/1.png",
            "/landingpage/renamedprod/batmanlogoprojector/2.png",
            "/landingpage/renamedprod/batmanlogoprojector/3.png",
        ],
        description:
            "Summon the Dark Knight with this Batman Logo Projector, designed to project the iconic Bat-Signal onto walls, ceilings, or any flat surface. Perfect for collectors, DC fans, and superhero enthusiasts!",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Matte Black", hexCode: "#000000" },
            { name: "Gunmetal Grey", hexCode: "#4B4B4B" },
        ],
        sizeData: [
            {
                name: "Standard",
                price: 9999,
                originalPrice: 9999,
                sizeType: "standard",
            },
        ],
        features: [
            "High-powered LED Batman logo projection",
            "Adjustable projection angle & focus",
            "Compact and lightweight design",
            "USB or battery-operated options",
            "Durable ABS plastic and metal construction",
        ],
        productDetails: [
            "Material: ABS plastic and metal",
            "Dimensions: 12 cm (L) x 8 cm (B) x 10 cm (H)",
            "Weight: 600 g",
            "Projection range: Up to 10 feet",
            "Power options: USB or 3xAA batteries (not included)",
        ],
        highlighted: true,
        productdesc:
            "Answer Gotham's call with this authentic Bat-Signal projector that brings the legendary DC Comics icon to life in your own space. This premium-quality projector casts a crisp, bright Batman logo up to 10 feet away, transforming any room into Commissioner Gordon's office rooftop. The adjustable 360° rotating head lets you position the signal perfectly on walls or ceilings, while the focus dial ensures razor-sharp projection clarity. Crafted from durable ABS plastic and metal components, this isn't just a toy—it's a collector's piece that captures the drama and excitement of Batman's world. Use it as a night light, party decoration, or the centerpiece of your superhero collection. The energy-efficient LED provides long-lasting illumination without overheating, making it safe for extended use. Whether you're a die-hard DC fan or just love cool lighting effects, this Bat-Signal projector is your ticket to the Gotham City experience.",
    },
    {
        name: "Iron Man Arc Reactor -- Mark I / Mark L Replica",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/ironmanarcreactor/1.png",
            // "/landingpage/renamedprod/ironmanarcreactor/2.png",
        ],
        description:
            "Own a piece of Stark Industries' legendary tech with this Iron Man Arc Reactor Replica, inspired by Tony Stark's lifesaving power source. Featuring detailed metallic engravings, LED-powered glow, and a sleek display stand, this high-quality replica is perfect for Marvel fans, collectors, and tech enthusiasts.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Blue", hexCode: "#0000FF" }],
        sizeData: [{ name: "One Size", price: 9999, originalPrice: 9999 }],
        features: [
            "LED-lit arc reactor with glowing blue effect",
            "Metallic framework with intricate engravings",
            "Rechargeable via USB (battery-powered option available)",
            "Custom display stand included",
        ],
        productDetails: [
            "Material: Aluminum alloy & acrylic",
            "Dimensions: 10 cm (D) x 4 cm (H)",
            "Weight: 350 g",
        ],
        highlighted: true,
        productdesc:
            "Bring the genius of Tony Stark into your home with this meticulously crafted Iron Man Arc Reactor Replica. Every detail, from the metallic framework to the glowing blue LED lights, has been designed to mirror the iconic power source from the Marvel Cinematic Universe. Whether displayed on your desk or used as part of a cosplay ensemble, this arc reactor is a conversation starter and a collector's dream. The included stand ensures it's always showcased in all its glory, while the rechargeable feature adds a touch of modern convenience. A must-have for any Marvel fan or tech enthusiast, this replica is a tribute to innovation and heroism.",
    },
    {
        name: "Iron Man Mask -- Marvel Superhero Helmet",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/ironmanmask/1.png",
            "/landingpage/renamedprod/ironmanmask/2.png",
            "/landingpage/renamedprod/ironmanmask/3.png",
        ],
        description:
            "Step into the world of Tony Stark with this Iron Man Mask, a high-quality replica inspired by Marvel's legendary Avenger. Designed with precision detailing, a metallic finish, and optional LED eyes, this mask is perfect for cosplay, display, or collectors.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Red", hexCode: "#FF0000" },
            { name: "Gold", hexCode: "#FFD700" },
        ],
        sizeData: [
            { name: "Universal Adult Fit", price: 9999, originalPrice: 9999 },
        ],
        features: [
            "Movie-accurate design with metallic finish",
            "Optional LED light-up eyes (battery-powered)",
            "Adjustable straps for a snug and comfortable fit",
            "Durable ABS plastic construction",
        ],
        productDetails: [
            "Material: ABS plastic with metallic paint",
            "Weight: 850 g",
        ],
        highlighted: true,
        productdesc:
            "Transform into the armored Avenger with this stunning Iron Man Mask replica. Designed to mimic the sleek, high-tech appearance of Tony Stark's iconic helmet, this mask is a dream come true for Marvel fans and cosplayers. The metallic finish and optional LED eyes bring the mask to life, making it a standout piece for conventions, costume parties, or display. The adjustable straps ensure a comfortable fit, while the durable ABS plastic guarantees longevity. Whether you're suiting up as Iron Man or adding to your collection, this mask is a symbol of heroism and innovation.",
    },
    {
        name: "Jordan Wall Hangings -- Iconic Basketball Wall Art",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/jordanwallhanging/1.png",
            "/landingpage/renamedprod/jordanwallhanging/2.png",
            "/landingpage/renamedprod/jordanwallhanging/3.png",
        ],
        description:
            "Celebrate the legacy of Michael Jordan with these Jordan Wall Hangings, featuring dynamic slam dunk silhouettes, motivational quotes, and legendary jersey designs. Crafted from high-quality wood, metal, or acrylic, these stylish wall decorations are perfect for basketball lovers, sports enthusiasts, and sneakerheads.",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [
            { name: "Black", hexCode: "#000000" },
            { name: "Red", hexCode: "#FF0000" },
            { name: "White", hexCode: "#FFFFFF" },
        ],
        sizeData: [{ name: "40 cm x 30 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Iconic Jordan slam dunk & sneaker art designs",
            "Premium material options (wood, metal, acrylic)",
            "Easy to mount with lightweight design",
            "Perfect for sports-themed rooms and gym decor",
        ],
        productDetails: [
            "Material: MDF Wood / Metal / Acrylic (Variants Available)",
            "Dimensions: 40 cm (L) x 30 cm (B)",
            "Weight: 800 g",
        ],
        highlighted: false,
        productdesc:
            "Pay homage to basketball's greatest with these striking Jordan Wall Hangings. Each piece captures the essence of Michael Jordan's legendary career, from his iconic slam dunks to his timeless sneaker designs. Available in a variety of premium materials, these wall hangings are versatile enough to complement any decor style—be it a sports-themed room, gym, or office. The easy-to-mount design ensures hassle-free installation, while the lightweight build keeps your walls looking sleek. Whether you're a die-hard basketball fan or a sneaker enthusiast, these wall hangings are a stylish way to celebrate the GOAT and inspire greatness in your space.",
    },
    {
        name: "Kakashi Hatake Wall Hanger -- Ninja-Themed Hook",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/kakashiwallhanging/1.png",
            "/landingpage/renamedprod/kakashiwallhanging/2.png",
            "/landingpage/renamedprod/kakashiwallhanging/3.png",
        ],
        description:
            "Bring the essence of Naruto into your home with this Kakashi Wall Hanger, a stylish and functional anime-inspired hook. Designed in the shape of Kakashi Hatake's masked face with his iconic Sharingan eye, this wall hanger is perfect for holding keys, bags, jackets, and more.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Gray", hexCode: "#808080" },
            { name: "Black", hexCode: "#000000" },
        ],
        sizeData: [{ name: "15 cm x 10 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Detailed Kakashi face design with Sharingan eye engraving",
            "Durable and strong enough to hold keys, bags, and light clothing",
            "Easy to install with adhesive backing or screws",
            "Perfect for bedrooms, offices, gaming setups, or anime-themed spaces",
        ],
        productDetails: [
            "Material: Resin with matte finish",
            "Dimensions: 15 cm (L) x 10 cm (B) x 8 cm (H)",
            "Weight: 400 g",
        ],
        highlighted: true,
        productdesc:
            "Elevate your space with this Kakashi Hatake Wall Hanger, a unique blend of fandom and functionality. The intricate design captures Kakashi's mysterious persona, complete with his signature Sharingan eye, making it a standout piece for any Naruto fan. Whether you use it to organize your essentials or simply as a decorative accent, this wall hanger adds a touch of ninja flair to your home. Its sturdy resin construction ensures durability, while the easy installation options make it hassle-free to set up. Perfect for anime enthusiasts, this hanger is more than just a utility—it's a tribute to the legendary Copy Ninja.",
    },
    {
        name: "Kuromi Figure -- Cute Sanrio Character Collectible",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/kuromi/1.png",
            "/landingpage/renamedprod/kuromi/2.png",
        ],
        description:
            "Add a touch of mischief and cuteness to your collection with this Kuromi Figure, inspired by Sanrio's beloved punk-gothic character. Featuring vivid colors, adorable detailing, and a high-quality PVC build, this figure is perfect for Sanrio fans, kawaii lovers, and anime collectors.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Purple", hexCode: "#800080" },
            { name: "Black", hexCode: "#000000" },
        ],
        sizeData: [{ name: "8 cm x 6 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Officially inspired Kuromi design with vibrant colors",
            "Durable PVC construction for long-lasting display",
            "Compact and lightweight for easy placement",
            "Perfect for Sanrio fans, anime lovers, and kawaii collectors",
        ],
        productDetails: [
            "Material: High-quality PVC",
            "Dimensions: 8 cm (L) x 6 cm (B) x 10 cm (H)",
            "Weight: 250 g",
        ],
        highlighted: false,
        productdesc:
            "Embrace the playful rebellion of Kuromi with this charming Sanrio collectible. The figure captures Kuromi's signature gothic-punk style with vibrant colors and meticulous detailing, making it a delightful addition to any kawaii collection. Whether displayed on your desk, shelf, or nightstand, this figure brings a burst of personality to your space. Its compact size makes it easy to place anywhere, while the durable PVC ensures it remains a long-lasting keepsake. Perfect for fans of Sanrio and anime, this Kuromi figure is a must-have for anyone who loves a mix of cute and edgy aesthetics.",
    },
    {
        name: "Merry Christmas Sign -- Personalized Holiday Décor",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/merrychristmassign/1.png",
            "/landingpage/renamedprod/merrychristmassign/2.png",
        ],
        description:
            "Spread the holiday cheer with this beautiful Merry Christmas Sign, a classic decorative piece perfect for homes, offices, parties, and festive setups. Crafted from wood, acrylic, or metal, this sign features intricate cut-out lettering, festive colors, and a sturdy build.",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [
            { name: "Red", hexCode: "#FF0000" },
            { name: "Green", hexCode: "#008000" },
            { name: "Gold", hexCode: "#FFD700" },
        ],
        sizeData: [{ name: "25 cm x 10 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Classic Merry Christmas design with festive embellishments",
            "High-quality material for durability and long-term use",
            "Customizable engraving options for personalized messages",
            "Lightweight and easy to hang or place anywhere",
        ],
        productDetails: [
            "Material: Wood / Acrylic / Metal (Variants Available)",
            "Dimensions: 25 cm (L) x 10 cm (B) x 15 cm (H)",
            "Weight: 500 g",
        ],
        highlighted: true,
        productdesc:
            "Transform your home into a winter wonderland with this elegant Merry Christmas Sign. Whether crafted from rustic wood, sleek acrylic, or polished metal, this sign is a timeless addition to your holiday décor. The intricate cut-out lettering and festive embellishments capture the spirit of the season, while the customizable engraving options allow you to add a personal touch—perfect for family greetings or special messages. Lightweight yet durable, this sign is easy to hang on walls, doors, or above the fireplace, instantly spreading joy and warmth. Ideal for gifting or decorating, it's a cherished piece that will brighten every holiday season.",
    },
    {
        name: "Minecraft Pickaxe Lamp -- Pixel LED Night Light",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/minecraftpickaxelamp/1.png",
            "/landingpage/renamedprod/minecraftpickaxelamp/2.png",
            "/landingpage/renamedprod/minecraftpickaxelamp/3.png",
            "/landingpage/renamedprod/minecraftpickaxelamp/4.png",
            "/landingpage/renamedprod/minecraftpickaxelamp/5.png",
            "/landingpage/renamedprod/minecraftpickaxelamp/6.png",
            "/landingpage/renamedprod/minecraftpickaxelamp/7.png",
            "/landingpage/renamedprod/minecraftpickaxelamp/8.png",
        ],
        description:
            "Brighten up your gaming space with this Minecraft Pickaxe Lamp, a pixel-perfect LED light inspired by the iconic in-game mining tool. Designed to replicate the blocky style of Minecraft, this lamp features a vibrant LED glow, touch-activated lighting, and a USB-powered setup.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Blue", hexCode: "#0000FF" },
            { name: "Yellow", hexCode: "#FFFF00" },
        ],
        sizeData: [{ name: "20 cm x 8 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Pixelated Minecraft pickaxe design with LED glow",
            "USB-powered for easy plug-and-play use",
            "Adjustable brightness settings for ambient lighting",
            "Perfect for gaming setups, bedrooms, and kids' rooms",
        ],
        productDetails: [
            "Material: ABS Plastic & LED Components",
            "Dimensions: 20 cm (L) x 8 cm (B) x 30 cm (H)",
            "Weight: 750 g",
        ],
        highlighted: true,
        productdesc:
            "Step into the blocky world of Minecraft with this Pickaxe Lamp, a functional and nostalgic piece for gamers of all ages. The lamp's pixelated design faithfully recreates the iconic in-game pickaxe, complete with a vibrant LED glow that adds a playful ambiance to any room. With touch-activated controls and adjustable brightness, it's perfect for late-night gaming sessions or as a quirky nightlight. The USB-powered design ensures convenience, while the sturdy ABS plastic construction guarantees durability. Whether you're a die-hard Minecraft fan or just love unique décor, this lamp is a creative way to bring the game's charm into your real-world space.",
    },
    {
        name: "Minecraft Skeleton Keychain -- Pixelated Game Collectible",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/minecraftskeletonkeychain/1.png",
            "/landingpage/renamedprod/minecraftskeletonkeychain/2.png",
            "/landingpage/renamedprod/minecraftskeletonkeychain/3.png",
        ],
        description:
            "Take the world of Minecraft wherever you go with this Minecraft Skeleton Keychain, a detailed pixel-art mini-figure inspired by the game's iconic skeleton mob. Made from high-quality PVC with a blocky design, this keychain is perfect for gamers, collectors, and fans of Minecraft.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "White", hexCode: "#FFFFFF" },
            { name: "Black", hexCode: "#000000" },
        ],
        sizeData: [{ name: "6 cm x 2 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Pixel-art skeleton design, inspired by Minecraft's in-game model",
            "Durable and lightweight PVC construction",
            "Perfect for gaming accessories and fan collections",
            "Secure metal keyring for easy attachment",
        ],
        productDetails: [
            "Material: PVC with metal keyring",
            "Dimensions: 6 cm (L) x 2 cm (B) x 8 cm (H)",
            "Weight: 80 g",
        ],
        highlighted: false,
        productdesc:
            "Keep the spirit of Minecraft close at hand with this adorable Skeleton Keychain. The pixelated design faithfully replicates the game's iconic skeleton mob, making it a fun and nostalgic accessory for fans. Crafted from durable PVC, this keychain is lightweight yet sturdy enough to withstand daily use. Whether attached to your keys, backpack, or gaming gear, it's a playful reminder of your adventures in the blocky world. The secure metal keyring ensures it stays put, while the vibrant colors make it stand out. A must-have for Minecraft enthusiasts, this keychain is a tiny but mighty tribute to the game's charm.",
    },
    {
        name: "Naruto Keychain -- Hidden Leaf Village & Ninja Symbol Keyring",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/narutokeychain/1.png",
            "/landingpage/renamedprod/narutokeychain/2.png",
        ],
        description:
            "Carry the spirit of the Shinobi world with this Naruto Keychain, featuring iconic symbols from the Naruto and Boruto series. Designed for anime fans and collectors, this keychain is available in multiple designs, including the Hidden Leaf Village emblem, Akatsuki cloud, and Naruto's signature kunai.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Red", hexCode: "#FF0000" },
            { name: "Black", hexCode: "#000000" },
            { name: "Blue", hexCode: "#0000FF" },
        ],
        sizeData: [{ name: "6 cm x 3 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Officially inspired Naruto anime designs (Hidden Leaf, Kunai, Akatsuki, Sharingan)",
            "High-quality metal alloy with polished finish",
            "Durable and lightweight for daily use",
            "Perfect gift for Naruto fans, anime collectors, and cosplayers",
        ],
        productDetails: [
            "Material: Zinc Alloy with Enamel Coating",
            "Dimensions: 6 cm (L) x 3 cm (B)",
            "Weight: 80 g",
        ],
        highlighted: false,
        productdesc:
            "Channel your inner ninja with this Naruto Keychain, a stylish tribute to the beloved anime series. Featuring iconic symbols like the Hidden Leaf Village emblem, Akatsuki cloud, and Naruto's kunai, this keychain is a must-have for fans. The high-quality zinc alloy construction ensures durability, while the polished enamel finish adds a touch of elegance. Compact yet detailed, it's perfect for attaching to keys, backpacks, or lanyards. Whether you're a longtime Naruto enthusiast or a new fan, this keychain lets you carry a piece of the Shinobi world wherever you go. A great gift for anime lovers and collectors alike!",
    },
    {
        name: "Pencil Holder -- Modern Desk Organizer",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/pencilholder/1.png",
            "/landingpage/renamedprod/pencilholder/2.png",
            "/landingpage/renamedprod/pencilholder/3.png",
        ],
        description:
            "Keep your workspace neat and stylish with this modern Pencil Holder, a sleek and functional desk organizer designed for students, professionals, and artists. Crafted from durable acrylic, wood, or metal, this holder provides ample space for pens, pencils, markers, and other stationery essentials.",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [
            { name: "Clear", hexCode: "#FFFFFF" },
            { name: "Wood", hexCode: "#8B4513" },
            { name: "Silver", hexCode: "#C0C0C0" },
        ],
        sizeData: [{ name: "10 cm x 10 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Sturdy and stylish design with a premium finish",
            "Spacious compartment for multiple stationery items",
            "Non-slip base for added stability",
            "Lightweight and compact for easy placement",
        ],
        productDetails: [
            "Material: Acrylic / Wood / Metal (Variants Available)",
            "Dimensions: 10 cm (L) x 10 cm (B) x 12 cm (H)",
            "Weight: 400 g",
        ],
        highlighted: false,
        productdesc:
            "Organize your desk with elegance and efficiency using this modern Pencil Holder. Available in sleek acrylic, rustic wood, or polished metal, this holder blends seamlessly with any workspace aesthetic. Its minimalist design ensures it doesn't clutter your desk, while the spacious interior keeps all your stationery within easy reach. The non-slip base provides stability, and the lightweight build makes it easy to move around. Perfect for students, professionals, or artists, this holder is more than just functional—it's a stylish upgrade to your daily routine. Choose the material that suits your style and enjoy a clutter-free, organized workspace.",
    },
    {
        name: "Penguin Christmas Hat Keychain -- Cute Festive Charm",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/penguinchristmashatkeychain/1.png",
            "/landingpage/renamedprod/penguinchristmashatkeychain/2.png",
            "/landingpage/renamedprod/penguinchristmashatkeychain/3.png",
        ],
        description:
            "Bring holiday cheer wherever you go with this adorable Penguin Christmas Hat Keychain, featuring a cute penguin wearing a Santa hat. Made from high-quality PVC with hand-painted detailing, this keychain is perfect for Christmas lovers, winter season enthusiasts, and festive gift exchanges.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Black", hexCode: "#000000" },
            { name: "Red", hexCode: "#FF0000" },
            { name: "White", hexCode: "#FFFFFF" },
        ],
        sizeData: [{ name: "5 cm x 3 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Festive penguin design with a Santa hat",
            "Durable and lightweight PVC construction",
            "Perfect for holiday gifts and stocking stuffers",
            "Secure metal keyring for easy attachment",
        ],
        productDetails: [
            "Material: PVC with metal keyring",
            "Dimensions: 5 cm (L) x 3 cm (B) x 6 cm (H)",
            "Weight: 70 g",
        ],
        highlighted: false,
        productdesc:
            "Spread holiday joy with this charming Penguin Christmas Hat Keychain. The adorable penguin, dressed in a tiny Santa hat, is crafted with hand-painted details that capture the festive spirit. Made from durable PVC, this keychain is lightweight yet sturdy, making it perfect for attaching to keys, backpacks, or even Christmas stockings. Whether you're gifting it to a loved one or treating yourself, this keychain is a delightful way to celebrate the season. Its cheerful design is sure to bring smiles wherever it goes, making it a must-have for anyone who loves Christmas and cute collectibles.",
    },
    {
        name: "Penguin Headphone Stand -- Adorable Desk Organizer",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/penguinheadphonestand/1.png",
            "/landingpage/renamedprod/penguinheadphonestand/2.png",
        ],
        description:
            "Store your headphones in style with this Penguin Headphone Stand, a cute and functional desk accessory designed for gamers, music lovers, and workstation setups. Featuring an adorable penguin shape with a sturdy base, this stand protects your headphones from damage while adding a fun and unique touch to your desk.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Black", hexCode: "#000000" },
            { name: "White", hexCode: "#FFFFFF" },
        ],
        sizeData: [{ name: "12 cm x 10 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Adorable penguin-themed design for a playful aesthetic",
            "Sturdy base and smooth surface to prevent scratches",
            "Compatible with all headphone sizes",
            "Perfect for gaming setups, offices, and study desks",
        ],
        productDetails: [
            "Material: ABS Plastic / Resin",
            "Dimensions: 12 cm (L) x 10 cm (B) x 18 cm (H)",
            "Weight: 650 g",
        ],
        highlighted: true,
        productdesc:
            "Organize your headphones with a touch of whimsy using this Penguin Headphone Stand. Designed to resemble a cute penguin, this stand not only keeps your headphones safe and tangle-free but also adds a playful vibe to your desk. The sturdy base ensures stability, while the smooth surface protects your headphones from scratches. Compatible with all headphone sizes, it's perfect for gamers, music enthusiasts, or anyone who loves quirky desk accessories. Whether placed in your gaming setup, office, or bedroom, this stand is a charming and practical addition to your space. A must-have for penguin lovers and tech enthusiasts alike!",
    },
    {
        name: "PlayStation Controller Holder -- Gaming Accessory Organizer",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/playstationcontrollerholder/1.png",
            "/landingpage/renamedprod/playstationcontrollerholder/2.png",
            "/landingpage/renamedprod/playstationcontrollerholder/3.png",
        ],
        description:
            "Keep your gaming space organized and stylish with this PlayStation Controller Holder, designed to securely hold PS5, PS4, and other gaming controllers. Featuring a sturdy build, anti-slip base, and a sleek gaming aesthetic, this holder ensures your controller is always within reach while protecting it from damage.",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Black", hexCode: "#000000" },
            { name: "White", hexCode: "#FFFFFF" },
        ],
        sizeData: [{ name: "10 cm x 10 cm", price: 9999, originalPrice: 9999 }],
        features: [
            "Custom-molded design for a snug controller fit",
            "Stable base with anti-slip padding",
            "Lightweight yet durable for long-term use",
            "Perfect for gaming rooms, setups, and display collections",
        ],
        productDetails: [
            "Material: ABS Plastic",
            "Dimensions: 10 cm (L) x 10 cm (B) x 15 cm (H)",
            "Weight: 500 g",
        ],
        highlighted: true,
        productdesc:
            "Elevate your gaming setup with this sleek PlayStation Controller Holder. Designed to securely cradle your PS5 or PS4 controller, this stand keeps your gear organized and within easy reach. The custom-molded design ensures a perfect fit, while the anti-slip base prevents any accidental slips or falls. Lightweight yet durable, this holder is built to last and complements any gaming aesthetic. Whether you're a casual player or a hardcore gamer, this stand is a practical and stylish way to display and protect your controllers. A must-have for any PlayStation enthusiast looking to keep their gaming space tidy and professional.",
    },
    {
        name: "PlayStation Game Stand – Gaming Storage & Organizer",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/playstationgamestand/1.png",
            "/landingpage/renamedprod/playstationgamestand/2.png",
        ],
        description:
            "Keep your gaming setup neat and organized with this PlayStation Game Stand, a multi-tier storage rack that holds PlayStation discs, controllers, and accessories. [cite: 1] Made from sturdy ABS plastic or metal, this stand features multiple slots for game cases, a docking space for controllers, and an anti-slip base for stability. [cite: 2] Whether you own a PS4, PS5, or PlayStation Classics, this stand helps declutter your gaming space while keeping your essentials within easy reach. [cite: 3]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Holds up to 12-24 PlayStation game discs (varies by model)",
            "Dedicated space for controllers and accessories",
            "sturdy and stable design with an anti-slip base",
            "Easy to assemble and compact for any gaming setup",
        ],
        productDetails: [
            "Material: ABS Plastic / Metal (Variants Available)",
            "Dimensions: 35 cm (L) x 15 cm (B) x 25 cm (H)",
            "Weight: 1.5 kg",
        ],
        highlighted: false,
        productdesc:
            "Keep your gaming setup neat and organized with this PlayStation Game Stand, a multi-tier storage rack designed to hold PlayStation discs, controllers, and accessories efficiently. [cite: 1] Crafted from sturdy ABS plastic or metal options, this stand boasts multiple slots for game cases, a dedicated docking space for your controllers, and features an anti-slip base to ensure stability. [cite: 2] It's an ideal solution for owners of PS4, PS5, or PlayStation Classics looking to declutter their gaming area while keeping essentials readily accessible. [cite: 3] The stand can hold up to 12-24 game discs (depending on the model) and is easy to assemble, making it a compact and practical addition to any gaming setup. [cite: 4]",
    },
    {
        name: "Pochita Figure – Chainsaw Man Plush & Collectible",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/pochitafigurine/1.png",
            "/landingpage/renamedprod/pochitafigurine/2.png",
        ],
        description:
            "Bring home the cutest devil from Chainsaw Man with this adorable Pochita Figure, a high-quality plush or PVC collectible inspired by Denji's lovable chainsaw companion. [cite: 5] Featuring accurate anime detailing, soft fabric (plush variant), and a compact size, this figure is perfect for display, cuddling, or gifting to Chainsaw Man fans. [cite: 6] Whether placed on a desk, shelf, or nightstand, this Pochita figure adds a touch of cuteness and chaos to your anime collection! [cite: 7]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Authentic anime-accurate design with vibrant colors",
            "Available in plush (soft) or PVC (figure) versions",
            "Lightweight and compact for display or carry",
            "Perfect for Chainsaw Man fans, anime lovers, and collectors",
        ],
        productDetails: [
            "Material: Plush Fabric / PVC (Variants Available)",
            "Dimensions: 10 cm (L) x 8 cm (B) x 12 cm (H)",
            "Weight: 300 g",
        ],
        highlighted: false,
        productdesc:
            "Bring home the cutest devil from Chainsaw Man with this adorable Pochita Figure, inspired by Denji's lovable chainsaw companion. [cite: 5] Available as a high-quality plush or PVC collectible, it features authentic anime-accurate detailing and vibrant colors. [cite: 8] The plush version offers a soft touch, while both variants boast a compact and lightweight design perfect for display, cuddling, or carrying around. [cite: 6, 8] Ideal for gifting to Chainsaw Man fans, anime lovers, or collectors, this figure adds a touch of cuteness and chaos whether placed on a desk, shelf, or nightstand. [cite: 7, 8]",
    },
    {
        name: "Pokémon Keychain – Pokéball & Character Mini Charm",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/pokemonkeychain/1.png",
            "/landingpage/renamedprod/pokemonkeychain/2.png",
            "/landingpage/renamedprod/pokemonkeychain/3.png",
        ],
        description:
            "Catch your favorite Pokémon wherever you go with this Pokémon Keychain, featuring miniature Pokéball designs and iconic Pokémon characters like Pikachu, Charmander, or Bulbasaur. [cite: 9] Made from high-quality zinc alloy with enamel detailing, this keychain is lightweight, compact, and perfect for anime fans, gamers, and collectors. [cite: 10] Whether attached to keys, backpacks, or gaming setups, it brings nostalgia and adventure to your everyday carry. [cite: 11]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Iconic Pokémon character and Pokéball keychain variants",
            "Durable metal construction with vibrant enamel finish",
            "Compact and lightweight for daily use",
            "Perfect for Pokémon fans, trainers, and anime collectors",
        ],
        productDetails: [
            "Material: Zinc Alloy with Enamel Coating",
            "Dimensions: 5 cm (L) x 3 cm (B)",
            "Weight: 80 g",
        ],
        highlighted: false,
        productdesc:
            "Catch your favorite Pokémon wherever you go with this Pokémon Keychain. [cite: 9] Choose from miniature Pokéball designs or keychains featuring iconic characters like Pikachu, Charmander, or Bulbasaur. [cite: 9, 12] Crafted from durable high-quality zinc alloy with a vibrant enamel finish, this keychain is both lightweight and compact, making it ideal for daily use. [cite: 10, 12] It's the perfect accessory for Pokémon fans, trainers, gamers, and anime collectors. [cite: 10, 12] Attach it to your keys, backpack, or gaming setup to bring a touch of Pokémon nostalgia and adventure to your everyday carry. [cite: 11]",
    },
    {
        name: "Raiden Shogun's Engulfing Lightning Sword – Genshin Impact Replica",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/raidenshogunsword(genshinimpact–electroarchonkatana)/1.png",
            "/landingpage/renamedprod/raidenshogunsword(genshinimpact–electroarchonkatana)/2.png",
            "/landingpage/renamedprod/raidenshogunsword(genshinimpact–electroarchonkatana)/3.png",
        ],
        description:
            "Channel the power of the Electro Archon with this Raiden Shogun Sword Replica, inspired by Genshin Impact. [cite: 13] This intricately designed katana features an elegant purple blade, glowing Electro engravings, and a uniquely crafted tsuba. [cite: 14] Ideal for cosplay, gaming collectors, and Genshin fans! [cite: 15]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Purple metallic blade",
            "Electro engravings",
            "Game-accurate design",
            "Lightweight & durable",
        ],
        productDetails: [
            "Length: 106 cm",
            "Blade Color: Purple & silver",
            "Saya: Glossy black",
        ],
        highlighted: false,
        productdesc:
            "Channel the might of the Electro Archon with this stunning replica of Raiden Shogun's Engulfing Lightning Sword from Genshin Impact. [cite: 13] This intricately designed katana captures the essence of the original, featuring an elegant purple metallic blade adorned with glowing Electro engravings and a uniquely crafted, game-accurate tsuba. [cite: 14, 15] Measuring 106 cm in length and crafted to be lightweight yet durable, it's paired with a glossy black saya. [cite: 15] An ideal collectible for devoted Genshin Impact fans, cosplayers, and gaming memorabilia collectors alike. [cite: 15]",
    },
    {
        name: "Ram Lalla Murti – Hindu Religious Idol",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/ramlallastatue/1.png",
            "/landingpage/renamedprod/ramlallastatue/2.png",
            "/landingpage/renamedprod/ramlallastatue/3.png",
        ],
        description:
            "A beautifully crafted Ram Lalla Statue, symbolizing divinity and devotion. [cite: 16] Perfect for home temples, pooja rooms, and gifting. [cite: 17]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Intricately hand-carved with gold accents",
            "Traditional and auspicious design",
        ],
        productDetails: [
            "Material: Marble / Brass (Variants Available)",
            "Weight: 2 kg",
        ],
        highlighted: false,
        productdesc:
            "Embrace divinity and devotion with this beautifully crafted Ram Lalla Murti. [cite: 16] This statue features intricate hand-carved details highlighted with elegant gold accents, reflecting a traditional and auspicious design. [cite: 17] Available in marble or brass variants, this idol weighs approximately 2 kg. [cite: 17] It's a perfect addition to home temples and pooja rooms, and also makes a thoughtful spiritual gift. [cite: 17]",
    },
    {
        name: "Red Hood Mask – DC Comics Cosplay Helmet",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/redhoodmask/1.png",
            "/landingpage/renamedprod/redhoodmask/2.png",
            "/landingpage/renamedprod/redhoodmask/3.png",
        ],
        description:
            "Unleash your vigilante side with this Red Hood Mask, featuring a deep crimson finish, reinforced sculpting, and a snug design. [cite: 18]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Impact-resistant build with a glossy red look",
            "Breathable and comfortable",
        ],
        productDetails: ["Material: ABS plastic", "Weight: 650 g"],
        highlighted: false,
        productdesc:
            "Unleash your inner vigilante with this accurately designed Red Hood Mask, inspired by the iconic DC Comics character. [cite: 18] Featuring a deep, glossy crimson finish and reinforced sculpting, this mask offers an impact-resistant build suitable for cosplay or display. [cite: 18, 19] Crafted from durable ABS plastic, it provides a snug yet breathable and comfortable fit. [cite: 18, 19] Weighing 650g, it's a substantial piece for any collector or cosplayer. [cite: 19]",
    },
    {
        name: "Kyojuro Rengoku Nichirin Katana – Demon Slayer Replica",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/rengokukatana/1.png",
            "/landingpage/renamedprod/rengokukatana/2.png",
        ],
        description:
            "Honor the legacy of the Flame Hashira, Kyojuro Rengoku, with this flaming Nichirin Katana Replica. [cite: 20] Featuring a high-carbon steel blade with flame-shaped patterns, a red and white tsuka, and an iconic flame tsuba, this sword is perfect for cosplayers, collectors, and Demon Slayer enthusiasts. [cite: 21]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Flame-designed blade",
            "High-carbon steel",
            "Red & white tsuka",
            "Comes with saya",
        ],
        productDetails: [
            "Length: 105 cm",
            "Blade Color: Black & orange",
            "Saya: Glossy red",
        ],
        highlighted: false,
        productdesc:
            "Honor the fiery spirit of the Flame Hashira, Kyojuro Rengoku, with this meticulously crafted replica of his Nichirin Katana from Demon Slayer. [cite: 20] This impressive sword features a distinctive high-carbon steel blade adorned with black and orange flame-shaped patterns, capturing the essence of Rengoku's Breathing Style. [cite: 21, 22] The katana boasts a detailed red and white tsuka (handle) and the iconic flame-shaped tsuba (guard). [cite: 21, 22] Measuring 105 cm in length and complete with a glossy red saya (scabbard), this replica is an essential item for dedicated Demon Slayer cosplayers, collectors, and enthusiasts. [cite: 21, 22]",
    },
    {
        name: "Rinnegan Keychain – Naruto Anime Inspired Accessory",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/rinnegankeychain/1.png",
            "/landingpage/renamedprod/rinnegankeychain/2.png",
        ],
        description:
            "Unleash the power of the Rinnegan with this Naruto-inspired keychain, featuring the legendary dojutsu of Uchiha Madara and Pain. [cite: 23] Crafted with high-quality metal alloy and enamel detailing, this keychain showcases the mesmerizing purple spiral design of the Rinnegan, making it a must-have for Naruto fans, anime collectors, and shinobi warriors. [cite: 24] Whether attached to your keys, backpack, or lanyard, this keychain serves as a bold statement of your love for the Naruto universe. [cite: 25]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "High-quality zinc alloy with enamel coating",
            "Intricate Rinnegan design with vibrant purple color",
            "Durable and lightweight for everyday use",
            "Ideal for anime lovers and Naruto collectors",
            "Secure metal keyring attachment",
        ],
        productDetails: [
            "Material: Zinc alloy with enamel finish",
            "Dimensions: 4 cm (D) x 0.5 cm (T)",
            "Weight: 50 g",
        ],
        highlighted: false,
        productdesc:
            "Unleash the formidable power of the Rinnegan with this eye-catching keychain inspired by the legendary dojutsu from the Naruto universe, wielded by figures like Uchiha Madara and Pain. [cite: 23] Expertly crafted from high-quality zinc alloy with detailed enamel coating, it showcases the intricate, mesmerizing purple spiral design of the Rinnegan. [cite: 24, 26] Durable, lightweight, and featuring a secure metal keyring, this accessory is perfect for everyday use. [cite: 26] Attach it to your keys, backpack, or lanyard to make a bold statement about your passion for Naruto. [cite: 25] A must-have for anime lovers, Naruto collectors, and aspiring shinobi warriors! [cite: 24, 26]",
    },
    {
        name: "Rinnegan LED Light Box – Naruto Anime Glow Sign",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/rinnenganlightbox/1.png",
            "/landingpage/renamedprod/rinnenganlightbox/2.png",
            "/landingpage/renamedprod/rinnenganlightbox/3.png",
        ],
        description:
            "Illuminate your space with the power of the Rinnegan! [cite: 27] This Naruto-inspired LED Light Box showcases the legendary purple eye of the Rinnegan, glowing with an eerie and powerful aura. [cite: 28] Featuring custom LED lighting, a sleek acrylic frame, and an ultra-clear design, this light box is perfect for anime fans, collectors, and gaming setups. [cite: 29] Whether mounted on a wall or placed on a desk, this stunning display piece brings the spirit of the Naruto universe to life. [cite: 30]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Bright LED backlight with energy-saving technology",
            "Detailed Rinnegan design in high-quality acrylic",
            "USB-powered for convenience",
            "Perfect for gaming rooms, anime-themed spaces, or ambient lighting",
        ],
        productDetails: [
            "Material: Acrylic & LED components",
            "Dimensions: 20 cm (L) x 3 cm (B) x 18 cm (H)",
            "Weight: 500 g",
        ],
        highlighted: false,
        productdesc:
            "Illuminate your space with the mystical power of the Rinnegan using this stunning Naruto-inspired LED Light Box. [cite: 27, 28] Encased in a sleek acrylic frame, the legendary purple eye glows with an eerie and powerful aura, brought to life by bright, energy-saving LED backlighting. [cite: 28, 29, 31] The ultra-clear design ensures the detailed Rinnegan symbol is the focal point. [cite: 29, 31] Conveniently USB-powered, this light box is perfect for adding ambient lighting to gaming rooms, anime-themed spaces, or any desk. [cite: 29, 31] A must-have for anime fans and collectors looking to bring the spirit of the Naruto universe into their home. [cite: 29, 30]",
    },
    {
        name: "Rock Climber Hanger – Adventure-Themed Wall Hook",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/rockclimberhanger/1.png",
            "/landingpage/renamedprod/rockclimberhanger/2.png",
            "/landingpage/renamedprod/rockclimberhanger/3.png",
        ],
        description:
            "Elevate your wall décor with this Rock Climber Hanger, a unique wall-mounted hook featuring a detailed sculpt of a rock climber in motion. [cite: 32] Designed for outdoor enthusiasts, adventure lovers, and fitness fans, this hanger is perfect for holding keys, jackets, bags, and accessories. [cite: 33] Made from durable resin or metal with a hand-painted finish, it adds a bold and dynamic touch to any entryway, bedroom, or office space. [cite: 34]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Adventure-inspired rock climber design",
            "Strong and durable for hanging essentials",
            "Handcrafted with realistic detailing",
            "Easy to install with mounting hardware included",
        ],
        productDetails: [
            "Material: Resin / Metal (Variants Available)",
            "Dimensions: 12 cm (L) x 8 cm (B) x 15 cm (H)",
            "Weight: 450 g",
        ],
        highlighted: false,
        productdesc:
            "Elevate your home décor with the adventurous spirit of this unique Rock Climber Hanger. [cite: 32] This wall-mounted hook showcases a detailed, hand-painted sculpt of a rock climber in dynamic motion, available in durable resin or metal variants. [cite: 32, 34, 35] Strong and reliable, it's perfect for hanging keys, jackets, bags, or other accessories, making it ideal for outdoor enthusiasts, adventure lovers, or fitness fans. [cite: 33, 35] Easy to install with included hardware, this handcrafted hanger adds a bold touch to entryways, bedrooms, or office spaces. [cite: 34, 35]",
    },
    {
        name: "Senbonzakura Katana – Byakuya Kuchiki's Sword Replica",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/senbonzakurakatana/1.png",
            "/landingpage/renamedprod/senbonzakurakatana/2.png",
        ],
        description:
            "Unleash the power of Senbonzakura, the legendary Zanpakutō wielded by Byakuya Kuchiki in the anime Bleach! [cite: 2] This high-quality katana replica is crafted with precision and attention to detail, featuring a high-carbon stainless steel blade (unsharpened for display/cosplay), a finely wrapped tsuka (handle), and a beautifully engraved tsuba (guard). [cite: 3, 7] Designed for collectors, cosplayers, and anime enthusiasts, this full-sized katana brings the elegance and power of the Soul Society's 6th Division Captain to life. [cite: 4] Perfect for display, sword practice, or cosplay, this is a must-have for any Bleach fan! [cite: 5]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Silver Blade", hexCode: "#C0C0C0" },
            { name: "Crimson Red Handle", hexCode: "#B22222" },
            { name: "Glossy Black Saya", hexCode: "#000000" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Full-sized Senbonzakura katana replica",
            "High-carbon steel blade with mirror-polish finish (unsharpened)",
            "Authentic hand-wrapped tsuka",
            "Engraved golden tsuba with intricate detailing",
            "Includes black lacquered wooden scabbard (saya) with glossy finish and silver accents",
            "Perfect for cosplay, display, and collectors",
        ],
        productDetails: [
            "Officially inspired Bleach anime sword replica",
            "Overall length: 104 cm (41 inches)",
            "Blade Length: 71 cm (28 inches)",
            "Handle Length: 26 cm (10 inches)",
            "Blade Material: High-quality stainless steel",
            "Tsuka: Traditional ray-skin style grip with red ito fabric wrap",
            "Saya: Black lacquered wood with silver accents",
            "Weight: 1.2 kg",
            "Well-balanced design for handling and display",
        ],
        highlighted: false,
        productdesc:
            "Unleash the power of Senbonzakura with this high-quality replica of the legendary Zanpakutō wielded by Byakuya Kuchiki in Bleach. [cite: 2] Crafted with precision, this full-sized (104 cm) katana features a mirror-polished, high-carbon steel blade (unsharpened for safety), an authentically hand-wrapped crimson red tsuka with a traditional ray-skin style grip, and a beautifully engraved golden tsuba. [cite: 3, 6, 7, 8, 10] Complete with a glossy black lacquered wooden saya with silver accents, this replica embodies the elegance and strength of the 6th Division Captain. [cite: 4, 6] Ideal for collectors, cosplayers, and any Bleach enthusiast, it's perfect for display or completing your Byakuya cosplay. [cite: 4, 5, 6, 12]",
    },
    // {
    //   name: "Simon's Cat Wall Hanging – Funny Cat-Themed Decor",
    //   price: 9999,
    //   originalPrice: 9999,
    //   images: [
    //     "/placeholder/product_images/simons_cat/1.1.png",
    //     "/placeholder/product_images/simons_cat/1.2.png",
    //   ],
    //   description:
    //     "Bring humor and feline charm to your walls with this Simon's Cat Wall Hanging, inspired by the beloved internet-famous animated cat. [cite: 14] Featuring a playful, hand-drawn design of Simon's Cat in a funny pose, this high-quality MDF or metal wall art is perfect for cat lovers, cartoon fans, and quirky home decor enthusiasts. [cite: 15] Whether displayed in a living room, kitchen, or office, this piece adds a lighthearted and charming touch to your space. [cite: 16]",
    //   isCustomizable: false,
    //   category: "Home Decor & Wall Art",
    //   colorData: [],
    //   sizeData: [],
    //   features: [
    //     "Officially inspired Simon's Cat design with intricate detailing",
    //     "Premium laser-cut MDF or metal with a smooth finish",
    //     "Lightweight and easy to mount",
    //     "Perfect for pet lovers, cartoon enthusiasts, and modern decor",
    //   ],
    //   productDetails: [
    //     "Material: MDF Wood / Metal (Variants Available)",
    //     "Dimensions: 25 cm (L) x 2 cm (B) x 20 cm (H)",
    //     "Weight: 400 g",
    //   ],
    //   highlighted: false,
    //   productdesc:
    //     "Add a dose of humor and feline charm to any room with this delightful Simon's Cat Wall Hanging. [cite: 14] Inspired by the beloved animated internet sensation, this wall art features a playful, laser-cut design of Simon's Cat in a signature funny pose. [cite: 15, 17] Available in premium MDF wood or metal with a smooth finish, it's lightweight and easy to mount. [cite: 17] Perfect for cat lovers, cartoon fans, or anyone looking to add a quirky, lighthearted touch to their living room, kitchen, or office decor. [cite: 15, 16, 17]",
    // },
    // {
    //   name: "Snowy Owl Book Nook – Enchanted Bookshelf Diorama",
    //   price: 9999,
    //   originalPrice: 9999,
    //   images: [
    //     "/placeholder/product_images/owl_booknook/1.1.png",
    //     "/placeholder/product_images/owl_booknook/1.2.png",
    //   ],
    //   description:
    //     "Elevate your bookshelf into a magical realm with this Snowy Owl Book Nook, a beautifully handcrafted diorama designed to create an immersive miniature world within your bookshelves. [cite: 18] Featuring a realistic snowy owl perched amidst an enchanted forest, this book nook is illuminated with soft LED lighting, enhancing its mystical ambiance. [cite: 19] Crafted with intricate wood detailing, hand-painted textures, and a cozy warm glow, this piece is perfect for book lovers, fantasy fans, and collectors. [cite: 20] Whether used as a reading nook décor or a conversation starter, this book nook transports you to a world of wonder every time you glance at your shelf. [cite: 21]",
    //   isCustomizable: false,
    //   category: "Home & Office Décor",
    //   colorData: [],
    //   sizeData: [],
    //   features: [
    //     "Handcrafted miniature diorama with detailed woodwork",
    //     "Soft LED lighting for a warm, magical glow",
    //     "Realistic snowy owl perched in an enchanted forest scene",
    //     "High-quality materials for durability and longevity",
    //     "Compact and lightweight for easy bookshelf placement",
    //   ],
    //   productDetails: [
    //     "Material: Wood, resin, LED lights, acrylic paint",
    //     "Dimensions: 22 cm (L) x 12 cm (B) x 24 cm (H)",
    //     "Weight: 1.5 kg",
    //   ],
    //   highlighted: false,
    //   productdesc:
    //     "Transform your bookshelf into a miniature magical realm with this enchanting Snowy Owl Book Nook. [cite: 18] This beautifully handcrafted diorama features a realistic snowy owl perched within a detailed enchanted forest scene. [cite: 19, 22] Illuminated by soft, warm LED lighting, it creates a cozy and mystical ambiance right between your books. [cite: 19, 20, 22] Made from high-quality wood and resin with intricate, hand-painted details, it's built for durability. [cite: 20, 22] Compact and lightweight, it fits perfectly on any bookshelf, making it an ideal gift for book lovers, fantasy fans, and collectors, or simply a captivating piece of reading nook décor. [cite: 20, 21, 22]",
    // },
    {
        name: "Spider-Man 2099 Mask – High-Tech Future Suit",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/spiderman2099mask/1.png",
            "/landingpage/renamedprod/spiderman2099mask/2.png",
            "/landingpage/renamedprod/spiderman2099mask/3.png",
        ],
        description:
            "Become the futuristic web-slinger with this Spider-Man 2099 Mask, inspired by Miguel O'Hara's sleek and powerful suit. [cite: 23] This full-face helmet features vivid blue and red detailing, breathable mesh eye panels, and a lightweight yet durable design, making it perfect for cosplay, display, or Spider-Verse fans. [cite: 24]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Full-face Spider-Man 2099 mask with glossy blue finish",
            "Breathable mesh red eye lenses",
            "Lightweight, high-durability material for comfortable wear",
            "Accurate design inspired by Miguel O'Hara's suit",
        ],
        productDetails: [
            "Material: ABS plastic with glossy finish",
            "Dimensions: Universal fit for adults",
            "Weight: 650 g",
        ],
        highlighted: false,
        productdesc:
            "Step into the future as Miguel O'Hara with this sleek Spider-Man 2099 Mask. [cite: 23] Inspired by the high-tech suit from the Spider-Verse, this full-face helmet showcases the iconic vivid blue and red detailing with a glossy finish. [cite: 24, 25] Made from lightweight yet durable ABS plastic, it features breathable mesh red eye lenses for comfortable wear during cosplay events or for display. [cite: 24, 25] Designed with a universal fit for adults, this mask is a must-have for Spider-Man 2099 enthusiasts and collectors. [cite: 24, 25]",
    },
    {
        name: "Spider-Man Miles Morales Mask – Ultimate Edition",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/spidermanmilemoralesmask/1.png",
            "/landingpage/renamedprod/spidermanmilemoralesmask/2.png",
            "/landingpage/renamedprod/spidermanmilemoralesmask/3.png",
        ],
        description:
            "Swing into action with this Miles Morales Spider-Man Mask, featuring his signature black and red suit design. [cite: 26] This movie-accurate replica includes breathable mesh eye panels, textured webbing details, and a snug ergonomic fit, making it ideal for cosplay and collectors. [cite: 27]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Black & red web pattern inspired by the animated Spider-Verse",
            "Breathable and lightweight design",
            "Comfortable fit with adjustable straps",
            "Textured webbing details",
            "Movie-accurate replica",
        ],
        productDetails: [
            "Material: ABS plastic with matte finish",
            "Weight: 500 g",
            "Ergonomic fit",
        ],
        highlighted: false,
        productdesc:
            "Swing into action like Miles Morales with this Ultimate Edition Spider-Man Mask. [cite: 26] Capturing the signature black and red suit design with textured webbing details, this replica is inspired by the animated Spider-Verse. [cite: 26, 27, 28] Made from ABS plastic with a matte finish, it offers a breathable and lightweight design for comfort. [cite: 27, 28] The snug, ergonomic fit is enhanced by adjustable straps, making it perfect for cosplay events or as a standout piece for collectors. [cite: 27, 28]",
    },
    {
        name: "Spongebob Squarepants Figure – Fun Collectible Figurine",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/spongebobfigure/1.png",
            "/landingpage/renamedprod/spongebobfigure/2.png",
            "/landingpage/renamedprod/spongebobfigure/3.png",
        ],
        description:
            "Bring home the undersea fun with this Spongebob Squarepants Figure, a high-quality collectible inspired by the world's favorite sponge! [cite: 29] With vivid colors, a dynamic pose, and durable craftsmanship, this figurine is perfect for display, gifting, or adding some Bikini Bottom vibes to your desk. [cite: 30] Whether you're a fan of the show, a figure collector, or simply looking for a fun decorative piece, this Spongebob figurine is a must-have for cartoon lovers of all ages. [cite: 31]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Detailed, character-accurate Spongebob design with expressive face",
            "High-quality, durable PVC material",
            "Perfect for desks, shelves, and display collections",
            "Lightweight yet sturdy build",
            "Vivid colors and dynamic pose",
        ],
        productDetails: [
            "Material: High-quality PVC",
            "Dimensions: 10 cm (L) x 7 cm (B) x 12 cm (H)",
            "Weight: 250 g",
        ],
        highlighted: false,
        productdesc:
            "Are ya ready, kids? Bring the infectious fun of Bikini Bottom home with this high-quality Spongebob Squarepants Figure! [cite: 29] Capturing the world's favorite sponge in a dynamic pose with vivid colors and an expressive face, this collectible is crafted from durable PVC material. [cite: 30, 32] Lightweight yet sturdy, it's perfect for brightening up desks, shelves, or display collections. [cite: 30, 32] A must-have for fans of the show, figure collectors, or anyone needing a dose of optimistic absurdity, this Spongebob figurine is fun for all ages. [cite: 31, 32]",
    },
    {
        name: "Spotify Keychain – Custom Music Code Tag",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/spotifykeychain/1.png",
            "/landingpage/renamedprod/spotifykeychain/2.png",
        ],
        description:
            "Carry your favorite song wherever you go with this customized Spotify Keychain, designed for music lovers and trendsetters. [cite: 33] Featuring a high-quality acrylic or metal finish, this keychain comes engraved with a Spotify code that instantly plays your chosen song when scanned via the Spotify app. [cite: 34] Whether it's a special dedication, a favorite track, or a song that holds memories, this unique keychain is a thoughtful gift for friends, partners, and music enthusiasts. [cite: 35]",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Customizable with any Spotify song, playlist, or album",
            "High-quality acrylic or metal construction",
            "Laser-engraved Spotify code for instant scanning",
            "Lightweight and compact for daily use",
            "Ideal for gifting on birthdays, anniversaries, and special occasions",
        ],
        productDetails: [
            "Material: Acrylic / Metal (Variants Available)",
            "Dimensions: 6 cm (L) x 2 cm (B)",
            "Weight: 30 g",
        ],
        highlighted: false,
        productdesc:
            "Keep your favorite tune close at hand with this personalized Spotify Keychain. [cite: 33] Choose any song, playlist, or album on Spotify, and its unique code will be laser-engraved onto a high-quality acrylic or metal tag. [cite: 34, 36] Simply scan the code with the Spotify app to instantly play your music. [cite: 34] Lightweight and compact, it's perfect for everyday carry. [cite: 36] It makes a unique and thoughtful gift for music lovers, friends, or partners, ideal for birthdays, anniversaries, or just because. [cite: 35, 36]",
    },
    {
        name: "Spotify Keychain with Image – Personalized Song & Photo Tag",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/spotifykeychainwithimage/1.png",
            "/landingpage/renamedprod/spotifykeychainwithimage/2.png",
            "/landingpage/renamedprod/spotifykeychainwithimage/3.png",
        ],
        description:
            "Cherish a song and a memory together with this Spotify Keychain with Image, a perfect blend of music and personalization. [cite: 37] This unique keychain features a custom Spotify code that plays your chosen song instantly, along with a printed image of your choice, making it an ideal sentimental gift. [cite: 38] Whether it's a romantic dedication, a nostalgic track, or a best friend's anthem, this keychain is a creative and heartfelt way to celebrate special moments. [cite: 39] Made from high-quality acrylic or metal, it's durable, stylish, and a must-have for music lovers. [cite: 40]",
        isCustomizable: true,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Personalized Spotify code for any song, playlist, or album",
            "Custom printed photo for added sentimental value",
            "High-quality acrylic or metal finish with a smooth surface",
            "Lightweight, stylish, and compact for everyday use",
            "Ideal for gifting on birthdays, anniversaries, Valentine's Day, and more",
        ],
        productDetails: [
            "Material: Acrylic / Metal (Variants Available)",
            "Dimensions: 6 cm (L) x 3 cm (B)",
            "Weight: 35 g",
        ],
        highlighted: false,
        productdesc:
            "Combine your favorite song with a cherished memory using this personalized Spotify Keychain with Image. [cite: 37] This unique accessory features a scannable Spotify code for any song, playlist, or album, alongside a custom printed photo of your choice. [cite: 38, 41] Crafted from high-quality acrylic or metal with a smooth finish, it's both stylish and durable. [cite: 40, 41] Lightweight and compact, it's perfect for everyday use. [cite: 41] It serves as a creative and heartfelt gift for birthdays, anniversaries, Valentine's Day, or any occasion celebrating special moments and the music that defines them. [cite: 39, 41]",
    },
    {
        name: "Star Wars Bookmark – Sci-Fi Collectible Page Holder",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/starwarsbookmark/1.png",
            "/landingpage/renamedprod/starwarsbookmark/2.png",
        ],
        description:
            "Mark your place in the galaxy with this Star Wars Bookmark, a sleek and stylish page holder inspired by your favorite characters, ships, and symbols from the Star Wars saga. [cite: 42] Made from premium metal or acrylic, this bookmark features intricate laser-cut engravings of Darth Vader, Yoda, the Millennium Falcon, or the Rebel/Imperial insignias. [cite: 43] Whether you're reading a Jedi archive or a classic novel, this bookmark is a must-have for any Star Wars fan. [cite: 44]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Premium metal or acrylic design with Star Wars motifs",
            "Features intricate laser-cut engravings (e.g., Vader, Yoda, Falcon, insignias)",
            "Slim and lightweight for easy page marking",
            "Durable and long-lasting construction",
            "Perfect for book lovers, students, and Star Wars enthusiasts",
        ],
        productDetails: [
            "Material: Stainless Steel / Acrylic (Variants Available)",
            "Dimensions: 15 cm (L) x 3 cm (B)",
            "Weight: 50 g",
        ],
        highlighted: false,
        productdesc:
            "Mark your page in galactic style with this sleek Star Wars Bookmark. [cite: 42] Crafted from premium stainless steel or durable acrylic, each bookmark features intricate laser-cut engravings inspired by the Star Wars saga – choose from iconic characters like Darth Vader or Yoda, legendary ships like the Millennium Falcon, or classic Rebel/Imperial insignias. [cite: 43, 45] Slim, lightweight, and built to last, it's the perfect page holder for any reading adventure, whether it's a Jedi archive or a terrestrial novel. [cite: 44, 45] An essential accessory for book lovers, students, and Star Wars enthusiasts across the galaxy. [cite: 45]",
    },
    {
        name: "Suzuki Jimny Diecast Model – 1:24 Scale Mini SUV",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/suzukijimny/1.png",
            "/landingpage/renamedprod/suzukijimny/2.png",
        ],
        description:
            "Bring the adventure home with this Suzuki Jimny Diecast Model, a highly detailed miniature replica of the legendary off-road mini SUV. [cite: 46] Designed for diecast collectors and 4x4 enthusiasts, this 1:24 or 1:18 scale model features realistic detailing, opening doors, a functional hood, and rubber tires, making it a must-have for Jimny lovers and car enthusiasts. [cite: 47] Whether displayed on a desk, shelf, or dashboard, this model captures the rugged spirit of the Jimny in a compact collectible. [cite: 48]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [
            { name: "1:24 Scale", price: 9999, originalPrice: 9999 },
            { name: "1:18 Scale" },
        ],
        features: [
            "Realistic Suzuki Jimny design with intricate detailing",
            "Diecast metal body with a premium paint finish",
            "Opening doors, hood, and trunk with interior detailing",
            "Rubber tires for an authentic rolling effect",
            "Available in 1:24 or 1:18 scale",
        ],
        productDetails: [
            "Material: Diecast Metal with Plastic Components",
            "Scale: 1:24 / 1:18 (Variants Available)",
            "Dimensions (approx. for 1:24): 18 cm (L) x 9 cm (B) x 8 cm (H)",
            "Weight: 750 g",
        ],
        highlighted: false,
        productdesc:
            "Capture the rugged charm of the legendary Suzuki Jimny with this highly detailed diecast model. [cite: 46] Perfect for collectors and 4x4 enthusiasts, this miniature replica boasts a diecast metal body with a premium paint finish and realistic detailing inside and out. [cite: 47, 49] Featuring opening doors, hood, and trunk, plus authentic rubber tires, it brings the iconic mini SUV to life. [cite: 49] Available in 1:24 or 1:18 scale, it's ideal for display on a desk, shelf, or dashboard, embodying the adventurous spirit of the Jimny in a collectible format. [cite: 47, 48, 49]",
    },

    {
        name: "Tanjiro Kamado Nichirin Katana – Demon Slayer Sword Replica",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/tanjirokatana/1.png",
            "/landingpage/renamedprod/tanjirokatana/2.png",
        ],
        description:
            "Step into the world of Demon Slayer with this Tanjiro Kamado Nichirin Katana Replica, an exact recreation of the legendary blade wielded by Tanjiro Kamado[cite: 2]. This full-sized katana features a high-carbon steel black blade, a traditional hand-wrapped tsuka (handle), and the distinctive flame-like silver edge, making it perfect for cosplay, display, and collectors[cite: 3]. Whether you're battling demons or showcasing it in your anime collection, this katana is an essential for any Demon Slayer fan! [cite: 4]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [
            { name: "Jet Black Blade", hexCode: "#000000" },
            { name: "Silver Edge", hexCode: "#C0C0C0" },
            { name: "Black Handle/White Wrap", hexCode: "#FFFFFF" },
            { name: "Black/Red Tsuba", hexCode: "#8B0000" },
            { name: "Glossy Black Saya", hexCode: "#000000" },
        ],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Full-scale Nichirin katana replica",
            "High-carbon black steel blade with silver accents",
            "Traditional hand-wrapped tsuka for grip",
            "Signature tsuba (guard) in a circular shape with black and red details",
            "Comes with a high-quality black scabbard (saya)",
            "Perfect for cosplay, anime collection, and display",
        ],
        productDetails: [
            "Officially inspired Demon Slayer sword replica",
            "Overall length: 104 cm (41 inches) [cite: 8]",
            "Blade Length: 71 cm (28 inches) [cite: 8]",
            "Handle Length: 26 cm (10 inches) [cite: 8]",
            "Blade Material: Premium high-carbon stainless steel (black oxidized finish) [cite: 5, 6]",
            "Tsuka: Hand-wrapped with ray-skin style grip [cite: 5]",
            "Tsuba: Red and black flame motif [cite: 5]",
            "Saya: Black lacquered wood [cite: 5, 6]",
            "Weight: 1.1 kg [cite: 8]",
            "Lightweight yet durable construction [cite: 5]",
        ],
        highlighted: false,
        productdesc:
            "Wield the blade of Tanjiro Kamado with this full-scale Nichirin Katana replica from Demon Slayer[cite: 2]. Crafted from premium high-carbon stainless steel, the distinctive black oxidized blade features the iconic silver edge[cite: 3, 5, 6]. The sword boasts a traditional hand-wrapped tsuka with a ray-skin style grip for comfort and authenticity, alongside Tanjiro's signature circular tsuba with its red and black flame motif[cite: 5]. Complete with a black lacquered wooden saya, this 104 cm replica is lightweight yet durable, perfect for cosplay, collection displays, or any Demon Slayer enthusiast looking to capture the spirit of Tanjiro's journey[cite: 4, 5, 8].",
    },
    {
        name: "Tealight Christmas Star – Holiday Candle Holder",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/tealightchristmasstar/1.png",
            "/landingpage/renamedprod/tealightchristmasstar/2.png",
            "/landingpage/renamedprod/tealightchristmasstar/3.png",
        ],
        description:
            "Create a warm holiday ambiance with this Tealight Christmas Star, a beautifully crafted candle holder perfect for Christmas celebrations, dinner tables, and festive décor[cite: 12]. Made from premium-quality metal with gold or silver finishes, this star-shaped holder provides a soft, glowing effect when a tealight candle is placed inside[cite: 13]. Whether used as table décor, a centerpiece, or a hanging ornament, this piece adds a touch of elegance and warmth to your Christmas celebrations[cite: 14].",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Intricate star-shaped design with a metallic finish (gold/silver)",
            "Holds standard tealight candles for a warm, cozy glow",
            "Lightweight and durable for long-term use",
            "Perfect for Christmas trees, mantelpieces, and holiday décor",
        ],
        productDetails: [
            "Material: Metal with gold/silver plating",
            "Dimensions: 15 cm (L) x 5 cm (B) x 15 cm (H)",
            "Weight: 400 g",
        ],
        highlighted: false,
        productdesc:
            "Add a touch of elegance and warmth to your holiday celebrations with this Tealight Christmas Star[cite: 14]. Beautifully crafted from premium metal with a lustrous gold or silver finish, this intricate star-shaped holder is designed to cradle a standard tealight candle, casting a soft, cozy glow[cite: 12, 13, 15]. Lightweight yet durable, it's perfect for use as festive table décor, a charming centerpiece, adorning a mantelpiece, or even as a hanging ornament on your Christmas tree[cite: 14, 15].",
    },
    {
        name: "Toji Spear – Full-Scale Jujutsu Kaisen Replica",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/tojispear/1.png",
            "/landingpage/renamedprod/tojispear/2.png",
            "/landingpage/renamedprod/tojispear/3.png",
        ],
        description:
            "Wield the power of Toji Fushiguro with this life-sized Toji Spear Replica, inspired by his iconic weapon from Jujutsu Kaisen[cite: 16]. Crafted from high-quality stainless steel with a sleek matte finish, this replica features precise engravings, a balanced design, and a realistic handle grip, making it perfect for cosplay, display, and anime collectors[cite: 17]. Whether you're showcasing it in your anime shrine or using it for an event, this spear embodies the lethal elegance of the Sorcerer Killer himself[cite: 18].",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Movie-accurate design with detailed engravings",
            "Durable metal construction for an authentic feel",
            "Comfortable, anti-slip grip for handling and display",
            "Perfect for Jujutsu Kaisen cosplay, collectors, and anime fans",
            "Life-sized replica",
        ],
        productDetails: [
            "Material: Stainless Steel & Resin",
            "Dimensions: 140 cm (L) x 5 cm (B)",
            "Weight: 1.8 kg",
        ],
        highlighted: false,
        productdesc:
            "Embody the lethal elegance of the Sorcerer Killer, Toji Fushiguro, with this full-scale replica of his iconic spear from Jujutsu Kaisen[cite: 16, 18]. Crafted from high-quality stainless steel and resin with a sleek matte finish, this impressive 140 cm weapon features movie-accurate design and detailed engravings[cite: 17, 19]. Its durable metal construction provides an authentic feel, while the balanced design and comfortable, anti-slip grip make it suitable for handling during cosplay or for prominent display[cite: 17, 19]. A must-have for dedicated Jujutsu Kaisen cosplayers and anime collectors[cite: 17, 19].",
    },
    {
        name: "Tooned Toyota AE86 – Cartoon-Style Mini Car Collectible",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/toonedtoyotaae86/1.png",
            "/landingpage/renamedprod/toonedtoyotaae86/2.png",
        ],
        description:
            "Drift into nostalgia with this Tooned Toyota AE86, a stylized miniature replica of the legendary Toyota AE86 Trueno, famous from Initial D and JDM culture[cite: 20]. Designed with a cartoon-like exaggerated aesthetic, this collectible diecast model features oversized wheels, a compact body, and a playful yet detailed design[cite: 21]. Whether you're a JDM enthusiast, diecast car collector, or an anime/manga fan, this fun-sized AE86 brings a unique and exciting twist to your collection[cite: 22].",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            'Exaggerated "tooned" design with oversized wheels',
            "Diecast metal body with premium paint finish",
            "Rolling wheels for smooth motion",
            "Perfect for car collectors, JDM fans, and anime lovers",
            "Stylized replica of the Toyota AE86 Trueno",
        ],
        productDetails: [
            "Material: Diecast metal with plastic components",
            "Dimensions: 7 cm (L) x 4 cm (B) x 3 cm (H)",
            "Weight: 120 g",
        ],
        highlighted: false,
        productdesc:
            "Add a playful twist to your collection with the Tooned Toyota AE86, a fun, cartoon-styled take on the legendary Trueno from Initial D and JDM fame[cite: 20, 21]. This miniature diecast model features an exaggerated aesthetic with oversized, rolling wheels and a compact body, all crafted from diecast metal with a premium paint finish[cite: 21, 23]. Measuring just 7cm long, this stylized collectible is perfect for JDM enthusiasts, diecast collectors, and anime/manga fans looking for a unique piece[cite: 22, 23].",
    },
    {
        name: "Toothless Dragon Figure – Night Fury Collectible Statue",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/toothlessdragonfigurine/1.png",
            "/landingpage/renamedprod/toothlessdragonfigurine/2.png",
            "/landingpage/renamedprod/toothlessdragonfigurine/3.png",
        ],
        description:
            "Bring home the magic of Berk with this Toothless Dragon Figure, a beautifully crafted collectible inspired by the How to Train Your Dragon movie series[cite: 24]. Featuring Toothless in an action pose with detailed scales, expressive eyes, and a sleek matte black finish, this figure is a must-have for DreamWorks animation fans and collectors[cite: 25]. Whether displayed on a desk, shelf, or alongside other dragon figurines, this Night Fury replica captures the spirit of adventure and loyalty[cite: 26].",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Intricate detailing with a realistic dragon scale texture",
            "Durable and lightweight premium PVC construction",
            "Perfect for How to Train Your Dragon fans and collectors",
            "Stable base for display in any collection setup",
            "Features Toothless in an action pose with expressive eyes",
        ],
        productDetails: [
            "Material: High-quality PVC",
            "Dimensions: 15 cm (L) x 12 cm (B) x 10 cm (H)",
            "Weight: 450 g",
        ],
        highlighted: false,
        productdesc:
            "Capture the magic and adventure of How to Train Your Dragon with this beautifully crafted Toothless figure[cite: 24, 26]. This Night Fury collectible statue features intricate, realistic scale texture, expressive eyes, and Toothless posed for action, all in a sleek matte black finish[cite: 25, 27]. Made from durable, high-quality PVC, it includes a stable base for easy display on any desk or shelf[cite: 27]. A must-have for fans of the DreamWorks movies and collectors of dragon figurines[cite: 25, 27].",
    },
    {
        name: "UFO Lamp – Hovering LED Night Light",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/ufolamp/1.png",
            "/landingpage/renamedprod/ufolamp/2.png",
        ],
        description:
            "Bring the mystery of outer space into your home with this UFO Lamp, an eye-catching floating spaceship design that levitates using magnetic suspension while glowing with soft LED lighting[cite: 28]. Featuring a futuristic hovering effect, this lamp is perfect for sci-fi lovers, gaming setups, and modern room décor[cite: 29]. Whether placed on a desk, shelf, or nightstand, it creates an otherworldly ambiance that captivates anyone who sees it[cite: 30].",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Magnetic levitation technology for a floating effect",
            "Soft LED glow with multiple color options",
            "Futuristic UFO spaceship design",
            "Perfect for gaming rooms, bedrooms, and sci-fi setups",
            "Creates an otherworldly ambiance",
        ],
        productDetails: [
            "Material: ABS Plastic with LED Components",
            "Dimensions: 20 cm (D) x 25 cm (H)",
            "Weight: 1.2 kg",
        ],
        highlighted: false,
        productdesc:
            "Introduce an otherworldly ambiance to your space with the levitating UFO Lamp[cite: 28, 30]. This eye-catching lamp features a futuristic spaceship design that magically floats using magnetic suspension technology[cite: 28, 31]. It emits a soft LED glow with multiple color options, creating a captivating atmosphere perfect for gaming rooms, bedrooms, sci-fi themed setups, or modern décor[cite: 29, 31]. Made from ABS plastic, it's a conversation starter for any sci-fi lover[cite: 29, 31].",
    },
    {
        name: "Wolverine Mask – Marvel X-Men Cosplay Helmet",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/wolverinemask/1.png",
            "/landingpage/renamedprod/wolverinemask/2.png",
            "/landingpage/renamedprod/wolverinemask/3.png",
            "/landingpage/renamedprod/wolverinemask/4.png",
        ],
        description:
            "Unleash your inner mutant with this Wolverine Mask, a detailed replica of Logan's iconic headgear from Marvel's X-Men series[cite: 32]. Featuring a lightweight yet durable build, sculpted details, and an adjustable fit, this mask is perfect for cosplay, Halloween, or display[cite: 33]. Whether you're a Wolverine fan, Marvel collector, or superhero enthusiast, this mask brings authenticity and fierce energy to your collection[cite: 34].",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Movie-accurate Wolverine helmet design",
            "Comfortable fit with adjustable straps",
            "Durable ABS plastic with premium paint finish",
            "Perfect for cosplay, themed parties, and Marvel collectors",
            "Lightweight build with sculpted details",
        ],
        productDetails: [
            "Material: ABS Plastic",
            "Dimensions: Universal Adult Fit",
            "Weight: 750 g",
        ],
        highlighted: false,
        productdesc:
            "Go berserk with this detailed Wolverine Mask, replicating Logan's iconic X-Men headgear[cite: 32]. Crafted from durable ABS plastic with a premium paint finish, this movie-accurate helmet is surprisingly lightweight yet built to last[cite: 33, 35]. Featuring sculpted details and adjustable straps for a comfortable, universal adult fit, it's perfect for unleashing your inner mutant at cosplay events, Halloween parties, or as a fierce display piece for Marvel collectors[cite: 33, 34, 35].",
    },
    {
        name: "Zenitsu Agatsuma Nichirin Katana – Demon Slayer Replica",
        price: 9999,
        originalPrice: 9999,
        images: [
            "/landingpage/renamedprod/zenitsukatana/1.png",
            "/landingpage/renamedprod/zenitsukatana/2.png",
        ],
        description:
            "Inspired by Zenitsu Agatsuma's Thunder Breathing Technique, this Nichirin Katana Replica features a yellow lightning-patterned blade, a white and gold-wrapped tsuka, and a detailed tsuba (guard)[cite: 36]. Made for cosplayers and Demon Slayer fans, this sword brings authenticity and high-quality craftsmanship to your collection! [cite: 37]",
        isCustomizable: false,
        category: "Trending-Now",
        colorData: [{ name: "Standard", hexCode: "#FFFFFF" }],
        sizeData: [{ name: "R", price: 9999, originalPrice: 9999 }],
        features: [
            "Lightning-patterned blade (Yellow & Silver)",
            "Handcrafted tsuba",
            "High-carbon steel construction",
            "Lightweight & durable",
            "White and gold-wrapped tsuka",
        ],
        productDetails: [
            "Overall Length: 104 cm",
            "Blade Material: High-carbon steel",
            "Blade Color: Yellow & silver",
            "Saya: Glossy white",
        ],
        highlighted: false,
        productdesc:
            "Channel the speed of Thunder Breathing with this replica of Zenitsu Agatsuma's Nichirin Katana from Demon Slayer[cite: 36]. This high-quality sword features the iconic yellow and silver lightning-patterned blade, meticulously crafted from high-carbon steel[cite: 36, 38]. The design includes a white and gold-wrapped tsuka for an authentic grip and a detailed, handcrafted tsuba[cite: 36, 38]. Lightweight yet durable, and measuring 104 cm, it comes complete with a glossy white saya. Perfect for Zenitsu cosplayers and Demon Slayer collectors seeking authenticity and craftsmanship[cite: 37, 38].",
    },
].map((product) => ({
    ...product,
    features: product.features || generateRandomFeatures(),
    productDetails: product.productDetails || generateRandomProductDetails(),
    productdesc:
        product.productdesc ||
        generateRandomProductDesc(product.name, product.category),
}));

async function main() {
    for (const product of prebuiltProducts) {
        const {
            colorData,
            sizeData,
            features,
            productDetails,
            productdesc,
            highlighted,
            ...productData
        } = product;

        // await prisma.prebuiltProducts.create({
        //     // data: {
        //     //     ...productData,
        //     //     id: randomUUID(),
        //     //     highlighted, // Ensure highlighted is added here
        //     //     // availableColors: colorData.map((c) => c.name),
        //     //     // availableSizes: sizeData.map((s) => s.name),
        //     //     features: features,
        //     //     // productDetails: productDetails,
        //     //     // productdesc: productdesc,
        //     //     // colors: {
        //     //     //     create: colorData.map((color) => ({
        //     //     //         id: randomUUID(),
        //     //     //         name: color.name,
        //     //     //         hexCode: color.hexCode,
        //     //     //     })),
        //     //     // },
        //     //     // sizes: {
        //     //     //     create: sizeData.map((size) => ({
        //     //     //         id: randomUUID(),
        //     //     //         name: size.name,
        //     //     //         price: typeof size.price === "number" ? size.price : 0,
        //     //     //         originalPrice:
        //     //     //             typeof size.originalPrice === "number"
        //     //     //                 ? size.originalPrice
        //     //     //                 : 0,
        //     //     //     })),
        //     //     // },
        //     // },
        // });
    }

    console.log(`Seeded ${prebuiltProducts.length} pre-built products`);
    const products = [
        // PLA Products
        {
            name: "PLA Matte Black - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 55,
            images: [
                "/filaments/product_images/PLAplus/PLAMATTE/BLACK/1.png",
                "/filaments/product_images/PLAplus/PLAMATTE/BLACK/2.png",
                "/filaments/product_images/PLAplus/PLAMATTE/BLACK/3.png",
                "/filaments/product_images/PLAplus/PLAMATTE/BLACK/4.png",
            ],
            color: "Black Matte",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Matte Blue - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 40,
            images: [
                "/filaments/product_images/PLAplus/PLAMATTE/BLUE/1.png",
                "/filaments/product_images/PLAplus/PLAMATTE/BLUE/2.png",
                "/filaments/product_images/PLAplus/PLAMATTE/BLUE/3.png",
                "/filaments/product_images/PLAplus/PLAMATTE/BLUE/4.png",
            ],
            color: "Blue Matte",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Matte Green - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 40,
            images: [
                "/filaments/product_images/PLAplus/PLAMATTE/GREEN/1.png",
                "/filaments/product_images/PLAplus/PLAMATTE/GREEN/2.png",
                "/filaments/product_images/PLAplus/PLAMATTE/GREEN/3.png",
                "/filaments/product_images/PLAplus/PLAMATTE/GREEN/4.png",
            ],
            color: "Green Matte",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Matte Orange - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 45,
            images: [
                "/filaments/product_images/PLAplus/PLAMATTE/ORANGE/1.png",
                "/filaments/product_images/PLAplus/PLAMATTE/ORANGE/2.png",
                "/filaments/product_images/PLAplus/PLAMATTE/ORANGE/3.png",
                "/filaments/product_images/PLAplus/PLAMATTE/ORANGE/4.png",
            ],
            color: "Orange Matte",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Matte Pink - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 45,
            images: [
                "/filaments/product_images/PLAplus/PLAMATTE/PINK/1.png",
                "/filaments/product_images/PLAplus/PLAMATTE/PINK/2.png",
                "/filaments/product_images/PLAplus/PLAMATTE/PINK/3.png",
                "/filaments/product_images/PLAplus/PLAMATTE/PINK/4.png",
            ],
            color: "Pink Matte",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Matte Red - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 45,
            images: [
                "/filaments/product_images/PLAplus/PLAMATTE/RED/1.png",
                "/filaments/product_images/PLAplus/PLAMATTE/RED/2.png",
                "/filaments/product_images/PLAplus/PLAMATTE/RED/3.png",
                "/filaments/product_images/PLAplus/PLAMATTE/RED/4.png",
            ],
            color: "Red Matte",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Matte White - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 45,
            images: [
                "/filaments/product_images/PLAplus/PLAMATTE/WHITE/1.png",
                "/filaments/product_images/PLAplus/PLAMATTE/WHITE/2.png",
                "/filaments/product_images/PLAplus/PLAMATTE/WHITE/3.png",
                "/filaments/product_images/PLAplus/PLAMATTE/WHITE/4.png",
            ],
            color: "White Matte",
            category: "PLAplus",
            tileType: "A",
        },

        // PLA+ Products
        {
            name: "PLA+ Black - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/BLACK/1.png",
                "/filaments/product_images/PLAplus/BLACK/2.png",
                "/filaments/product_images/PLAplus/BLACK/3.png",
                "/filaments/product_images/PLAplus/BLACK/4.png",
            ],
            color: "Black Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Brown - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/BROWN/1.png",
                "/filaments/product_images/PLAplus/BROWN/2.png",
                "/filaments/product_images/PLAplus/BROWN/3.png",
                "/filaments/product_images/PLAplus/BROWN/4.png",
            ],
            color: "Brown Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Dark Blue - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/DARKBLUE/1.png",
                "/filaments/product_images/PLAplus/DARKBLUE/2.png",
                "/filaments/product_images/PLAplus/DARKBLUE/3.png",
                "/filaments/product_images/PLAplus/DARKBLUE/4.png",
            ],
            color: "Dark Blue Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Green - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/GREEN/1.png",
                "/filaments/product_images/PLAplus/GREEN/2.png",
                "/filaments/product_images/PLAplus/GREEN/3.png",
                "/filaments/product_images/PLAplus/GREEN/4.png",
            ],
            color: "Green Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Grey - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/GREY/1.png",
                "/filaments/product_images/PLAplus/GREY/2.png",
                "/filaments/product_images/PLAplus/GREY/3.png",
                "/filaments/product_images/PLAplus/GREY/4.png",
            ],
            color: "Grey Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Orange - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/ORANGE/1.png",
                "/filaments/product_images/PLAplus/ORANGE/2.png",
                "/filaments/product_images/PLAplus/ORANGE/3.png",
                "/filaments/product_images/PLAplus/ORANGE/4.png",
            ],
            color: "Orange Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Pink - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/PINK/1.png",
                "/filaments/product_images/PLAplus/PINK/2.png",
                "/filaments/product_images/PLAplus/PINK/3.png",
                "/filaments/product_images/PLAplus/PINK/4.png",
            ],
            color: "Pink Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Skin - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/PLAplus/SKIN/1.png",
                "/filaments/product_images/PLAplus/SKIN/2.png",
                "/filaments/product_images/PLAplus/SKIN/3.png",
                "/filaments/product_images/PLAplus/SKIN/4.png",
            ],
            color: "Skin Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Red - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/RED/1.png",
                "/filaments/product_images/PLAplus/RED/2.png",
                "/filaments/product_images/PLAplus/RED/3.png",
                "/filaments/product_images/PLAplus/RED/4.png",
            ],
            color: "Red Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Sky Blue - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/SKYBLUE/1.png",
                "/filaments/product_images/PLAplus/SKYBLUE/2.png",
                "/filaments/product_images/PLAplus/SKYBLUE/3.png",
                "/filaments/product_images/PLAplus/SKYBLUE/4.png",
            ],
            color: "Sky Blue Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Violet - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/VIOLET/1.png",
                "/filaments/product_images/PLAplus/VIOLET/2.png",
                "/filaments/product_images/PLAplus/VIOLET/3.png",
                "/filaments/product_images/PLAplus/VIOLET/4.png",
            ],
            color: "Violet Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ White - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/WHITE/1.png",
                "/filaments/product_images/PLAplus/WHITE/2.png",
                "/filaments/product_images/PLAplus/WHITE/3.png",
                "/filaments/product_images/PLAplus/WHITE/4.png",
            ],
            color: "White Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Yellow - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/YELLOW/1.png",
                "/filaments/product_images/PLAplus/YELLOW/2.png",
                "/filaments/product_images/PLAplus/YELLOW/3.png",
                "/filaments/product_images/PLAplus/YELLOW/4.png",
            ],
            color: "Yellow Gloss",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA+ Bronze - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/SPECIALGRADE/BRONZE/1.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/BRONZE/2.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/BRONZE/3.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/BRONZE/4.png",
            ],
            color: "Bronze Special Grade",
            category: "PLAplus",
            tileType: "B",
        },
        {
            name: "PLA+ Carbon - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/SPECIALGRADE/CARBON/1.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/CARBON/2.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/CARBON/3.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/CARBON/4.png",
            ],
            color: "Carbon Special Grade",
            category: "PLAplus",
            tileType: "B",
        },
        {
            name: "PLA+ GID Blue - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/SPECIALGRADE/GID_BLUE/1.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/GID_BLUE/2.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/GID_BLUE/3.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/GID_BLUE/4.png",
            ],
            color: "GID Blue Special Grade",
            category: "PLAplus",
            tileType: "B",
        },
        {
            name: "PLA+ GID Green - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/SPECIALGRADE/GID_GREEN/1.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/GID_GREEN/2.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/GID_GREEN/3.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/GID_GREEN/4.png",
            ],
            color: "GID Green Special Grade",
            category: "PLAplus",
            tileType: "B",
        },
        {
            name: "PLA+ Marble - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/SPECIALGRADE/MARBLE/1.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/MARBLE/2.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/MARBLE/3.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/MARBLE/4.png",
            ],
            color: "Marble Special Grade",
            category: "PLAplus",
            tileType: "B",
        },
        {
            name: "PLA+ Sparkling Silver - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/SPECIALGRADE/SPARKLING_SILVER/2.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/SPARKLING_SILVER/1.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/SPARKLING_SILVER/3.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/SPARKLING_SILVER/4.png",
            ],
            color: "Sparkling Silver Special Grade",
            category: "PLAplus",
            tileType: "B",
        },
        {
            name: "PLA+ Wood - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/PLAplus/SPECIALGRADE/WOOD/1.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/WOOD/2.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/WOOD/3.png",
                "/filaments/product_images/PLAplus/SPECIALGRADE/WOOD/4.png",
            ],
            color: "Wood Special Grade",
            category: "PLAplus",
            tileType: "B",
        },
        {
            name: "PLA Silk Black - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 38,
            images: [
                "/filaments/product_images/PLAplus/PLASILK/BLACK/1.png",
                "/filaments/product_images/PLAplus/PLASILK/BLACK/2.png",
                "/filaments/product_images/PLAplus/PLASILK/BLACK/3.png",
                "/filaments/product_images/PLAplus/PLASILK/BLACK/4.png",
            ],
            color: "Black Silk",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Silk Blue - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 38,
            images: [
                "/filaments/product_images/PLAplus/PLASILK/BLUE/1.png",
                "/filaments/product_images/PLAplus/PLASILK/BLUE/2.png",
                "/filaments/product_images/PLAplus/PLASILK/BLUE/3.png",
                "/filaments/product_images/PLAplus/PLASILK/BLUE/4.png",
            ],
            color: "Blue Silk",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Silk Copper - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 38,
            images: [
                "/filaments/product_images/PLAplus/PLASILK/COPPER/1.png",
                "/filaments/product_images/PLAplus/PLASILK/COPPER/2.png",
                "/filaments/product_images/PLAplus/PLASILK/COPPER/3.png",
                "/filaments/product_images/PLAplus/PLASILK/COPPER/4.png",
            ],
            color: "Copper Special Grade",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Silk Gold - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 38,
            images: [
                "/filaments/product_images/PLAplus/PLASILK/GOLD/1.png",
                "/filaments/product_images/PLAplus/PLASILK/GOLD/2.png",
                "/filaments/product_images/PLAplus/PLASILK/GOLD/3.png",
                "/filaments/product_images/PLAplus/PLASILK/GOLD/4.png",
            ],
            color: "Gold Special Grade",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Silk Green - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 38,
            images: [
                "/filaments/product_images/PLAplus/PLASILK/GREEN/1.png",
                "/filaments/product_images/PLAplus/PLASILK/GREEN/2.png",
                "/filaments/product_images/PLAplus/PLASILK/GREEN/3.png",
                "/filaments/product_images/PLAplus/PLASILK/GREEN/4.png",
            ],
            color: "Green Silk",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Silk Red - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 38,
            images: [
                "/filaments/product_images/PLAplus/PLASILK/RED/1.png",
                "/filaments/product_images/PLAplus/PLASILK/RED/2.png",
                "/filaments/product_images/PLAplus/PLASILK/RED/3.png",
                "/filaments/product_images/PLAplus/PLASILK/RED/4.png",
            ],
            color: "Red Silk",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Silk Silver - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 38,
            images: [
                "/filaments/product_images/PLAplus/PLASILK/SILVER/1.png",
                "/filaments/product_images/PLAplus/PLASILK/SILVER/2.png",
                "/filaments/product_images/PLAplus/PLASILK/SILVER/3.png",
                "/filaments/product_images/PLAplus/PLASILK/SILVER/4.png",
            ],
            color: "Silver Special Grade",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Silk White - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 38,
            images: [
                "/filaments/product_images/PLAplus/PLASILK/WHITE/1.png",
                "/filaments/product_images/PLAplus/PLASILK/WHITE/2.png",
                "/filaments/product_images/PLAplus/PLASILK/WHITE/3.png",
                "/filaments/product_images/PLAplus/PLASILK/WHITE/4.png",
            ],
            color: "White Silk",
            category: "PLAplus",
            tileType: "A",
        },
        {
            name: "PLA Silk Yellow - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 38,
            images: [
                "/filaments/product_images/PLAplus/PLASILK/YELLOW/1.png",
                "/filaments/product_images/PLAplus/PLASILK/YELLOW/2.png",
                "/filaments/product_images/PLAplus/PLASILK/YELLOW/3.png",
                "/filaments/product_images/PLAplus/PLASILK/YELLOW/4.png",
            ],
            color: "Yellow Silk",
            category: "PLAplus",
            tileType: "A",
        },

        // ... Add all other PLA+ products here

        // ABS Products
        {
            name: "ABS Black - 1Kg",
            price: 9999,
            originalPrice: 9999,
            discount: 42,
            images: [
                "/filaments/product_images/ABS/BLACK/1.png",
                "/filaments/product_images/ABS/BLACK/2.png",
                "/filaments/product_images/ABS/BLACK/3.png",
                "/filaments/product_images/ABS/BLACK/4.png",
            ],
            color: "Black ABS",
            category: "ABS",
            tileType: "A",
        },
        {
            name: "ABS Blue - 1Kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/ABS/BLUE/1.png",
                "/filaments/product_images/ABS/BLUE/2.png",
                "/filaments/product_images/ABS/BLUE/3.png",
                "/filaments/product_images/ABS/BLUE/4.png",
            ],
            color: "Blue ABS",
            category: "ABS",
            tileType: "A",
        },
        {
            name: "ABS Carbon Fiber - 1Kg",
            price: 9999,
            originalPrice: 9999,
            discount: 35,
            images: [
                "/filaments/product_images/ABS/CARBON/1.png",
                "/filaments/product_images/ABS/CARBON/2.png",
                "/filaments/product_images/ABS/CARBON/3.png",
                "/filaments/product_images/ABS/CARBON/4.png",
            ],
            color: "Carbon Fiber ABS",
            category: "ABS",
            tileType: "A",
        },
        {
            name: "ABS Dark Blue - 1Kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/ABS/DARKBLUE/1.png",
                "/filaments/product_images/ABS/DARKBLUE/2.png",
                "/filaments/product_images/ABS/DARKBLUE/3.png",
                "/filaments/product_images/ABS/DARKBLUE/4.png",
            ],
            color: "Dark Blue ABS",
            category: "ABS",
            tileType: "A",
        },
        {
            name: "ABS Green - 1Kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/ABS/GREEN/1.png",
                "/filaments/product_images/ABS/GREEN/2.png",
                "/filaments/product_images/ABS/GREEN/3.png",
                "/filaments/product_images/ABS/GREEN/4.png",
            ],
            color: "Green ABS",
            category: "ABS",
            tileType: "A",
        },
        {
            name: "ABS Grey - 1Kg",
            price: 9999,
            originalPrice: 9999,
            discount: 42,
            images: [
                "/filaments/product_images/ABS/GREY/1.png",
                "/filaments/product_images/ABS/GREY/2.png",
                "/filaments/product_images/ABS/GREY/3.png",
                "/filaments/product_images/ABS/GREY/4.png",
            ],
            color: "Grey ABS",
            category: "ABS",
            tileType: "A",
        },
        {
            name: "ABS Orange - 1Kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/ABS/ORANGE/1.png",
                "/filaments/product_images/ABS/ORANGE/2.png",
                "/filaments/product_images/ABS/ORANGE/3.png",
                "/filaments/product_images/ABS/ORANGE/4.png",
            ],
            color: "Orange ABS",
            category: "ABS",
            tileType: "A",
        },
        {
            name: "ABS Red - 1Kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/ABS/RED/1.png",
                "/filaments/product_images/ABS/RED/2.png",
                "/filaments/product_images/ABS/RED/3.png",
                "/filaments/product_images/ABS/RED/4.png",
            ],
            color: "Red ABS",
            category: "ABS",
            tileType: "A",
        },
        {
            name: "ABS Violet - 1Kg",
            price: 9999,
            originalPrice: 9999,
            discount: 43,
            images: [
                "/filaments/product_images/ABS/VIOLET/1.png",
                "/filaments/product_images/ABS/VIOLET/2.png",
                "/filaments/product_images/ABS/VIOLET/3.png",
                "/filaments/product_images/ABS/VIOLET/4.png",
            ],
            color: "Violet ABS",
            category: "ABS",
            tileType: "A",
        },
        {
            name: "ABS White - 1Kg",
            price: 9999,
            originalPrice: 9999,
            discount: 42,
            images: [
                "/filaments/product_images/ABS/WHITE/1.png",
                "/filaments/product_images/ABS/WHITE/2.png",
                "/filaments/product_images/ABS/WHITE/3.png",
                "/filaments/product_images/ABS/WHITE/4.png",
            ],
            color: "White ABS",
            category: "ABS",
            tileType: "A",
        },

        // ... Add all other ABS products here

        // PETG Products
        {
            name: "PETG Black - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/PETG/BLACK/1.png",
                "/filaments/product_images/PETG/BLACK/2.png",
                "/filaments/product_images/PETG/BLACK/3.png",
                "/filaments/product_images/PETG/BLACK/4.png",
            ],
            color: "Black PETG",
            category: "PETG",
            tileType: "A",
        },
        {
            name: "PETG Blue - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/PETG/BLUE/1.png",
                "/filaments/product_images/PETG/BLUE/2.png",
                "/filaments/product_images/PETG/BLUE/3.png",
                "/filaments/product_images/PETG/BLUE/4.png",
            ],
            color: "Blue PETG",
            category: "PETG",
            tileType: "A",
        },
        {
            name: "PETG Carbon Fiber - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 39,
            images: [
                "/filaments/product_images/PETG/CARBON/1.png",
                "/filaments/product_images/PETG/CARBON/2.png",
                "/filaments/product_images/PETG/CARBON/3.png",
                "/filaments/product_images/PETG/CARBON/4.png",
            ],
            color: "Carbon Fiber PETG",
            category: "PETG",
            tileType: "A",
        },
        {
            name: "PETG Sky Blue - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/PETG/SKYBLUE/1.png",
                "/filaments/product_images/PETG/SKYBLUE/2.png",
                "/filaments/product_images/PETG/SKYBLUE/3.png",
                "/filaments/product_images/PETG/SKYBLUE/4.png",
            ],
            color: "Sky Blue PETG",
            category: "PETG",
            tileType: "A",
        },
        {
            name: "PETG Transparent - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 40,
            images: [
                "/filaments/product_images/PETG/TRANSPARENT/1.png",
                "/filaments/product_images/PETG/TRANSPARENT/2.png",
                "/filaments/product_images/PETG/TRANSPARENT/3.png",
                "/filaments/product_images/PETG/TRANSPARENT/4.png",
            ],
            color: "Transparent PETG",
            category: "PETG",
            tileType: "A",
        },
        {
            name: "PETG White - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/PETG/WHITE/1.png",
                "/filaments/product_images/PETG/WHITE/2.png",
                "/filaments/product_images/PETG/WHITE/3.png",
                "/filaments/product_images/PETG/WHITE/4.png",
            ],
            color: "White PETG",
            category: "PETG",
            tileType: "A",
        },

        // ... Add all other PETG products here

        // TPU Products
        {
            name: "TPU Black - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/TPU/BLACK/1.png",
                "/filaments/product_images/TPU/BLACK/2.png",
                "/filaments/product_images/TPU/BLACK/3.png",
                "/filaments/product_images/TPU/BLACK/4.png",
            ],
            color: "Black TPU",
            category: "TPU",
            tileType: "A",
        },
        {
            name: "TPU Blue - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/TPU/BLUE/1.png",
                "/filaments/product_images/TPU/BLUE/2.png",
                "/filaments/product_images/TPU/BLUE/3.png",
                "/filaments/product_images/TPU/BLUE/4.png",
            ],
            color: "Blue TPU",
            category: "TPU",
            tileType: "A",
        },
        {
            name: "TPU Green - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/TPU/GREEN/1.png",
                "/filaments/product_images/TPU/GREEN/2.png",
                "/filaments/product_images/TPU/GREEN/3.png",
                "/filaments/product_images/TPU/GREEN/4.png",
            ],
            color: "Green TPU",
            category: "TPU",
            tileType: "A",
        },
        {
            name: "TPU Navy Fusion - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 40,
            images: [
                "/filaments/product_images/TPU/NAVYFUSION/1.png",
                "/filaments/product_images/TPU/NAVYFUSION/2.png",
                "/filaments/product_images/TPU/NAVYFUSION/3.png",
                "/filaments/product_images/TPU/NAVYFUSION/4.png",
            ],
            color: "Navy Fusion TPU",
            category: "TPU",
            tileType: "A",
        },
        {
            name: "TPU Orange - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/TPU/ORANGE/1.png",
                "/filaments/product_images/TPU/ORANGE/2.png",
                "/filaments/product_images/TPU/ORANGE/3.png",
                "/filaments/product_images/TPU/ORANGE/4.png",
            ],
            color: "Orange TPU",
            category: "TPU",
            tileType: "A",
        },
        {
            name: "TPU Red - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/TPU/RED/1.png",
                "/filaments/product_images/TPU/RED/2.png",
                "/filaments/product_images/TPU/RED/3.png",
                "/filaments/product_images/TPU/RED/4.png",
            ],
            color: "Red TPU",
            category: "TPU",
            tileType: "A",
        },
        {
            name: "TPU Slate Grey - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/TPU/SLATEGREY/1.png",
                "/filaments/product_images/TPU/SLATEGREY/2.png",
                "/filaments/product_images/TPU/SLATEGREY/3.png",
                "/filaments/product_images/TPU/SLATEGREY/4.png",
            ],
            color: "Slate Grey TPU",
            category: "TPU",
            tileType: "A",
        },
        {
            name: "TPU Special Grey - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 40,
            images: [
                "/filaments/product_images/TPU/SPECIALGREY/1.png",
                "/filaments/product_images/TPU/SPECIALGREY/2.png",
                "/filaments/product_images/TPU/SPECIALGREY/3.png",
                "/filaments/product_images/TPU/SPECIALGREY/4.png",
            ],
            color: "Special Grey TPU",
            category: "TPU",
            tileType: "B",
        },
        {
            name: "TPU Transcrystal - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 39,
            images: [
                "/filaments/product_images/TPU/TRANSCRYSTAL/1.png",
                "/filaments/product_images/TPU/TRANSCRYSTAL/2.png",
                "/filaments/product_images/TPU/TRANSCRYSTAL/3.png",
                "/filaments/product_images/TPU/TRANSCRYSTAL/4.png",
            ],
            color: "Transcrystal TPU",
            category: "TPU",
            tileType: "A",
        },
        {
            name: "TPU White - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/TPU/WHITE/1.png",
                "/filaments/product_images/TPU/WHITE/2.png",
                "/filaments/product_images/TPU/WHITE/3.png",
                "/filaments/product_images/TPU/WHITE/4.png",
            ],
            color: "White TPU",
            category: "TPU",
            tileType: "A",
        },
        {
            name: "TPU Yellow - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 41,
            images: [
                "/filaments/product_images/TPU/YELLOW/1.png",
                "/filaments/product_images/TPU/YELLOW/2.png",
                "/filaments/product_images/TPU/YELLOW/3.png",
                "/filaments/product_images/TPU/YELLOW/4.png",
            ],
            color: "Yellow TPU",
            category: "TPU",
            tileType: "A",
        },

        // ... Add all other TPU products here

        // Nylon Products
        {
            name: "Nylon Black - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 40,
            images: [
                // "/filaments/product_images/NYLON/BLACK/1.png",
                "/filaments/product_images/NYLON/BLACK/2.png",
                "/filaments/product_images/NYLON/BLACK/3.png",
                "/filaments/product_images/NYLON/BLACK/4.png",
            ],
            color: "Black Nylon",
            category: "Nylon",
            tileType: "A",
        },
        {
            name: "Nylon Carbon Fiber - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 39,
            images: [
                "/filaments/product_images/NYLON/CARBONFIBER/1.png",
                "/filaments/product_images/NYLON/CARBONFIBER/2.png",
                "/filaments/product_images/NYLON/CARBONFIBER/3.png",
                "/filaments/product_images/NYLON/CARBONFIBER/4.png",
            ],
            color: "Carbon Fiber Nylon",
            category: "Nylon",
            tileType: "A",
        },
        {
            name: "Nylon White - 1kg",
            price: 9999,
            originalPrice: 9999,
            discount: 39,
            images: [
                "/filaments/product_images/NYLON/WHITE/1.png",
                "/filaments/product_images/NYLON/WHITE/2.png",
                "/filaments/product_images/NYLON/WHITE/3.png",
                "/filaments/product_images/NYLON/WHITE/4.png",
            ],
            color: "White Nylon",
            category: "Nylon",
            tileType: "A",
        },
    ];

    for (const product of products) {
        await prisma.product.create({
            data: product,
        });
    }

    console.log("Seed data inserted successfully");

    const availableColors = [
        {
            category: "PLAplus",
            colors: {
                Matte: [
                    "White Matte",
                    "Red Matte",
                    "Pink Matte",
                    "Blue Matte",
                    "Orange Matte",
                    "Green Matte",
                    "Black Matte",
                ],
                Silk: [
                    "Yellow Silk",
                    "Red Silk",
                    "Green Silk",
                    "White Silk",
                    "Blue Silk",
                    "Black Silk",
                ],
                "Special Grade": [
                    "Silver Special Grade",
                    "Gold Special Grade",
                    "Copper Special Grade",
                    "Wood Special Grade",
                    "Sparkling Silver Special Grade",
                    "Marble Special Grade",
                    "GID Green Special Grade",
                    "GID Blue Special Grade",
                    "Carbon Special Grade",
                    "Bronze Special Grade",
                ],
                Gloss: [
                    "Yellow Gloss",
                    "White Gloss",
                    "Violet Gloss",
                    "Sky Blue Gloss",
                    "Red Gloss",
                    "Skin Gloss",
                    "Pink Gloss",
                    "Orange Gloss",
                    "Grey Gloss",
                    "Green Gloss",
                    "Dark Blue Gloss",
                    "Brown Gloss",
                    "Black Gloss",
                ],
            },
            colorCategories: ["Matte", "Silk", "Special Grade", "Gloss"],
        },
        {
            category: "ABS",
            colors: {
                ABS: [
                    "Black ABS",
                    "Blue ABS",
                    "Carbon Fiber ABS",
                    "Dark Blue ABS",
                    "Green ABS",
                    "Grey ABS",
                    "Orange ABS",
                    "Red ABS",
                    "Violet ABS",
                    "White ABS",
                ],
            },
            colorCategories: ["ABS"],
        },
        {
            category: "PETG",
            colors: {
                PETG: [
                    "Transparent PETG",
                    "White PETG",
                    "Blue PETG",
                    "Sky Blue PETG",
                    "Carbon Fiber PETG",
                    "Black PETG",
                ],
            },
            colorCategories: ["PETG"],
        },
        {
            category: "NYLON",
            colors: {
                NYLON: ["White Nylon", "Natural Nylon", "Black Nylon"],
            },
            colorCategories: ["NYLON"],
        },
        {
            category: "TPU",
            colors: {
                TPU: [
                    "Black TPU",
                    "Blue TPU",
                    "Green TPU",
                    "Navy Fusion TPU",
                    "Orange TPU",
                    "Red TPU",
                    "Slate Grey TPU",
                    "Special Grey TPU",
                    "Transcrystal TPU",
                    "White TPU",
                    "Yellow TPU",
                ],
            },
            colorCategories: ["TPU"],
        },
    ];

    for (const colorData of availableColors) {
        await prisma.availableColors.upsert({
            where: { category: colorData.category },
            update: {
                colors: colorData.colors,
                colorCategories: colorData.colorCategories,
            },
            create: {
                category: colorData.category,
                colors: colorData.colors,
                colorCategories: colorData.colorCategories,
            },
        });
    }

    console.log(`Seeded ${availableColors.length} available color entries`);

    const blogs = [
        {
            title: "3D Printing in Education: Inspiring the Next Generation of Makers",
            content: `3D printing is reshaping the educational landscape, inspiring students to become innovative thinkers and problem solvers. By integrating 3D printing into classrooms, educators are fostering creativity, critical thinking, and hands-on learning.

Here's how 3D printing is transforming education:
• STEM Education: 3D printing provides a tangible way to learn STEM concepts, from geometry and engineering to biology and chemistry.
• Project-Based Learning: Students can design, model, and print their own projects, fostering a deeper understanding of the design process.
• Accessibility and Inclusion: 3D printing can be used to create customized learning tools and assistive devices for students with disabilities.

By empowering students to bring their ideas to life, 3D printing is shaping the future of education.`,

            keywords:
                "3D printing, education, STEM, project-based learning, accessibility",
            description:
                "Discover how 3D printing is transforming education by inspiring creativity, enhancing STEM learning, and promoting inclusivity in classrooms.",
        },
        {
            title: "Bioprinting: The Frontier of Regenerative Medicine",
            content: `Bioprinting, a cutting-edge technology, is revolutionizing the field of regenerative medicine by creating living tissues and organs. By combining 3D printing techniques with biological materials, scientists are paving the way for groundbreaking medical treatments.

Here's how bioprinting is changing the future of medicine:
• Tissue Engineering: Bioprinting can create tissue replacements for damaged organs, such as skin, cartilage, and bone.
• Drug Discovery: Bioprinted tissues can be used to test new drugs and treatments, accelerating the drug development process.
• Personalized Medicine: By printing tissues specific to individual patients, doctors can tailor treatments to their unique needs.

While bioprinting is still in its early stages, its potential to transform healthcare is immense.`,
            keywords:
                "bioprinting, regenerative medicine, tissue engineering, drug discovery, personalized medicine",
            description:
                "Explore the revolutionary potential of bioprinting in regenerative medicine, from creating living tissues to accelerating drug discovery and enabling personalized treatments.",
        },
        {
            title: "3D Printing: A Game-Changer for Accessibility",
            content: `3D printing is rapidly transforming the landscape of accessibility, empowering individuals with disabilities to live more independently. By offering customized solutions at a fraction of the cost of traditional manufacturing, 3D printing is opening doors to a world of possibilities.

Key applications of 3D printing in accessibility:
• Custom Prosthetics: Tailored to the specific needs of each individual, 3D-printed prosthetics provide comfort, functionality, and aesthetic appeal.
• Assistive Devices: From customized wheelchair accessories to specialized tools for daily living, 3D printing enables the creation of devices that cater to individual requirements.
• Adaptive Technology: 3D-printed components can be integrated into existing devices to enhance their usability and accessibility.

The Benefits of 3D-Printed Assistive Devices:
• Customization: 3D printing allows for precise customization, ensuring a perfect fit and optimal performance.
• Affordability: By reducing manufacturing costs, 3D printing makes assistive devices more accessible to a wider population.
• Rapid Prototyping: 3D printing enables rapid prototyping, allowing for quick iterations and improvements.
• Innovation: 3D printing fosters innovation, leading to the development of new and creative solutions to challenges faced by people with disabilities.

As 3D printing technology continues to advance, we can expect to see even more groundbreaking applications in the field of accessibility. By breaking down barriers and empowering individuals, 3D printing is truly revolutionizing the way we think about assistive technology.`,
            keywords:
                "3D printing, accessibility, assistive devices, prosthetics, adaptive technology, customization",
            description:
                "Learn how 3D printing is revolutionizing accessibility by creating customized, affordable assistive devices and prosthetics, empowering individuals with disabilities.",
        },
        {
            title: "3D-Printed Food: A Culinary Revolution",
            content: `Imagine a future where food is personalized, sustainable, and tailored to your exact nutritional needs. 3D food printing is bringing this vision to life. By using 3D printers to layer food ingredients, chefs and scientists are creating innovative and delicious dishes.

How 3D Food Printing Works:
1. Ingredient Preparation: Food ingredients are processed into a printable paste or gel.
2. 3D Modeling: A 3D model of the desired food item is created using computer-aided design (CAD) software.
3. Printing Process: The 3D printer extrudes the food paste or gel layer by layer, following the 3D model.
4. Cooking and Finishing: The printed food is cooked or dried, and then finished with additional ingredients or decorations.

Benefits of 3D Food Printing:
• Personalized Nutrition: 3D food printing allows for precise control over the nutritional content of food, making it possible to create meals tailored to individual dietary needs and preferences.
• Reduced Food Waste: By printing only the exact amount of food needed, 3D food printing can help reduce food waste.
• Innovative Culinary Experiences: 3D food printing opens up new possibilities for culinary creativity, allowing chefs to create intricate and visually stunning dishes.
• Sustainable Food Production: 3D food printing can be used to produce food from alternative sources, such as algae or insects, reducing the environmental impact of traditional agriculture.

While 3D food printing is still in its early stages, its potential to revolutionize the way we produce and consume food is undeniable. As technology continues to advance, we can expect to see even more innovative and delicious 3D-printed foods in the future.`,
            keywords:
                "3D food printing, culinary innovation, personalized nutrition, food waste reduction, sustainable food production",
            description:
                "Explore the future of food with 3D printing technology, offering personalized nutrition, reduced waste, and innovative culinary experiences.",
        },
    ];

    for (const blog of blogs) {
        await prisma.blog.create({
            data: blog,
        });
    }

    console.log(`Seeded ${blogs.length} blog posts`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
