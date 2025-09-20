import apiClient from "./apiClient";
import { ListCart, Cart, CartDetails } from "@/models/";

export const getCartList = async (): Promise<ListCart[]> => {
  try {
    const response = await apiClient.get<ListCart[]>(`Cart/GetAllListCart`);
    console.log("Get ListCart: ", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get ListCart API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to fetch ListCart";
    throw new Error(serverMessage);
  }
};

export const getCart = async (cartId:number): Promise<CartDetails> => {
  try {
    const response = await apiClient.get<CartDetails>(`Cart/GetCart?CartId=${cartId}`);
    console.log("Get Cart: ", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get Cart API error: ", error);
    
    const serverMessage = error.response?.data || "Failed to fetch Cart";
    throw new Error(serverMessage);
  }
};

export const getListOfCartItems = async (cart: ListCart): Promise<Cart> => {
  console.log("🤳 ~ getListOfCartItems ~ cart:", cart)
  try {
    const response = await apiClient.post<Cart>(`/Cart/GetListCartItem`, cart );
    console.log("✏ Edit Cart responce: ", response)
    return response.data;
  } catch (error: any) {
    console.error("get Cart API error: ", error);

    const serverMessage = error.response?.data || "get Cart failed";
    throw new Error(serverMessage);
  }
};

export const deleteCart = async (cartId: number | null): Promise<void> => {
  try {
    const response = await apiClient.delete<void>("/Cart/Delete", {
      data: [cartId],
    });
    console.log("🗑️ Delete Cart response:", response.data);
  } catch (error: any) {
    console.error("Delete Cart API error:", error);
    const serverMessage = error.response?.data || "Delete Cart failed";
    throw new Error(serverMessage);
  }
};