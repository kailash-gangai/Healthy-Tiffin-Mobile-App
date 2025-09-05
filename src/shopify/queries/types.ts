export interface ProductInfo {
  title: string;
  quantity: number;
  variantId: string | null;
  variantTitle: string | null;
  sku: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
}

export interface OrderSummary {
  id: string;
  name: string;
  orderNumber: number;
  processedAt: string; // note: corrected spelling
  financialStatus: string;
  fulfillmentStatus: string;
  onPress?: () => void;
  items: ProductInfo[];
}

export interface OrdersResponse {
  orders: OrderSummary[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string; // note: string (not String)
  };
}
