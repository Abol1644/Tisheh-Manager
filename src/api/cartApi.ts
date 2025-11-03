import apiClient from "./apiClient";
import {
  ListCart,
  Cart,
  CartDetails,
  ItemResaultPrice,
  Account,
  Project,
} from "@/models/";

export const getCartList = async (): Promise<ListCart[]> => {
  try {
    const response = await apiClient.get<ListCart[]>(`Cart/GetAllListCart`);
    console.log("📃 Get ListCart: ", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get ListCart API error: ", error);

    const serverMessage = error.response?.data || "Failed to fetch ListCart";
    throw new Error(serverMessage);
  }
};

export const getCart = async (cartId: number): Promise<CartDetails> => {
  try {
    const response = await apiClient.get<CartDetails>(
      `Cart/GetCart?CartId=${cartId}`
    );
    // console.log("Get Cart: ", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Get Cart API error: ", error);

    const serverMessage = error.response?.data || "Failed to fetch Cart";
    throw new Error(serverMessage);
  }
};

export const getListOfCartItems = async (
  cart: ListCart
): Promise<ItemResaultPrice[]> => {
  try {
    const response = await apiClient.post<ItemResaultPrice[]>(
      `/Cart/GetListCartItem`,
      cart
    );
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

export const editCartDetails = async (
  cart: CartDetails
): Promise<CartDetails> => {
  try {
    const response = await apiClient.put<CartDetails>(`/Cart/UpdatePut`, {
      id: cart.id,
      cash: cart.cash,
      codeAccCustomer: cart.codeAccCustomer,
      projectIdCustomer: cart.projectIdCustomer,
      byWhom: cart.byWhom,
      branchCenterDelivery: cart.branchCenterDelivery,
      fastSending: cart.fastSending,
      preSell: cart.preSell,
      transit: cart.transit,
      alternate: cart.alternate,
      installment: cart.installment,
      warehouseId: cart.warehouseId,
      valueDeliveryService: cart.valueDeliveryService,
      vehicleId: cart.vehicleId,
    });
    console.log("✏ Edit CartDetails responce: ", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Edit CartDetails API error: ", error);

    const serverMessage = error.response?.data || "Edit CartDetails failed";
    throw new Error(serverMessage);
  }
};

export const addCart = async (
  item: ItemResaultPrice | null,
  account: Account| null,
  project: Project| null,
  branchCenterDelivery: boolean | null,
  vehicleId: string | undefined
): Promise<Cart> => {
  try {
    const response = await apiClient.post<Cart>(`/Cart/Add`, {
      codeAccCustomer: account?.codeAcc,
      projectIdCustomer: project?.id,
      branchCenterDelivery: branchCenterDelivery,
      transit: item?.activateTransit,
      warehouseId: item?.warehouseId,
      vehicleId: vehicleId,
    });
    return response.data;
  } catch (error: any) {
    console.error("get Cart API error: ", error);

    const serverMessage = error.response?.data || "get Cart failed";
    throw new Error(serverMessage);
  }
};

export const addItemToCart = async (
  cartId: number | number,
  priceId: number | undefined,
  value: number | number,
  valueId: number | undefined
): Promise<Cart> => {
  try {
    const response = await apiClient.post<Cart>(`/Cart/AddItem`, {
      cartId: cartId,
      priceId: priceId,
      value: value,
      valueId: valueId,
    });
    console.log("🎂 ~ addItemToCart ~ response.data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("get CartAddItem API error: ", error);

    const serverMessage = error.response?.data || "get CartAddItem failed";
    throw new Error(serverMessage);
  }
};
