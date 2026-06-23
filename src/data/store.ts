// src/data/store.ts
import { ImageSourcePropType } from 'react-native';

export type Category = {
  id: string;
  label: string;
  icon: string;
  image: ImageSourcePropType;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  image: ImageSourcePropType;
  description: string;
  rating: number;
  reviews: number;
};

export const categories: Category[] = [
  { id: 'equipment', label: "Equipment's", icon: '🏋️', image: require('../../assets/images/store/equipment.png') },
  { id: 'nutrition', label: "Nutrition's", icon: '💊', image: require('../../assets/images/store/nutrition.png') },
  { id: 'clothing', label: "Clothing's", icon: '👕', image: require('../../assets/images/store/clothing.png') },
  { id: 'bags', label: 'Bags', icon: '🎒', image: require('../../assets/images/store/bags.png') },
  { id: 'shoes', label: 'Shoes', icon: '👟', image: require('../../assets/images/store/shoes.png') },
];

export const products: Product[] = [
  { id: 'p1', categoryId: 'equipment', name: 'Flex Dumbbells', price: 399, image: require('../../assets/images/products/dumbells.png'), description: '...', rating: 4.8, reviews: 234 },
  { id: 'p2', categoryId: 'equipment', name: 'Jump Rope', price: 599, image: require('../../assets/images/products/jump-rope.png'), description: '...', rating: 4.6, reviews: 189 },
  { id: 'p3', categoryId: 'equipment', name: 'Kettlebells', price: 2499, image: require('../../assets/images/products/kettlebells.png'), description: '...', rating: 4.7, reviews: 312 },
  { id: 'p4', categoryId: 'equipment', name: 'Yoga Mat', price: 1299, image: require('../../assets/images/products/yoga-mat.png'), description: '...', rating: 4.7, reviews: 198 },
  { id: 'p5', categoryId: 'equipment', name: 'Hand Gripper', price: 499, image: require('../../assets/images/products/hand gripper.png'), description: '...', rating: 4.5, reviews: 145 },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return products.filter(
    (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
  );
}