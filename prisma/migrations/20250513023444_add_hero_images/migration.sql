-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "googleId" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "originalPrice" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL,
    "images" TEXT[],
    "color" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "length" DOUBLE PRECISION,
    "breadth" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "description" TEXT,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "productDetails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "productdesc" TEXT,
    "sizeData" JSONB,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailableColors" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "colorCategories" JSONB NOT NULL,

    CONSTRAINT "AvailableColors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrebuiltProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "price" INTEGER NOT NULL DEFAULT 0,
    "originalPrice" INTEGER NOT NULL DEFAULT 0,
    "availableColors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "availableSizes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isCustomizable" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "length" DOUBLE PRECISION,
    "breadth" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "productDetails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "productdesc" TEXT,
    "sizeData" JSONB,

    CONSTRAINT "PrebuiltProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductSize" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "originalPrice" INTEGER NOT NULL,
    "sizeType" TEXT NOT NULL DEFAULT 'standard',
    "prebuiltProductId" TEXT NOT NULL,

    CONSTRAINT "ProductSize_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductColor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hexCode" TEXT NOT NULL,
    "prebuiltProductId" TEXT NOT NULL,

    CONSTRAINT "ProductColor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WishlistItem" (
    "id" TEXT NOT NULL,
    "wishlistId" TEXT NOT NULL,
    "productId" TEXT,
    "prebuiltProductId" TEXT,

    CONSTRAINT "WishlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "productId" TEXT,
    "prebuiltProductId" TEXT,
    "productSizeId" TEXT,
    "productColorId" TEXT,
    "quantity" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customization" TEXT,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "landmark" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "pincode" TEXT,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OTP" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blog" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "keywords" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500),
    "thumbnailImage" VARCHAR(255),
    "heroImage" VARCHAR(255),

    CONSTRAINT "Blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarouselItem" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarouselItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormResponse" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "fileExtension" TEXT NOT NULL,
    "prototype" TEXT NOT NULL,
    "prototypeOption" TEXT,
    "printingTechnology" TEXT NOT NULL,
    "material" TEXT,
    "materialType" TEXT,
    "materialDescription" TEXT,
    "quantity" INTEGER,
    "productColor" TEXT NOT NULL,
    "filamentColor" TEXT,
    "resinColor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmallBatchManufacturingResponse" (
    "id" TEXT NOT NULL,
    "designFile" TEXT,
    "quantity" INTEGER NOT NULL,
    "requirements" TEXT,
    "technology" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "materialSubtype" TEXT,
    "productColor" TEXT NOT NULL,
    "filamentColor" TEXT,
    "resinColor" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmallBatchManufacturingResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrototypingRequest" (
    "id" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "technology" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "materialSubtype" TEXT,
    "color" TEXT NOT NULL,
    "filamentColor" TEXT,
    "resinColor" TEXT,
    "customMaterial" TEXT,
    "designFile" TEXT,
    "specialRequirements" TEXT,
    "bulkQuantity" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrototypingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Onetimep" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Onetimep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaliseFormResponse" (
    "id" TEXT NOT NULL,
    "isAware" TEXT NOT NULL,
    "categories" TEXT[],
    "statueDetails" TEXT NOT NULL,
    "wantMore" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonaliseFormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Form3DResponse" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "fileReference" TEXT,
    "requirement" TEXT NOT NULL,
    "fileExtension" TEXT NOT NULL,
    "prototype" TEXT NOT NULL,
    "prototypeOption" TEXT,
    "printingTechnology" TEXT,
    "material" TEXT,
    "materialType" TEXT,
    "materialDescription" TEXT,
    "quantity" INTEGER,
    "productColor" TEXT,
    "filamentColor" TEXT,
    "resinColor" TEXT,
    "additionalFile" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Form3DResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "prebuiltProductId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'payment_pending',
    "shippingAddress" JSONB NOT NULL,
    "billingAddress" JSONB NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionId" TEXT,
    "trackingInfo" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PincodeLocation" (
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "city" TEXT,
    "state" TEXT,

    CONSTRAINT "PincodeLocation_pkey" PRIMARY KEY ("pincode")
);

-- CreateTable
CREATE TABLE "HeroImage" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "AvailableColors_category_key" ON "AvailableColors"("category");

-- CreateIndex
CREATE INDEX "ProductSize_prebuiltProductId_idx" ON "ProductSize"("prebuiltProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSize_prebuiltProductId_name_key" ON "ProductSize"("prebuiltProductId", "name");

-- CreateIndex
CREATE INDEX "ProductColor_prebuiltProductId_idx" ON "ProductColor"("prebuiltProductId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductColor_prebuiltProductId_name_key" ON "ProductColor"("prebuiltProductId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Wishlist_userId_key" ON "Wishlist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WishlistItem_wishlistId_productId_prebuiltProductId_key" ON "WishlistItem"("wishlistId", "productId", "prebuiltProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_prebuiltProductId_productSizeId_p_key" ON "CartItem"("cartId", "productId", "prebuiltProductId", "productSizeId", "productColorId");

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OTP_userId_action_key" ON "OTP"("userId", "action");

-- CreateIndex
CREATE INDEX "Onetimep_email_idx" ON "Onetimep"("email");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_prebuiltProductId_idx" ON "Review"("prebuiltProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_transactionId_key" ON "Order"("transactionId");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSize" ADD CONSTRAINT "ProductSize_prebuiltProductId_fkey" FOREIGN KEY ("prebuiltProductId") REFERENCES "PrebuiltProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductColor" ADD CONSTRAINT "ProductColor_prebuiltProductId_fkey" FOREIGN KEY ("prebuiltProductId") REFERENCES "PrebuiltProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wishlist" ADD CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_prebuiltProductId_fkey" FOREIGN KEY ("prebuiltProductId") REFERENCES "PrebuiltProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WishlistItem" ADD CONSTRAINT "WishlistItem_wishlistId_fkey" FOREIGN KEY ("wishlistId") REFERENCES "Wishlist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_prebuiltProductId_fkey" FOREIGN KEY ("prebuiltProductId") REFERENCES "PrebuiltProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productSizeId_fkey" FOREIGN KEY ("productSizeId") REFERENCES "ProductSize"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productColorId_fkey" FOREIGN KEY ("productColorId") REFERENCES "ProductColor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTP" ADD CONSTRAINT "OTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_prebuiltProductId_fkey" FOREIGN KEY ("prebuiltProductId") REFERENCES "PrebuiltProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
