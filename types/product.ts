export interface ProductDescription {
  productdesc: string;
  features: string[];
  productDetails: string[];
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: string;
}
