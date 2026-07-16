import { supabase } from '@/lib/supabase';

// Same shape as src/data/store.ts so existing UI code (FlatLists, Image, etc.)
// doesn't need much change — only `image: require(...)` becomes `image_url: string`
// and screens use { uri: image_url } instead of require().

export type Category = {
  id: string;
  label: string;
  icon: string;
  image_url: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  price: number;
  image_url: string;
  description: string;
  rating: number;
  reviews: number;
};

// ─── Categories ──────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, label, icon, image_url');

  if (error) {
    console.warn('Failed to fetch categories:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, label, icon, image_url')
    .eq('id', id)
    .single();

  if (error) {
    console.warn('Failed to fetch category:', error.message);
    return null;
  }
  return data;
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, category_id, name, price, image_url, description, rating, reviews');

  if (error) {
    console.warn('Failed to fetch products:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id, category_id, name, price, image_url, description, rating, reviews')
    .eq('id', id)
    .single();

  if (error) {
    console.warn('Failed to fetch product:', error.message);
    return null;
  }
  return data;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, category_id, name, price, image_url, description, rating, reviews')
    .eq('category_id', categoryId);

  if (error) {
    console.warn('Failed to fetch products by category:', error.message);
    return [];
  }
  return data ?? [];
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, category_id, name, price, image_url, description, rating, reviews')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

  if (error) {
    console.warn('Failed to search products:', error.message);
    return [];
  }
  return data ?? [];
}

// ─── Orders (for "Buy Now") ──────────────────────────────────────────────────

async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;
  return data.user.id;
}

export async function placeOrder(
  productId: string,
  quantity: number = 1
): Promise<{ error: string | null }> {
  const userId = await getUserId();
  if (!userId) return { error: 'Not logged in' };

  const { error } = await supabase
    .from('orders')
    .insert({ user_id: userId, product_id: productId, quantity });

  return { error: error?.message ?? null };
}
