import api from "@/lib/axios";
import type { Product, ProductResponse } from "@/types/product";

export async function getProducts(
  limit: number,
  skip: number
): Promise<ProductResponse> {
  const response = await api.get<ProductResponse>(
    `/products?limit=${limit}&skip=${skip}`
  );

  return response.data;
}