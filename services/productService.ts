import api from "@/lib/axios";
import type {
  Product,
  ProductResponse,
  Category,
} from "@/types/product";

// Get paginated products
export async function getProducts(
  limit: number,
  skip: number,
  signal?: AbortSignal
): Promise<ProductResponse> {
  const response = await api.get<ProductResponse>(
    `/products?limit=${limit}&skip=${skip}`,
    {
      signal,
    }
  );

  return response.data;
}

// Search products
export async function searchProducts(
  query: string,
  limit: number,
  skip: number,
  signal?: AbortSignal
): Promise<ProductResponse> {
  const response = await api.get<ProductResponse>(
    `/products/search?q=${encodeURIComponent(
      query
    )}&limit=${limit}&skip=${skip}`,
    {
      signal,
    }
  );

  return response.data;
}

// Get single product
export async function getProduct(
  id: number,
  signal?: AbortSignal
): Promise<Product> {
  const response = await api.get<Product>(`/products/${id}`, {
    signal,
  });

  return response.data;
}

// Get categories
export async function getCategories(
  signal?: AbortSignal
): Promise<Category[]> {
  const response = await api.get<Category[]>(
    "/products/categories",
    {
      signal,
    }
  );

  return response.data;
}

// Add product
export async function addProduct(
  product: Partial<Product>
): Promise<Product> {
  const response = await api.post<Product>(
    "/products/add",
    product
  );

  return response.data;
}

// Update product
export async function updateProduct(
  id: number,
  product: Partial<Product>
): Promise<Product> {
  const response = await api.put<Product>(
    `/products/${id}`,
    product
  );

  return response.data;
}

// Delete product
export async function deleteProduct(
  id: number
): Promise<Product> {
  const response = await api.delete<Product>(
    `/products/${id}`
  );

  return response.data;
}