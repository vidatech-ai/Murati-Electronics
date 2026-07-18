export type Condition = "new" | "refurbished" | "second-hand";
export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "mpesa" | "cash_on_delivery";
export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  condition: Condition;
  category_id: string;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  specs: Record<string, string>;
  created_at: string;
  categories?: Category;
  product_images?: ProductImage[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  mpesa_reference?: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  notes?: string;
  created_at: string;
  order_items?: OrderItem[];
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  is_admin: boolean;
}
