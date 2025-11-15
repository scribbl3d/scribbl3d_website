export function generateRandomFeatures(): string[] {
  const featuresList = [
    "Handcrafted with care",
    "Made from high-quality materials",
    "Unique design",
    "Perfect for gifting",
    "Adds character to any space",
    "Durable and long-lasting",
    "Easy to clean and maintain",
    "Versatile placement options",
    "Eco-friendly materials",
    "Customizable options available",
  ];

  const numFeatures = Math.floor(Math.random() * 3) + 3; // 3 to 5 features
  return shuffleArray(featuresList).slice(0, numFeatures);
}

export function generateRandomProductDetails(): string[] {
  const detailsList = [
    "Dimensions: Various sizes available",
    "Weight: Lightweight and portable",
    "Material: Premium quality materials",
    "Finish: Smooth and elegant",
    "Care instructions: Easy to clean",
    "Package includes: 1 item",
    "Origin: Handmade in India",
    "Warranty: 1-year manufacturer warranty",
    "Assembly required: No",
    "Indoor/Outdoor use: Suitable for both",
  ];

  const numDetails = Math.floor(Math.random() * 3) + 3; // 3 to 5 details
  return shuffleArray(detailsList).slice(0, numDetails);
}

export function generateRandomProductDesc(
  name: string,
  category: string
): string {
  return `Enhance your ${category} with our exquisite ${name}. This stunning piece combines form and function, adding a touch of elegance to any space. Crafted with attention to detail, it's not just a decorative item but a conversation starter. Whether you're looking to upgrade your home decor or searching for the perfect gift, this ${name} is an excellent choice that will delight for years to come.`;
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
