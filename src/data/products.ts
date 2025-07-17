import { Product } from "../types";

export const products: Product[] = [
  {
    id: "1",
    name: "Fruity Soda",
    price: 25,
    image:
      "https://razaitaliana.com/wp-content/uploads/2021/06/soda-italiana-660x330.jpg",
    category: "Customizable",
    description: "Customizable fruity soda with your choice of flavor and size",
    stock: 100,
    sku: "FS001",
    isCustomizable: true,
    flavors: ["Lychee", "Strawberry", "Mango", "Blueberry", "Grape"],
    sizes: [
      { size: "12oz", price: 25, description: "Small" },
      { size: "16oz", price: 35, description: "Medium" },
      { size: "22oz", price: 45, description: "Large" },
    ],
  },
];

export const categories = ["All", "Customizable"];
