export function formatKES(amount: number) {
  return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 0 })}`;
}

export function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export function getProductImage(product: { product_images?: { url: string; is_primary: boolean }[] }) {
  if (!product.product_images?.length) return "/placeholder-product.png";
  const primary = product.product_images.find((i) => i.is_primary);
  return primary?.url ?? product.product_images[0].url;
}

export function conditionBadge(condition: string) {
  switch (condition) {
    case "new": return { label: "New", color: "bg-accent text-white" };
    case "refurbished": return { label: "Refurbished", color: "bg-blue-500 text-white" };
    case "second-hand": return { label: "Second Hand", color: "bg-yellow-500 text-white" };
    default: return { label: condition, color: "bg-gray-400 text-white" };
  }
}
