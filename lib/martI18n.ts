// Centralized Bilingual Dictionary (English & Bengali) + Taxonomy Helpers for Xeetrix Mart
// TypeScript enforces 100% key parity between EN and BN so zero UI text is hardcoded.

export type MartLang = "en" | "bn";

export interface MartDictionary {
  common: {
    brandPrimary: string;
    brandAccent: string;
    brandHomeAria: string;
    currencySymbol: string;
    helplineLabel: string;
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    close: string;
    print: string;
    reset: string;
    search: string;
    all: string;
    active: string;
    hidden: string;
    paused: string;
    featured: string;
    sku: string;
    switchToBn: string;
    switchToEn: string;
    languageSwitcherAria: string;
    errorFallback: string;
  };
  header: {
    searchPlaceholder: string;
    searchAria: string;
    allCategoriesOption: string;
    filterCategoryAria: string;
    trackOrder: string;
    cart: string;
    cartAriaPrefix: string;
    cartAriaSuffix: string;
    menuToggleAria: string;
    mobileSearchPlaceholder: string;
    skipToContent: string;
    voiceSearchAria: string;
    voiceListening: string;
    recentSearchesTitle: string;
    clearRecentBtn: string;
    trendingSearchesTitle: string;
    autoCompleteTitle: string;
    matchedCategoriesTitle: string;
    liveProductsTitle: string;
    didYouMeanPrefix: string;
    seeAllResultsPrefix: string;
    noInstantMatchHint: string;
  };
  footer: {
    description: string;
    customerServiceTitle: string;
    browseAllProducts: string;
    trackYourOrder: string;
    storeAdminPortal: string;
    supportDeskTitle: string;
    address: string;
    allRightsReserved: string;
    helplineLabel: string;
  };
  hero: {
    kicker: string;
    deliveryCardTitle: string;
    insideDhakaLabel: string;
    outsideDhakaLabel: string;
    directHelplineLabel: string;
    trackExistingOrder: string;
  };
  trust: {
    fastDeliveryTitle: string;
    fastDeliveryDesc: string;
    codTitle: string;
    codDesc: string;
    authenticTitle: string;
    authenticDesc: string;
    easyReturnTitle: string;
    easyReturnDesc: string;
  };
  catalog: {
    categoriesTitle: string;
    labelsTitle: string;
    allCategories: string;
    allLabels: string;
    clearFilters: string;
    activeFiltersLabel: string;
    sortFeatured: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    sortNewest: string;
    sortAria: string;
    productSingular: string;
    productPlural: string;
    inStockSuffix: string;
    availableToOrder: string;
    outOfStock: string;
    soldOut: string;
    optionsPrefix: string;
    quickViewAria: string;
    addToCart: string;
    buyNow: string;
    addedToCartSuffix: string;
    viewCart: string;
    emptyStoreKicker: string;
    emptyStoreTitle: string;
    emptyStoreDesc: string;
    noMatchTitle: string;
    noMatchDesc: string;
    resetFiltersBtn: string;
    generalFallback: string;
    subcategoriesLabel: string;
    allInCategoryBtn: string;
    didYouMeanBannerPrefix: string;
    showingClosestMatchesBanner: string;
  };
  quickView: {
    closeAria: string;
    availabilityLabel: string;
    unitsInStockSuffix: string;
    availableReady: string;
    outOfStock: string;
    defaultDesc: string;
    selectVariant: string;
    quantity: string;
    decreaseQtyAria: string;
    increaseQtyAria: string;
    addToCart: string;
    buyNow: string;
    soldOut: string;
    viewFullPageBtn: string;
    copyLinkBtn: string;
    linkCopiedBtn: string;
    backToStoreBtn: string;
    specificationsTitle: string;
    relatedProductsTitle: string;
    relatedProductsSubtitle: string;
    productNotFoundTitle: string;
    productNotFoundDesc: string;
    saveAmountPrefix: string;
  };
  cart: {
    drawerTitle: string;
    invoiceTitle: string;
    invoiceRefPrefix: string;
    drawerSubtitle: string;
    closeAria: string;
    orderSuccessTitle: string;
    orderSuccessDesc: string;
    invoiceHeader: string;
    orderIdLabel: string;
    deliveryPrefix: string;
    paymentPrefix: string;
    trxIdPrefix: string;
    itemCol: string;
    qtyCol: string;
    amountCol: string;
    subtotal: string;
    deliveryFee: string;
    totalPayable: string;
    printInvoice: string;
    continueShopping: string;
    emptyTitle: string;
    emptyDesc: string;
    browseProducts: string;
    deliveryZone: string;
    insideDhaka: string;
    outsideDhaka: string;
    removeItemAria: string;
    customerDetailsTitle: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    addressLabel: string;
    addressPlaceholder: string;
    paymentMethodLabel: string;
    codOption: string;
    mobileBankingOption: string;
    providerLabel: string;
    sendMoneyPrefix: string;
    trxIdLabel: string;
    trxIdPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    grandTotal: string;
    submittingOrder: string;
    confirmOrder: string;
    errEmptyCart: string;
    errMissingDetails: string;
    errOrderFailed: string;
    cartItemUnavailable: string;
    cartUnavailableCheckoutErr: string;
    stepBagLabel: string;
    stepCheckoutLabel: string;
    continueCheckoutBtn: string;
    backToBagBtn: string;
    savedAddressHint: string;
    clearSavedAddressBtn: string;
    changeVariantLabel: string;
    changeColorLabel: string;
    changeSizeLabel: string;
  };
  track: {
    modalTitle: string;
    modalSubtitle: string;
    closeAria: string;
    orderIdLabel: string;
    orderIdPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    searching: string;
    checkStatus: string;
    orderDateLabel: string;
    cancelledAlert: string;
    orderedItemsTitle: string;
    totalPayableLabel: string;
    errMissingFields: string;
    errNotFound: string;
  };
  orderStatuses: {
    Pending: string;
    Confirmed: string;
    Packaging: string;
    Shipped: string;
    Delivered: string;
    Cancelled: string;
  };
  admin: {
    initializing: string;
    portalTitle: string;
    portalSubtitle: string;
    passcodeLabel: string;
    passcodePlaceholder: string;
    showPasscodeAria: string;
    hidePasscodeAria: string;
    verifying: string;
    unlockBtn: string;
    backToStore: string;
    independentPortal: string;
    invalidPasscode: string;
    sessionExpired: string;
    exitBtn: string;
    viewStoreBtn: string;
    logoutBtn: string;
    sheetStatusLabel: string;
    connectedLive: string;
    notConnected: string;
    breadcrumbRoot: string;
    exportCsv: string;
    syncing: string;
    refreshStore: string;
    dismiss: string;
    setupAlertTitle: string;
    setupAlertBody: string;
    openMenuAria: string;
    closeMenuAria: string;
    navGroups: {
      operations: string;
      catalog: string;
      financeCrm: string;
      system: string;
    };
    nav: {
      analytics: string;
      orders: string;
      products: string;
      taxonomy: string;
      coupons: string;
      suppliers: string;
      accounts: string;
      customers: string;
      settings: string;
    };
    analytics: {
      totalRevenue: string;
      validOrdersPrefix: string;
      validOrdersSuffix: string;
      todaysOrders: string;
      allTimeOrdersSuffix: string;
      pendingActive: string;
      pendingActiveDesc: string;
      deliveredOrders: string;
      catalogSkusSuffix: string;
      categoriesSuffix: string;
      labelsSuffix: string;
      fulfillmentOverview: string;
      lowStockTitle: string;
      manageInventory: string;
      noProductsLowStock: string;
      allStockHealthy: string;
      leftSuffix: string;
      addFiveStock: string;
    };
    orders: {
      allFilter: string;
      searchPlaceholder: string;
      colOrderDate: string;
      colCustomerDelivery: string;
      colOrderedItems: string;
      colPayment: string;
      colTotal: string;
      colStatus: string;
      colInvoice: string;
      emptyOrders: string;
      deliveryPrefix: string;
      notePrefix: string;
      trxPrefix: string;
      invoiceBtn: string;
      editOrderBtn: string;
      deleteOrderBtn: string;
      deleteOrderConfirm: string;
      editOrderTitle: string;
      orderCustomerNameLabel: string;
      orderPhoneLabel: string;
      orderAreaLabel: string;
      orderDeliveryChargeLabel: string;
      orderDiscountCodeLabel: string;
      orderDiscountAmountLabel: string;
      orderAddressLabel: string;
      orderPaymentMethodLabel: string;
      orderPaymentProviderLabel: string;
      orderTrxIdLabel: string;
      orderNotesLabel: string;
      recalculatedTotalLabel: string;
      saveOrderBtn: string;
      savingOrderBtn: string;
      orderUpdatedMsg: string;
      msgOrderDetailsUpdated: string;
      msgOrderDeleted: string;
      errOrderUpdate: string;
      errOrderCustomerReq: string;
    };
    products: {
      addTitle: string;
      editTitle: string;
      cancelEdit: string;
      editingBannerHint: string;
      variantStockLockedNote: string;
      duplicateBtn: string;
      nameEnLabel: string;
      nameEnPlaceholder: string;
      nameBnLabel: string;
      nameBnPlaceholder: string;
      skuLabel: string;
      skuPlaceholder: string;
      stockLabel: string;
      priceLabel: string;
      comparePriceLabel: string;
      variantsEnLabel: string;
      variantsEnPlaceholder: string;
      variantsBnLabel: string;
      variantsBnPlaceholder: string;
      categoriesLabel: string;
      categoriesHint: string;
      noCategoriesHint: string;
      labelsLabel: string;
      labelsHint: string;
      noLabelsHint: string;
      goToTaxonomyBtn: string;
      imageUrlLabel: string;
      uploadToDrive: string;
      uploading: string;
      descEnLabel: string;
      descEnPlaceholder: string;
      descBnLabel: string;
      descBnPlaceholder: string;
      visibleCheckbox: string;
      featuredCheckbox: string;
      savingProduct: string;
      saveChangesBtn: string;
      publishProductBtn: string;
      catalogTableTitle: string;
      filterPlaceholder: string;
      colProductSku: string;
      colTaxonomy: string;
      colPrice: string;
      colStock: string;
      colFlags: string;
      colActions: string;
      emptyProducts: string;
      activeFlag: string;
      pausedFlag: string;
      featuredTitle: string;
      editBtn: string;
      deleteBtn: string;
      errMissingProdFields: string;
      errConnectBackend: string;
      msgSaved: string;
      msgCreated: string;
      msgDeleted: string;
      msgImageUploaded: string;
      msgFlagUpdated: string;
      copyLinkBtn: string;
      linkCopiedMsg: string;
    };
    taxonomy: {
      catAddTitle: string;
      catEditTitle: string;
      catSlugLabel: string;
      catSlugPlaceholder: string;
      slugCascadeNote: string;
      catNameEnLabel: string;
      catNameEnPlaceholder: string;
      catNameBnLabel: string;
      catNameBnPlaceholder: string;
      catParentLabel: string;
      catParentNone: string;
      catSortOrderLabel: string;
      catDescEnLabel: string;
      catDescEnPlaceholder: string;
      catDescBnLabel: string;
      catDescBnPlaceholder: string;
      catImageLabel: string;
      driveUploadBtn: string;
      uploadingBtn: string;
      catCreateBtn: string;
      catCreatingBtn: string;
      catSaveBtn: string;
      catSavingBtn: string;
      catListTitle: string;
      catEmpty: string;
      catParentPrefix: string;
      catVisible: string;
      catHidden: string;
      lblAddTitle: string;
      lblEditTitle: string;
      lblSlugLabel: string;
      lblSlugPlaceholder: string;
      lblNameEnLabel: string;
      lblNameEnPlaceholder: string;
      lblNameBnLabel: string;
      lblNameBnPlaceholder: string;
      lblToneLabel: string;
      lblToneEmerald: string;
      lblToneGold: string;
      lblToneSlate: string;
      lblSortOrderLabel: string;
      lblDescEnLabel: string;
      lblDescEnPlaceholder: string;
      lblDescBnLabel: string;
      lblDescBnPlaceholder: string;
      lblCreateBtn: string;
      lblCreatingBtn: string;
      lblSaveBtn: string;
      lblSavingBtn: string;
      lblListTitle: string;
      lblEmpty: string;
      errCatNameReq: string;
      errLblNameReq: string;
      errDuplicateSlug: string;
      msgCatCreated: string;
      msgCatUpdated: string;
      msgCatDeleted: string;
      msgCatImageUploaded: string;
      msgLblCreated: string;
      msgLblUpdated: string;
      msgLblDeleted: string;
      removeImageBtn: string;
      coverPreviewAlt: string;
      linkedProductsSuffix: string;
    };
    settings: {
      title: string;
      subtitle: string;
      promoEnLabel: string;
      promoBnLabel: string;
      heroTitleEnLabel: string;
      heroTitleBnLabel: string;
      heroSubtitleEnLabel: string;
      heroSubtitleBnLabel: string;
      heroCtaEnLabel: string;
      heroCtaBnLabel: string;
      insideDhakaLabel: string;
      outsideDhakaLabel: string;
      mobileBankingLabel: string;
      mobileBankingPlaceholder: string;
      savingBtn: string;
      saveBtn: string;
      msgSaved: string;
    };
    customers: {
      title: string;
      subtitle: string;
      downloadCsvBtn: string;
      colCustomer: string;
      colPhone: string;
      colAddress: string;
      colOrders: string;
      colSpend: string;
      colHistory: string;
      emptyCustomers: string;
      viewOrdersBtn: string;
      ordersModalCloseAria: string;
    };
    invoice: {
      titlePrefix: string;
      billTo: string;
      fulfillmentPayment: string;
      areaLabel: string;
      paymentLabel: string;
      trxIdLabel: string;
      itemCol: string;
      qtyCol: string;
      amountCol: string;
      subtotalLabel: string;
      deliveryPrefix: string;
      totalAmountLabel: string;
    };
    csvHeaders: string[];
  };
  errors: {
    BACKEND_UNCONFIGURED: string;
    UNAUTHORIZED: string;
    NOT_FOUND: string;
    MISSING_FIELDS: string;
    GENERIC_NETWORK: string;
    OUT_OF_STOCK: string;
    VARIANT_UNAVAILABLE: string;
    DUPLICATE_SKU: string;
  };
}

export const MART_DICTIONARY: Record<MartLang, MartDictionary> = {
  en: {
    common: {
      brandPrimary: "Xeetrix",
      brandAccent: "Mart",
      brandHomeAria: "Xeetrix Mart Home",
      currencySymbol: "৳",
      helplineLabel: "Helpline",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      close: "Close",
      print: "Print",
      reset: "Reset",
      search: "Search",
      all: "All",
      active: "Active",
      hidden: "Hidden",
      paused: "Paused",
      featured: "Featured",
      sku: "SKU",
      switchToBn: "বাংলা",
      switchToEn: "EN",
      languageSwitcherAria: "Switch language between English and Bengali",
      errorFallback: "Something went wrong. Please try again.",
    },
    header: {
      searchPlaceholder: "Search in English, বাংলা, or Banglish (e.g. watch, ঘড়ি, ghori)...",
      searchAria: "Search store products in English, Bengali, or Banglish",
      allCategoriesOption: "All Categories",
      filterCategoryAria: "Filter by category",
      trackOrder: "Track Order",
      cart: "Cart",
      cartAriaPrefix: "Open shopping cart with",
      cartAriaSuffix: "items",
      menuToggleAria: "Toggle store menu",
      mobileSearchPlaceholder: "Search products (English / বাংলা / Banglish)...",
      skipToContent: "Skip to main content",
      voiceSearchAria: "Search by voice",
      voiceListening: "Listening...",
      recentSearchesTitle: "Recent Searches",
      clearRecentBtn: "Clear",
      trendingSearchesTitle: "Trending Searches",
      autoCompleteTitle: "Suggested Keywords",
      matchedCategoriesTitle: "Matching Categories",
      liveProductsTitle: "Instant Product Matches",
      didYouMeanPrefix: "Did you mean:",
      seeAllResultsPrefix: "See all results for",
      noInstantMatchHint: "Showing closest & popular matches",
    },
    footer: {
      description:
        "Your trusted destination for authentic electronics, daily essentials, and verified lifestyle products with fast Cash on Delivery across Bangladesh.",
      customerServiceTitle: "Customer Service",
      browseAllProducts: "Browse All Products",
      trackYourOrder: "Track Your Order",
      storeAdminPortal: "Store Admin Portal",
      supportDeskTitle: "Store Support Desk",
      address: "Dhaka, Bangladesh",
      allRightsReserved: "All rights reserved.",
      helplineLabel: "Customer Helpline",
    },
    hero: {
      kicker: "Xeetrix Mart · Official Online Store",
      deliveryCardTitle: "Transparent Delivery Rates",
      insideDhakaLabel: "Inside Dhaka Metro",
      outsideDhakaLabel: "Outside Dhaka (Nationwide)",
      directHelplineLabel: "Direct Store Helpline",
      trackExistingOrder: "Track Existing Order",
    },
    trust: {
      fastDeliveryTitle: "Fast Delivery",
      fastDeliveryDesc: "24–48h inside Dhaka, 2–4 days nationwide",
      codTitle: "Cash on Delivery (COD)",
      codDesc: "Pay at doorstep or via Mobile Banking",
      authenticTitle: "100% Authentic Products",
      authenticDesc: "Quality checked prior to courier dispatch",
      easyReturnTitle: "Easy Return",
      easyReturnDesc: "7-day hassle-free replacement policy",
    },
    catalog: {
      categoriesTitle: "Categories",
      labelsTitle: "Collections & Labels",
      allCategories: "All Categories",
      allLabels: "All Collections",
      clearFilters: "Clear Filters",
      activeFiltersLabel: "Active filters",
      sortFeatured: "Sort: Featured",
      sortPriceAsc: "Price: Low to High",
      sortPriceDesc: "Price: High to Low",
      sortNewest: "Sort: Newest First",
      sortAria: "Sort products",
      productSingular: "product",
      productPlural: "products",
      inStockSuffix: "in stock",
      availableToOrder: "In Stock",
      outOfStock: "Out of stock",
      soldOut: "Sold Out",
      optionsPrefix: "Options",
      quickViewAria: "Quick view",
      addToCart: "Add to Cart",
      buyNow: "Order Now",
      addedToCartSuffix: "added to cart",
      viewCart: "View Cart",
      emptyStoreKicker: "Store Launching Soon",
      emptyStoreTitle: "New Products Arriving Soon",
      emptyStoreDesc:
        "Our curated catalog is currently being stocked with verified essentials and electronics. Please check back shortly or reach out directly for wholesale and early order inquiries.",
      noMatchTitle: "No Matching Products Found",
      noMatchDesc:
        "Try clearing one of your selected categories, labels, or search keywords.",
      resetFiltersBtn: "Reset Filters",
      generalFallback: "General",
      subcategoriesLabel: "Sub-categories",
      allInCategoryBtn: "All in category",
      didYouMeanBannerPrefix: "Did you mean",
      showingClosestMatchesBanner:
        "No exact match for your spelling — showing closest & recommended products below:",
    },
    quickView: {
      closeAria: "Close product quick view",
      availabilityLabel: "Availability",
      unitsInStockSuffix: "units in stock",
      availableReady: "In stock · Ready to ship",
      outOfStock: "Out of stock",
      defaultDesc: "Verified product from Xeetrix Mart.",
      selectVariant: "Select Variant / Size",
      quantity: "Quantity",
      decreaseQtyAria: "Decrease quantity",
      increaseQtyAria: "Increase quantity",
      addToCart: "Add to Cart",
      buyNow: "Order Now",
      soldOut: "Sold Out",
      viewFullPageBtn: "Open Full Product Page",
      copyLinkBtn: "Copy Product Link",
      linkCopiedBtn: "Link Copied",
      backToStoreBtn: "Back to Store Catalog",
      specificationsTitle: "Product Overview & Details",
      relatedProductsTitle: "Related Products You May Like",
      relatedProductsSubtitle: "Explore more verified items from this collection",
      productNotFoundTitle: "Product Not Found",
      productNotFoundDesc:
        "The product link you followed may have been updated or is currently unavailable. Browse our active catalog below.",
      saveAmountPrefix: "Save",
    },
    cart: {
      drawerTitle: "Shopping Cart",
      invoiceTitle: "Order Invoice",
      invoiceRefPrefix: "Reference",
      drawerSubtitle: "Review items & complete delivery checkout",
      closeAria: "Close cart drawer",
      orderSuccessTitle: "Order Placed Successfully",
      orderSuccessDesc: "Save your Order ID below to track live fulfillment status anytime.",
      invoiceHeader: "Xeetrix Mart Invoice",
      orderIdLabel: "Order ID",
      deliveryPrefix: "Delivery",
      paymentPrefix: "Payment",
      trxIdPrefix: "TrxID",
      itemCol: "Item",
      qtyCol: "Qty",
      amountCol: "Amount",
      subtotal: "Subtotal",
      deliveryFee: "Delivery Fee",
      totalPayable: "Total Payable",
      printInvoice: "Print Invoice",
      continueShopping: "Continue Shopping",
      emptyTitle: "Your Cart is Empty",
      emptyDesc: "Add products from the store catalog to proceed with delivery checkout.",
      browseProducts: "Browse Products",
      deliveryZone: "Delivery Zone",
      insideDhaka: "Inside Dhaka",
      outsideDhaka: "Outside Dhaka",
      removeItemAria: "Remove item",
      customerDetailsTitle: "Customer & Delivery Details",
      fullNameLabel: "Full Name *",
      fullNamePlaceholder: "Enter your full name",
      phoneLabel: "Phone Number *",
      phonePlaceholder: "01XXXXXXXXX",
      addressLabel: "Full Delivery Address *",
      addressPlaceholder: "House, Road, Area, Thana, District",
      paymentMethodLabel: "Payment Method",
      codOption: "Cash on Delivery",
      mobileBankingOption: "Mobile Banking",
      providerLabel: "Mobile Banking Provider",
      sendMoneyPrefix: "Send payment to",
      trxIdLabel: "Transaction ID (Optional)",
      trxIdPlaceholder: "Enter TrxID if already paid",
      notesLabel: "Delivery Instructions (Optional)",
      notesPlaceholder: "Preferred time slot or landmark",
      grandTotal: "Grand Total",
      submittingOrder: "Confirming Order...",
      confirmOrder: "Confirm Order",
      errEmptyCart: "Your shopping cart is empty.",
      errMissingDetails: "Please enter your full name, phone number, and delivery address.",
      errOrderFailed:
        "Order could not be placed. Please try again or call +880 965 803 6631.",
      cartItemUnavailable: "Unavailable or out of stock — please remove or adjust qty.",
      cartUnavailableCheckoutErr:
        "One or more items in your cart are no longer available. Please remove them to continue.",
      stepBagLabel: "1. Bag & Delivery",
      stepCheckoutLabel: "2. Address & Pay",
      continueCheckoutBtn: "Continue to Checkout",
      backToBagBtn: "Back to Bag",
      savedAddressHint: "Saved delivery details pre-filled",
      clearSavedAddressBtn: "Clear Saved",
      changeVariantLabel: "Variant",
      changeColorLabel: "Color",
      changeSizeLabel: "Size",
    },
    track: {
      modalTitle: "Track Your Order",
      modalSubtitle: "Enter your Order ID and checkout phone number",
      closeAria: "Close order tracker",
      orderIdLabel: "Order ID *",
      orderIdPlaceholder: "e.g. XM-10248",
      phoneLabel: "Phone Number *",
      phonePlaceholder: "01XXXXXXXXX",
      searching: "Searching...",
      checkStatus: "Check Live Status",
      orderDateLabel: "Order Date",
      cancelledAlert: "This order was cancelled. Call +880 965 803 6631 for assistance.",
      orderedItemsTitle: "Ordered Items",
      totalPayableLabel: "Total Payable",
      errMissingFields: "Please enter both your Order ID and phone number.",
      errNotFound: "Unable to retrieve order status right now.",
    },
    orderStatuses: {
      Pending: "Pending",
      Confirmed: "Confirmed",
      Packaging: "Packaging",
      Shipped: "Shipped",
      Delivered: "Delivered",
      Cancelled: "Cancelled",
    },
    admin: {
      initializing: "Initializing Xeetrix Mart Admin...",
      portalTitle: "Store Admin Console",
      portalSubtitle:
        "Sign in to manage bilingual products, multi-categories, labels, orders, delivery rates, and customer analytics.",
      passcodeLabel: "Store Admin Passcode",
      passcodePlaceholder: "Enter store passcode",
      showPasscodeAria: "Show passcode",
      hidePasscodeAria: "Hide passcode",
      verifying: "Verifying Passcode...",
      unlockBtn: "Unlock Store Admin",
      backToStore: "Back to Storefront",
      independentPortal: "Independent Mart Portal",
      invalidPasscode: "Invalid Mart Admin passcode. Please try again.",
      sessionExpired: "Your admin session expired or passcode changed. Please unlock again.",
      exitBtn: "Exit",
      viewStoreBtn: "View Store",
      logoutBtn: "Logout",
      sheetStatusLabel: "Store Sheet",
      connectedLive: "Connected Live",
      notConnected: "Not Connected",
      breadcrumbRoot: "Xeetrix Mart Admin",
      exportCsv: "Export CSV",
      syncing: "Syncing...",
      refreshStore: "Refresh Store",
      dismiss: "Dismiss",
      setupAlertTitle: "Standalone Backend Setup Required:",
      setupAlertBody:
        "Deploy backend/mart/Code.gs inside your Google Sheet (run setupMartBackend), then configure MART_SCRIPT_URL in Vercel Environment Variables so products, categories, labels, orders, and Google Drive images sync live.",
      openMenuAria: "Open navigation menu",
      closeMenuAria: "Close navigation menu",
      navGroups: {
        operations: "Operations",
        catalog: "Catalog & Offers",
        financeCrm: "Finance & CRM",
        system: "Configuration",
      },
      nav: {
        analytics: "Dashboard & Follow-ups",
        orders: "Orders & Fulfillment",
        products: "Products & Sourcing",
        taxonomy: "Categories & Labels",
        coupons: "Coupons & Promo",
        suppliers: "Suppliers & Dropship",
        accounts: "Accounts & P&L",
        customers: "Client CRM & Risk",
        settings: "Store Settings",
      },
      analytics: {
        totalRevenue: "Total Revenue (Active)",
        validOrdersPrefix: "Across",
        validOrdersSuffix: "valid orders",
        todaysOrders: "Today's Orders",
        allTimeOrdersSuffix: "all-time orders recorded",
        pendingActive: "Pending & Active",
        pendingActiveDesc: "Pending, Confirmed & Packaging",
        deliveredOrders: "Delivered Orders",
        catalogSkusSuffix: "catalog SKUs",
        categoriesSuffix: "categories",
        labelsSuffix: "labels",
        fulfillmentOverview: "Order Fulfillment Overview",
        lowStockTitle: "Low-Stock Alerts (≤ 5 units)",
        manageInventory: "Manage Inventory",
        noProductsLowStock:
          "No products added yet. Head to Products & Inventory to publish your first item.",
        allStockHealthy: "All products have healthy stock levels.",
        leftSuffix: "left",
        addFiveStock: "+5 Stock",
      },
      orders: {
        allFilter: "All",
        searchPlaceholder: "Search Order ID, customer, phone...",
        colOrderDate: "Order ID & Date",
        colCustomerDelivery: "Customer & Delivery",
        colOrderedItems: "Ordered Items",
        colPayment: "Payment",
        colTotal: "Total",
        colStatus: "Status",
        colInvoice: "Invoice",
        emptyOrders: "No orders match your filter. Orders placed at /mart appear here live.",
        deliveryPrefix: "Delivery",
        notePrefix: "Note",
        trxPrefix: "TrxID",
        invoiceBtn: "Invoice",
        editOrderBtn: "Edit Order",
        deleteOrderBtn: "Delete",
        deleteOrderConfirm: "Confirm Delete?",
        editOrderTitle: "Edit Order Details",
        orderCustomerNameLabel: "Customer Name *",
        orderPhoneLabel: "Phone Number *",
        orderAreaLabel: "Delivery Area",
        orderDeliveryChargeLabel: "Delivery Charge (৳)",
        orderDiscountCodeLabel: "Coupon / Promo Code",
        orderDiscountAmountLabel: "Discount Amount (৳)",
        orderAddressLabel: "Delivery Address *",
        orderPaymentMethodLabel: "Payment Method",
        orderPaymentProviderLabel: "Payment Provider",
        orderTrxIdLabel: "Transaction ID (TrxID)",
        orderNotesLabel: "Order Notes",
        recalculatedTotalLabel: "Recalculated Grand Total",
        saveOrderBtn: "Save Order Changes",
        savingOrderBtn: "Saving Order...",
        orderUpdatedMsg: "Order status updated successfully.",
        msgOrderDetailsUpdated: "Order details updated in Mart_Orders.",
        msgOrderDeleted: "Order deleted and active own-stock restored.",
        errOrderUpdate: "Failed to update order status.",
        errOrderCustomerReq: "Customer name, phone number, and address are required.",
      },
      products: {
        addTitle: "Add New Product to Mart_Products",
        editTitle: "Edit Product",
        cancelEdit: "Cancel Edit",
        editingBannerHint: "Editing existing catalog product — changes update live storefront data.",
        variantStockLockedNote: "Auto-summed from active Color × Size matrix cells",
        duplicateBtn: "Clone",
        nameEnLabel: "Product Name (English) *",
        nameEnPlaceholder: "e.g. Kids Fleece Hoodie",
        nameBnLabel: "Product Name (Bengali)",
        nameBnPlaceholder: "যেমন: ছোটদের শীতের হুডি",
        skuLabel: "SKU Code",
        skuPlaceholder: "e.g. XM-KID-001",
        stockLabel: "Stock Quantity *",
        priceLabel: "Selling / Discount Price (BDT ৳) *",
        comparePriceLabel: "Regular Price (BDT ৳)",
        variantsEnLabel: "Variants / Sizes (English, Comma-separated)",
        variantsEnPlaceholder: "e.g. Navy Blue, Crimson or 2-3Y, 4-5Y",
        variantsBnLabel: "Variants / Sizes (Bengali, Comma-separated)",
        variantsBnPlaceholder: "যেমন: নেভি ব্লু, লাল বা ২-৩ বছর, ৪-৫ বছর",
        categoriesLabel: "Assign Categories (Multi-select) *",
        categoriesHint: "Select all matching categories (e.g. Baby + Clothing)",
        noCategoriesHint: "No categories created yet. Add categories in Categories & Labels first.",
        labelsLabel: "Assign Labels / Collections (Multi-select)",
        labelsHint: "Select promotional or seasonal collections (e.g. Winter Collection)",
        noLabelsHint: "No labels created yet. Add labels in Categories & Labels first.",
        goToTaxonomyBtn: "Manage Categories & Labels",
        imageUrlLabel: "Product Image URL (Auto-filled on Google Drive Upload)",
        uploadToDrive: "Upload Image to Drive",
        uploading: "Uploading to Drive...",
        descEnLabel: "Description (English)",
        descEnPlaceholder: "Specifications, fabric, care details...",
        descBnLabel: "Description (Bengali)",
        descBnPlaceholder: "বিস্তারিত বিবরণ, কাপড়ের মান, ওয়ারেন্টি তথ্য...",
        visibleCheckbox: "Visible in Storefront",
        featuredCheckbox: "Featured Product",
        savingProduct: "Saving Product...",
        saveChangesBtn: "Save Product Changes",
        publishProductBtn: "Publish Product",
        catalogTableTitle: "Inventory Catalog",
        filterPlaceholder: "Filter SKU, name, category, label...",
        colProductSku: "Product & SKU",
        colTaxonomy: "Categories & Labels",
        colPrice: "Price",
        colStock: "Stock",
        colFlags: "Flags",
        colActions: "Actions",
        emptyProducts:
          "No products in Mart_Products yet. Use the form above to add your first SKU.",
        activeFlag: "Active",
        pausedFlag: "Paused",
        featuredTitle: "Toggle Featured",
        editBtn: "Edit",
        deleteBtn: "Delete",
        errMissingProdFields: "Product English or Bengali name and selling price are required.",
        errConnectBackend: "Connect your Google Apps Script URL first to save products.",
        msgSaved: "Product updated in Mart_Products.",
        msgCreated: "Product published to Mart_Products.",
        msgDeleted: "Product deleted from Mart_Products.",
        msgImageUploaded: "Image uploaded to Google Drive.",
        msgFlagUpdated: "Product status updated.",
        copyLinkBtn: "Copy Link",
        linkCopiedMsg: "Product marketing link copied to clipboard.",
      },
      taxonomy: {
        catAddTitle: "Add Category (Mart_Categories)",
        catEditTitle: "Edit Category",
        catSlugLabel: "URL Slug (Auto-syncs linked products)",
        catSlugPlaceholder: "e.g. baby-clothing",
        slugCascadeNote: "Changing the slug automatically updates all linked products.",
        catNameEnLabel: "Category Name (English) *",
        catNameEnPlaceholder: "e.g. Baby, Clothing, Electronics",
        catNameBnLabel: "Category Name (Bengali)",
        catNameBnPlaceholder: "যেমন: বেবি, পোশাক, ইলেকট্রনিক্স",
        catParentLabel: "Parent Category (Optional)",
        catParentNone: "None (Top-Level Category)",
        catSortOrderLabel: "Display Order",
        catDescEnLabel: "Description (English)",
        catDescEnPlaceholder: "Brief category subtitle",
        catDescBnLabel: "Description (Bengali)",
        catDescBnPlaceholder: "সংক্ষিপ্ত ক্যাটাগরি পরিচিতি",
        catImageLabel: "Category Image URL (Auto-filled on Drive Upload)",
        driveUploadBtn: "Drive Upload",
        uploadingBtn: "Uploading...",
        catCreateBtn: "Create Category",
        catCreatingBtn: "Creating Category...",
        catSaveBtn: "Save Category Changes",
        catSavingBtn: "Saving Category...",
        catListTitle: "Categories",
        catEmpty: "No categories created yet.",
        catParentPrefix: "Under",
        catVisible: "Active",
        catHidden: "Hidden",
        lblAddTitle: "Add Label / Collection (Mart_Labels)",
        lblEditTitle: "Edit Label / Collection",
        lblSlugLabel: "URL Slug (Auto-syncs linked products)",
        lblSlugPlaceholder: "e.g. winter-collection",
        lblNameEnLabel: "Label / Collection Name (English) *",
        lblNameEnPlaceholder: "e.g. Winter Collection, New Arrival, Hot Deal",
        lblNameBnLabel: "Label / Collection Name (Bengali)",
        lblNameBnPlaceholder: "যেমন: উইন্টার কালেকশন, নতুন আগমন, হট ডিল",
        lblToneLabel: "Visual Accent Tone",
        lblToneEmerald: "Emerald (Seasonal / Primary)",
        lblToneGold: "Warm Gold (Promo / Highlight)",
        lblToneSlate: "Slate (Minimal / Standard)",
        lblSortOrderLabel: "Display Order",
        lblDescEnLabel: "Description (English)",
        lblDescEnPlaceholder: "Optional collection summary",
        lblDescBnLabel: "Description (Bengali)",
        lblDescBnPlaceholder: "ঐচ্ছিক কালেকশন বিবরণ",
        lblCreateBtn: "Create Label",
        lblCreatingBtn: "Creating Label...",
        lblSaveBtn: "Save Label Changes",
        lblSavingBtn: "Saving Label...",
        lblListTitle: "Labels & Collections",
        lblEmpty: "No labels or collections created yet.",
        errCatNameReq: "Category name (English or Bengali) is required.",
        errLblNameReq: "Label name (English or Bengali) is required.",
        errDuplicateSlug: "That slug is already in use by another item.",
        msgCatCreated: "Category saved to Mart_Categories.",
        msgCatUpdated: "Category updated and linked products synced.",
        msgCatDeleted: "Category deleted from Mart_Categories.",
        msgCatImageUploaded: "Category image saved to Google Drive.",
        msgLblCreated: "Label saved to Mart_Labels.",
        msgLblUpdated: "Label updated and linked products synced.",
        msgLblDeleted: "Label deleted from Mart_Labels.",
        removeImageBtn: "Remove Photo",
        coverPreviewAlt: "Category cover preview",
        linkedProductsSuffix: "products",
      },
      settings: {
        title: "Bilingual Storefront Hero & Delivery Settings (Mart_Settings)",
        subtitle:
          "Manage English & Bengali announcement banners, hero copy, delivery fees, and mobile banking instructions.",
        promoEnLabel: "Top Announcement Banner (English)",
        promoBnLabel: "Top Announcement Banner (Bengali)",
        heroTitleEnLabel: "Hero Headline (English)",
        heroTitleBnLabel: "Hero Headline (Bengali)",
        heroSubtitleEnLabel: "Hero Subtitle (English)",
        heroSubtitleBnLabel: "Hero Subtitle (Bengali)",
        heroCtaEnLabel: "Hero CTA Text (English)",
        heroCtaBnLabel: "Hero CTA Text (Bengali)",
        insideDhakaLabel: "Inside Dhaka Charge (৳)",
        outsideDhakaLabel: "Outside Dhaka Charge (৳)",
        mobileBankingLabel: "Mobile Banking Merchant / Receiver Number (Optional)",
        mobileBankingPlaceholder: "e.g. 017XXXXXXXX (bKash / Nagad Personal or Merchant)",
        savingBtn: "Saving Settings...",
        saveBtn: "Save Bilingual Settings",
        msgSaved: "Bilingual store settings & delivery charges saved to Mart_Settings.",
      },
      customers: {
        title: "Customer CRM & Sales Export",
        subtitle:
          "Unique buyers aggregated from Mart_Orders with lifetime BDT spend and CSV download.",
        downloadCsvBtn: "Download Sales Report (CSV)",
        colCustomer: "Customer",
        colPhone: "Phone",
        colAddress: "Latest Delivery Address",
        colOrders: "Orders",
        colSpend: "Total Spend",
        colHistory: "History",
        emptyCustomers: "No customer records yet. Completed checkout orders appear here.",
        viewOrdersBtn: "View Orders",
        ordersModalCloseAria: "Close customer order history",
      },
      invoice: {
        titlePrefix: "Order Invoice",
        billTo: "Bill / Ship To",
        fulfillmentPayment: "Fulfillment & Payment",
        areaLabel: "Area",
        paymentLabel: "Payment",
        trxIdLabel: "TrxID",
        itemCol: "Item",
        qtyCol: "Qty",
        amountCol: "Amount",
        subtotalLabel: "Subtotal",
        deliveryPrefix: "Delivery",
        totalAmountLabel: "Total Amount",
      },
      csvHeaders: [
        "Order ID",
        "Date",
        "Customer Name",
        "Phone",
        "Delivery Area",
        "Address",
        "Items",
        "Total Items",
        "Subtotal (BDT)",
        "Delivery Charge (BDT)",
        "Total Amount (BDT)",
        "Payment Method",
        "Transaction ID",
        "Notes",
        "Status",
      ],
    },
    errors: {
      BACKEND_UNCONFIGURED:
        "Store service is being configured. Call +880 965 803 6631 or email mart@xeetrix.com for assistance.",
      UNAUTHORIZED: "Unauthorized Store Admin session. Please unlock with your passcode.",
      NOT_FOUND: "No matching record found. Please verify your details and try again.",
      MISSING_FIELDS: "Please fill in all required fields before submitting.",
      GENERIC_NETWORK: "Connection error. Please check your internet and try again.",
      OUT_OF_STOCK: "One or more selected items do not have enough stock available.",
      VARIANT_UNAVAILABLE: "Selected color or size option is currently unavailable.",
      DUPLICATE_SKU:
        "Duplicate SKU conflict! Another product already uses this SKU code. Click Regenerate SKU to assign the next available serial.",
    },
  },
  bn: {
    common: {
      brandPrimary: "জিট্রিক্স",
      brandAccent: "মার্ট",
      brandHomeAria: "জিট্রিক্স মার্ট হোম",
      currencySymbol: "৳",
      helplineLabel: "হেল্পলাইন",
      loading: "লোড হচ্ছে...",
      save: "সেভ করুন",
      cancel: "বাতিল",
      delete: "মুছুন",
      edit: "এডিট",
      add: "যোগ করুন",
      close: "বন্ধ করুন",
      print: "প্রিন্ট",
      reset: "রিসেট",
      search: "খুঁজুন",
      all: "সব",
      active: "সক্রিয়",
      hidden: "লুকানো",
      paused: "স্থগিত",
      featured: "ফিচার্ড",
      sku: "SKU",
      switchToBn: "বাংলা",
      switchToEn: "EN",
      languageSwitcherAria: "ইংরেজি এবং বাংলা ভাষার মধ্যে পরিবর্তন করুন",
      errorFallback: "একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    },
    header: {
      searchPlaceholder: "বাংলা, ইংরেজি বা বাংলিশে খুঁজুন (যেমন: ঘড়ি, watch, ghori)...",
      searchAria: "বাংলা, ইংরেজি বা বাংলিশে স্টোরের পণ্য খুঁজুন",
      allCategoriesOption: "সব ক্যাটাগরি",
      filterCategoryAria: "ক্যাটাগরি অনুযায়ী ফিল্টার করুন",
      trackOrder: "অর্ডার ট্র্যাক",
      cart: "কার্ট",
      cartAriaPrefix: "শপিং কার্ট খুলুন, আইটেম সংখ্যা",
      cartAriaSuffix: "টি",
      menuToggleAria: "স্টোর মেনু খুলুন বা বন্ধ করুন",
      mobileSearchPlaceholder: "পণ্য খুঁজুন (বাংলা / English / Banglish)...",
      skipToContent: "মূল কন্টেন্টে যান",
      voiceSearchAria: "মুখে বলে পণ্য খুঁজুন",
      voiceListening: "শুনছি...",
      recentSearchesTitle: "সাম্প্রতিক সার্চ",
      clearRecentBtn: "মুছুন",
      trendingSearchesTitle: "জনপ্রিয় সার্চ",
      autoCompleteTitle: "সাজেস্টেড শব্দ",
      matchedCategoriesTitle: "মিলে যাওয়া ক্যাটাগরি",
      liveProductsTitle: "তাৎক্ষণিক মিলে যাওয়া পণ্য",
      didYouMeanPrefix: "আপনি কি খুঁজছেন:",
      seeAllResultsPrefix: "সব ফলাফল দেখুন:",
      noInstantMatchHint: "সবচেয়ে কাছাকাছি ও জনপ্রিয় পণ্য দেখানো হচ্ছে",
    },
    footer: {
      description:
        "অথেন্টিক ইলেকট্রনিক্স, নিত্যপ্রয়োজনীয় সামগ্রী এবং যাচাইকৃত লাইফস্টাইল পণ্যের বিশ্বস্ত অনলাইন স্টোর—সারাদেশে দ্রুত ক্যাশ অন ডেলিভারি সুবিধাসহ।",
      customerServiceTitle: "গ্রাহক সেবা",
      browseAllProducts: "সব পণ্য দেখুন",
      trackYourOrder: "অর্ডার ট্র্যাক করুন",
      storeAdminPortal: "স্টোর অ্যাডমিন পোর্টাল",
      supportDeskTitle: "স্টোর সাপোর্ট ডেস্ক",
      address: "ঢাকা, বাংলাদেশ",
      allRightsReserved: "সর্বস্বত্ব সংরক্ষিত।",
      helplineLabel: "গ্রাহক হেল্পলাইন",
    },
    hero: {
      kicker: "জিট্রিক্স মার্ট · অফিসিয়াল অনলাইন স্টোর",
      deliveryCardTitle: "স্বচ্ছ ডেলিভারি চার্জ",
      insideDhakaLabel: "ঢাকা মেট্রোর ভেতরে",
      outsideDhakaLabel: "ঢাকার বাইরে (সারাদেশ)",
      directHelplineLabel: "সরাসরি স্টোর হেল্পলাইন",
      trackExistingOrder: "আগের অর্ডার ট্র্যাক করুন",
    },
    trust: {
      fastDeliveryTitle: "দ্রুত ডেলিভারি",
      fastDeliveryDesc: "ঢাকায় ২৪–৪৮ ঘণ্টায়, সারাদেশে ২–৪ দিনে",
      codTitle: "ক্যাশ অন ডেলিভারি (COD)",
      codDesc: "পণ্য হাতে পেয়ে বা মোবাইল ব্যাংকিংয়ে পেমেন্ট",
      authenticTitle: "১০০% আসল ও যাচাইকৃত পণ্য",
      authenticDesc: "কুরিয়ারের আগে প্রতিটি পণ্যের মান পরীক্ষা",
      easyReturnTitle: "সহজ রিটার্ন নীতি",
      easyReturnDesc: "৭ দিনের ঝামেলামুক্ত রিপ্লেসমেন্ট সুবিধা",
    },
    catalog: {
      categoriesTitle: "ক্যাটাগরি",
      labelsTitle: "কালেকশন ও লেবেল",
      allCategories: "সব ক্যাটাগরি",
      allLabels: "সব কালেকশন",
      clearFilters: "ফিল্টার মুছুন",
      activeFiltersLabel: "সক্রিয় ফিল্টার",
      sortFeatured: "সাজানো: ফিচার্ড",
      sortPriceAsc: "দাম: কম থেকে বেশি",
      sortPriceDesc: "দাম: বেশি থেকে কম",
      sortNewest: "নতুন পণ্য আগে",
      sortAria: "পণ্য সাজানোর ক্রম",
      productSingular: "টি পণ্য",
      productPlural: "টি পণ্য",
      inStockSuffix: "টি স্টকে আছে",
      availableToOrder: "স্টকে উপলব্ধ",
      outOfStock: "স্টক শেষ",
      soldOut: "স্টক আউট",
      optionsPrefix: "অপশন",
      quickViewAria: "দ্রুত দেখুন",
      addToCart: "কার্টে যোগ করুন",
      buyNow: "অর্ডার করুন",
      addedToCartSuffix: "কার্টে যোগ করা হয়েছে",
      viewCart: "কার্ট দেখুন",
      emptyStoreKicker: "স্টোর শীঘ্রই চালু হচ্ছে",
      emptyStoreTitle: "নতুন পণ্য শীঘ্রই যুক্ত হচ্ছে",
      emptyStoreDesc:
        "আমাদের ক্যাটালগে যাচাইকৃত নিত্যপণ্য ও ইলেকট্রনিক্স যুক্ত করা হচ্ছে। অনুগ্রহ করে কিছুক্ষণ পর আবার দেখুন অথবা পাইকারি ও অগ্রিম অর্ডারের জন্য সরাসরি যোগাযোগ করুন।",
      noMatchTitle: "মিলে যায় এমন কোনো পণ্য পাওয়া যায়নি",
      noMatchDesc:
        "সিলেক্ট করা ক্যাটাগরি, লেবেল বা সার্চ কি-ওয়ার্ড পরিবর্তন করে আবার চেষ্টা করুন।",
      resetFiltersBtn: "সব ফিল্টার রিসেট করুন",
      generalFallback: "সাধারণ",
      subcategoriesLabel: "সাব-ক্যাটাগরি",
      allInCategoryBtn: "সব পণ্য",
      didYouMeanBannerPrefix: "আপনি কি খুঁজছিলেন",
      showingClosestMatchesBanner:
        "আপনার লেখা বানানের হুবহু পণ্য পাওয়া যায়নি — নিচে সবচেয়ে কাছাকাছি ও জনপ্রিয় পণ্যগুলো দেখানো হচ্ছে:",
    },
    quickView: {
      closeAria: "প্রোডাক্ট প্রিভিউ বন্ধ করুন",
      availabilityLabel: "স্টকের অবস্থা",
      unitsInStockSuffix: "টি ইউনিট স্টকে রয়েছে",
      availableReady: "স্টকে উপলব্ধ · অর্ডারের জন্য প্রস্তুত",
      outOfStock: "স্টক নেই",
      defaultDesc: "জিট্রিক্স মার্টের যাচাইকৃত পণ্য।",
      selectVariant: "ভ্যারিয়েন্ট / সাইজ নির্বাচন করুন",
      quantity: "পরিমাণ",
      decreaseQtyAria: "পরিমাণ কমান",
      increaseQtyAria: "পরিমাণ বাড়ান",
      addToCart: "কার্টে যোগ করুন",
      buyNow: "অর্ডার করুন",
      soldOut: "স্টক আউট",
      viewFullPageBtn: "সম্পূর্ণ প্রোডাক্ট পেজ দেখুন",
      copyLinkBtn: "পণ্যের লিংক কপি করুন",
      linkCopiedBtn: "লিংক কপি হয়েছে",
      backToStoreBtn: "সকল পণ্যে ফিরে যান",
      specificationsTitle: "পণ্যের বিস্তারিত বিবরণ",
      relatedProductsTitle: "সম্পর্কিত অন্যান্য পণ্য",
      relatedProductsSubtitle: "একই ক্যাটাগরির আরও যাচাইকৃত পণ্য দেখুন",
      productNotFoundTitle: "পণ্যটি খুঁজে পাওয়া যায়নি",
      productNotFoundDesc:
        "আপনি যে পণ্যের লিংকে প্রবেশ করেছেন সেটি সম্ভবত পরিবর্তন করা হয়েছে বা বর্তমানে স্টকে নেই। নিচের ক্যাটালগ থেকে অন্যান্য পণ্য দেখুন।",
      saveAmountPrefix: "সাশ্রয়",
    },
    cart: {
      drawerTitle: "শপিং কার্ট",
      invoiceTitle: "অর্ডার ইনভয়েস",
      invoiceRefPrefix: "রেফারেন্স",
      drawerSubtitle: "আইটেম যাচাই করুন এবং ডেলিভারি চেকআউট সম্পন্ন করুন",
      closeAria: "কার্ট ড্রয়ার বন্ধ করুন",
      orderSuccessTitle: "অর্ডার সফলভাবে সম্পন্ন হয়েছে",
      orderSuccessDesc:
        "যেকোনো সময় অর্ডারের লাইভ অবস্থা জানতে নিচের অর্ডার আইডি সংরক্ষণ করুন।",
      invoiceHeader: "জিট্রিক্স মার্ট ইনভয়েস",
      orderIdLabel: "অর্ডার আইডি",
      deliveryPrefix: "ডেলিভারি",
      paymentPrefix: "পেমেন্ট",
      trxIdPrefix: "TrxID",
      itemCol: "পণ্য",
      qtyCol: "পরিমাণ",
      amountCol: "মোট মূল্য",
      subtotal: "সাবটোটাল",
      deliveryFee: "ডেলিভারি চার্জ",
      totalPayable: "সর্বমোট প্রদেয়",
      printInvoice: "ইনভয়েস প্রিন্ট করুন",
      continueShopping: "কেনাকাটা চালিয়ে যান",
      emptyTitle: "আপনার কার্ট এখন খালি",
      emptyDesc: "চেকআউট করতে স্টোর ক্যাটালগ থেকে পণ্য কার্টে যোগ করুন।",
      browseProducts: "পণ্য দেখুন",
      deliveryZone: "ডেলিভারি এলাকা",
      insideDhaka: "ঢাকার ভেতরে",
      outsideDhaka: "ঢাকার বাইরে",
      removeItemAria: "আইটেম বাদ দিন",
      customerDetailsTitle: "ক্রেতা ও ডেলিভারির তথ্য",
      fullNameLabel: "পূর্ণ নাম *",
      fullNamePlaceholder: "আপনার পুরো নাম লিখুন",
      phoneLabel: "মোবাইল নম্বর *",
      phonePlaceholder: "01XXXXXXXXX",
      addressLabel: "সম্পূর্ণ ডেলিভারি ঠিকানা *",
      addressPlaceholder: "বাসা, রোড, এলাকা, থানা, জেলা",
      paymentMethodLabel: "পেমেন্ট মাধ্যম",
      codOption: "ক্যাশ অন ডেলিভারি",
      mobileBankingOption: "মোবাইল ব্যাংকিং",
      providerLabel: "মোবাইল ব্যাংকিং মাধ্যম",
      sendMoneyPrefix: "পেমেন্ট পাঠান এই নম্বরে:",
      trxIdLabel: "ট্রানজেকশন আইডি (ঐচ্ছিক)",
      trxIdPlaceholder: "আগে পেমেন্ট করে থাকলে TrxID লিখুন",
      notesLabel: "ডেলিভারি নির্দেশনা (ঐচ্ছিক)",
      notesPlaceholder: "পছন্দের সময় বা নিকটস্থ পরিচিত স্থান",
      grandTotal: "সর্বমোট",
      submittingOrder: "অর্ডার নিশ্চিত হচ্ছে...",
      confirmOrder: "অর্ডার কনফার্ম করুন",
      errEmptyCart: "আপনার শপিং কার্ট খালি রয়েছে।",
      errMissingDetails: "অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং ডেলিভারি ঠিকানা লিখুন।",
      errOrderFailed:
        "অর্ডার সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন অথবা +880 965 803 6631 নম্বরে কল করুন।",
      cartItemUnavailable: "বর্তমানে স্টক নেই বা সাময়িকভাবে বন্ধ — অনুগ্রহ করে বাদ দিন বা পরিমাণ কমান।",
      cartUnavailableCheckoutErr:
        "আপনার কার্টের এক বা একাধিক পণ্য বর্তমানে উপলব্ধ নয়। অর্ডার করতে অনুগ্রহ করে সেগুলো বাদ দিন।",
      stepBagLabel: "১. কার্ট ও এলাকা",
      stepCheckoutLabel: "২. ঠিকানা ও পেমেন্ট",
      continueCheckoutBtn: "চেকআউটে এগিয়ে যান",
      backToBagBtn: "কার্টে ফিরুন",
      savedAddressHint: "আগের সংরক্ষিত ঠিকানা অটো-ফিল হয়েছে",
      clearSavedAddressBtn: "তথ্য মুছুন",
      changeVariantLabel: "ভ্যারিয়েন্ট",
      changeColorLabel: "কালার",
      changeSizeLabel: "সাইজ",
    },
    track: {
      modalTitle: "অর্ডার ট্র্যাক করুন",
      modalSubtitle: "অর্ডার করার সময় ব্যবহৃত অর্ডার আইডি ও ফোন নম্বর দিন",
      closeAria: "অর্ডার ট্র্যাকার বন্ধ করুন",
      orderIdLabel: "অর্ডার আইডি *",
      orderIdPlaceholder: "যেমন: XM-10248",
      phoneLabel: "মোবাইল নম্বর *",
      phonePlaceholder: "01XXXXXXXXX",
      searching: "খোঁজা হচ্ছে...",
      checkStatus: "লাইভ স্ট্যাটাস দেখুন",
      orderDateLabel: "অর্ডারের তারিখ",
      cancelledAlert:
        "এই অর্ডারটি বাতিল করা হয়েছে। সহায়তার জন্য +880 965 803 6631 নম্বরে কল করুন।",
      orderedItemsTitle: "অর্ডারকৃত পণ্যসমূহ",
      totalPayableLabel: "সর্বমোট প্রদেয়",
      errMissingFields: "অনুগ্রহ করে অর্ডার আইডি এবং মোবাইল নম্বর দুটিই লিখুন।",
      errNotFound: "এই মুহূর্তে অর্ডারের তথ্য পাওয়া যায়নি।",
    },
    orderStatuses: {
      Pending: "অপেক্ষমাণ",
      Confirmed: "নিশ্চিত",
      Packaging: "প্যাকেজিং চলছে",
      Shipped: "কুরিয়ারে পাঠানো হয়েছে",
      Delivered: "ডেলিভারড",
      Cancelled: "বাতিল",
    },
    admin: {
      initializing: "জিট্রিক্স মার্ট অ্যাডমিন লোড হচ্ছে...",
      portalTitle: "স্টোর অ্যাডমিন কনসোল",
      portalSubtitle:
        "দ্বিভাষিক পণ্য, মাল্টি-ক্যাটাগরি, লেবেল, অর্ডার, ডেলিভারি চার্জ ও কাস্টমার রিপোর্ট পরিচালনা করতে লগইন করুন।",
      passcodeLabel: "অ্যাডমিন পাসকোড",
      passcodePlaceholder: "স্টোর পাসকোড লিখুন",
      showPasscodeAria: "পাসকোড দেখান",
      hidePasscodeAria: "পাসকোড লুকান",
      verifying: "পাসকোড যাচাই হচ্ছে...",
      unlockBtn: "অ্যাডমিন আনলক করুন",
      backToStore: "স্টোরে ফিরে যান",
      independentPortal: "স্বতন্ত্র মার্ট পোর্টাল",
      invalidPasscode: "ভুল মার্ট অ্যাডমিন পাসকোড। অনুগ্রহ করে আবার চেষ্টা করুন।",
      sessionExpired:
        "আপনার অ্যাডমিন সেশন শেষ হয়েছে বা পাসকোড পরিবর্তিত হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।",
      exitBtn: "প্রস্থান",
      viewStoreBtn: "স্টোর দেখুন",
      logoutBtn: "লগআউট",
      sheetStatusLabel: "স্টোর শিট",
      connectedLive: "লাইভ সংযুক্ত",
      notConnected: "সংযুক্ত নয়",
      breadcrumbRoot: "জিট্রিক্স মার্ট অ্যাডমিন",
      exportCsv: "CSV এক্সপোর্ট",
      syncing: "সিঙ্ক হচ্ছে...",
      refreshStore: "স্টোর রিফ্রেশ",
      dismiss: "বন্ধ করুন",
      setupAlertTitle: "ব্যাকএন্ড সেটআপ প্রয়োজন:",
      setupAlertBody:
        "আপনার Google Sheet-এ backend/mart/Code.gs ডিপ্লয় করে setupMartBackend রান করুন এবং Vercel Environment Variables-এ MART_SCRIPT_URL যুক্ত করুন যাতে পণ্য, ক্যাটাগরি, লেবেল, অর্ডার ও Drive ছবি লাইভ সিঙ্ক হয়।",
      openMenuAria: "অ্যাডমিন মেনু খুলুন",
      closeMenuAria: "অ্যাডমিন মেনু বন্ধ করুন",
      navGroups: {
        operations: "অপারেশন",
        catalog: "ক্যাটালগ ও অফার",
        financeCrm: "হিসাব ও সিআরএম",
        system: "কনফিগারেশন",
      },
      nav: {
        analytics: "ড্যাশবোর্ড ও ফলোআপ",
        orders: "অর্ডার ও ফুলফিলমেন্ট",
        products: "পণ্য ও সোর্সিং",
        taxonomy: "ক্যাটাগরি ও লেবেল",
        coupons: "কুপন ও প্রমো কোড",
        suppliers: "সাপ্লাইয়ার ও ড্রপশিপ",
        accounts: "হিসাব-নিকাশ ও P&L",
        customers: "ক্লায়েন্ট CRM ও ঝুঁকি",
        settings: "স্টোর সেটিংস",
      },
      analytics: {
        totalRevenue: "মোট বিক্রি (সক্রিয়)",
        validOrdersPrefix: "মোট",
        validOrdersSuffix: "টি বৈধ অর্ডার থেকে",
        todaysOrders: "আজকের অর্ডার",
        allTimeOrdersSuffix: "টি সর্বমোট অর্ডার রেকর্ড",
        pendingActive: "অপেক্ষমাণ ও চলমান",
        pendingActiveDesc: "অপেক্ষমাণ, নিশ্চিত ও প্যাকেজিং",
        deliveredOrders: "ডেলিভার সম্পন্ন",
        catalogSkusSuffix: "টি পণ্য SKU",
        categoriesSuffix: "টি ক্যাটাগরি",
        labelsSuffix: "টি লেবেল",
        fulfillmentOverview: "অর্ডার ডেলিভারি সারসংক্ষেপ",
        lowStockTitle: "কম স্টক সতর্কতা (≤ ৫টি)",
        manageInventory: "ইনভেন্টরি দেখুন",
        noProductsLowStock:
          "এখনো কোনো পণ্য যোগ করা হয়নি। প্রথম পণ্য যোগ করতে 'পণ্য ও ইনভেন্টরি' ট্যাবে যান।",
        allStockHealthy: "সব পণ্যের স্টক পর্যাপ্ত রয়েছে।",
        leftSuffix: "টি বাকি",
        addFiveStock: "+৫ স্টক",
      },
      orders: {
        allFilter: "সব",
        searchPlaceholder: "অর্ডার আইডি, ক্রেতা, ফোন দিয়ে খুঁজুন...",
        colOrderDate: "অর্ডার আইডি ও তারিখ",
        colCustomerDelivery: "ক্রেতা ও ডেলিভারি",
        colOrderedItems: "অর্ডারকৃত পণ্য",
        colPayment: "পেমেন্ট",
        colTotal: "মোট",
        colStatus: "অবস্থা",
        colInvoice: "ইনভয়েস",
        emptyOrders: "ফিল্টারের সাথে মিলে এমন কোনো অর্ডার নেই। /mart থেকে অর্ডার হলে এখানে দেখাবে।",
        deliveryPrefix: "ডেলিভারি",
        notePrefix: "নোট",
        trxPrefix: "TrxID",
        invoiceBtn: "ইনভয়েস",
        editOrderBtn: "এডিট",
        deleteOrderBtn: "মুছুন",
        deleteOrderConfirm: "নিশ্চিত মুছবেন?",
        editOrderTitle: "অর্ডারের তথ্য এডিট করুন",
        orderCustomerNameLabel: "ক্রেতার নাম *",
        orderPhoneLabel: "মোবাইল নম্বর *",
        orderAreaLabel: "ডেলিভারি এলাকা",
        orderDeliveryChargeLabel: "ডেলিভারি চার্জ (৳)",
        orderDiscountCodeLabel: "কুপন / প্রমো কোড",
        orderDiscountAmountLabel: "ডিসকাউন্ট পরিমাণ (৳)",
        orderAddressLabel: "ডেলিভারি ঠিকানা *",
        orderPaymentMethodLabel: "পেমেন্ট মাধ্যম",
        orderPaymentProviderLabel: "পেমেন্ট প্রোভাইডার",
        orderTrxIdLabel: "ট্রানজেকশন আইডি (TrxID)",
        orderNotesLabel: "অর্ডার নোট",
        recalculatedTotalLabel: "সমন্বিত সর্বমোট",
        saveOrderBtn: "অর্ডার আপডেট করুন",
        savingOrderBtn: "সেভ হচ্ছে...",
        orderUpdatedMsg: "অর্ডার স্ট্যাটাস আপডেট করা হয়েছে।",
        msgOrderDetailsUpdated: "অর্ডারের তথ্য Mart_Orders-এ আপডেট হয়েছে।",
        msgOrderDeleted: "অর্ডার মুছে ফেলা হয়েছে এবং সক্রিয় নিজস্ব স্টক ফেরত যুক্ত হয়েছে।",
        errOrderUpdate: "অর্ডার স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।",
        errOrderCustomerReq: "ক্রেতার নাম, মোবাইল নম্বর এবং ঠিকানা আবশ্যক।",
      },
      products: {
        addTitle: "নতুন পণ্য যোগ করুন (Mart_Products)",
        editTitle: "পণ্য এডিট করুন",
        cancelEdit: "এডিট বাতিল",
        editingBannerHint: "ক্যাটালগের একটি বিদ্যমান পণ্য এডিট করা হচ্ছে — সেভ করলে স্টোরফ্রন্টে আপডেট হবে।",
        variantStockLockedNote: "কালার × সাইজ ম্যাট্রিক্সের সক্রিয় ঘর থেকে স্বয়ংক্রিয় যোগফল",
        duplicateBtn: "ডুপ্লিকেট",
        nameEnLabel: "পণ্যের নাম (ইংরেজি) *",
        nameEnPlaceholder: "যেমন: Kids Fleece Hoodie",
        nameBnLabel: "পণ্যের নাম (বাংলা)",
        nameBnPlaceholder: "যেমন: ছোটদের শীতের হুডি",
        skuLabel: "SKU কোড",
        skuPlaceholder: "যেমন: XM-KID-001",
        stockLabel: "স্টক পরিমাণ *",
        priceLabel: "বিক্রয় মূল্য / ডিসকাউন্ট মূল্য (৳) *",
        comparePriceLabel: "নিয়মিত মূল্য (৳)",
        variantsEnLabel: "ভ্যারিয়েন্ট / সাইজ (ইংরেজি, কমা দিয়ে আলাদা)",
        variantsEnPlaceholder: "যেমন: Navy Blue, Red অথবা 2-3Y, 4-5Y",
        variantsBnLabel: "ভ্যারিয়েন্ট / সাইজ (বাংলা, কমা দিয়ে আলাদা)",
        variantsBnPlaceholder: "যেমন: নেভি ব্লু, লাল অথবা ২-৩ বছর, ৪-৫ বছর",
        categoriesLabel: "ক্যাটাগরি নির্বাচন করুন (একাধিক সম্ভব) *",
        categoriesHint: "একসাথে সব প্রযোজ্য ক্যাটাগরিতে টিক দিন (যেমন: বেবি + পোশাক)",
        noCategoriesHint: "কোনো ক্যাটাগরি তৈরি করা হয়নি। আগে 'ক্যাটাগরি ও লেবেল' ট্যাব থেকে যোগ করুন।",
        labelsLabel: "লেবেল / কালেকশন নির্বাচন করুন (একাধিক সম্ভব)",
        labelsHint: "মৌসুমি বা প্রমোশনাল কালেকশনে টিক দিন (যেমন: উইন্টার কালেকশন)",
        noLabelsHint: "কোনো লেবেল তৈরি করা হয়নি। 'ক্যাটাগরি ও লেবেল' ট্যাব থেকে তৈরি করুন।",
        goToTaxonomyBtn: "ক্যাটাগরি ও লেবেল ম্যানেজ করুন",
        imageUrlLabel: "পণ্যের ছবির লিংক (Drive-এ আপলোড করলে অটো যুক্ত হবে)",
        uploadToDrive: "Drive-এ ছবি আপলোড",
        uploading: "Drive-এ আপলোড হচ্ছে...",
        descEnLabel: "পণ্যের বিবরণ (ইংরেজি)",
        descEnPlaceholder: "বিস্তারিত তথ্য, উপাদান, ওয়ারেন্টি...",
        descBnLabel: "পণ্যের বিবরণ (বাংলা)",
        descBnPlaceholder: "বিস্তারিত তথ্য, কাপড়ের মান, ওয়ারেন্টি...",
        visibleCheckbox: "স্টোরফ্রন্টে দৃশ্যমান",
        featuredCheckbox: "ফিচার্ড পণ্য",
        savingProduct: "পণ্য সেভ হচ্ছে...",
        saveChangesBtn: "পরিবর্তন সেভ করুন",
        publishProductBtn: "পণ্য প্রকাশ করুন",
        catalogTableTitle: "ইনভেন্টরি ক্যাটালগ",
        filterPlaceholder: "SKU, নাম, ক্যাটাগরি বা লেবেল খুঁজুন...",
        colProductSku: "পণ্য ও SKU",
        colTaxonomy: "ক্যাটাগরি ও লেবেল",
        colPrice: "মূল্য",
        colStock: "স্টক",
        colFlags: "স্ট্যাটাস",
        colActions: "অ্যাকশন",
        emptyProducts: "এখনো কোনো পণ্য যুক্ত করা হয়নি। উপরের ফর্ম থেকে প্রথম পণ্য প্রকাশ করুন।",
        activeFlag: "সক্রিয়",
        pausedFlag: "স্থগিত",
        featuredTitle: "ফিচার্ড পরিবর্তন",
        editBtn: "এডিট",
        deleteBtn: "মুছুন",
        errMissingProdFields: "পণ্যের ইংরেজি বা বাংলা নাম এবং বিক্রয় মূল্য আবশ্যক।",
        errConnectBackend: "পণ্য সেভ করতে আগে Google Apps Script URL সংযুক্ত করুন।",
        msgSaved: "পণ্য Mart_Products-এ আপডেট করা হয়েছে।",
        msgCreated: "নতুন পণ্য Mart_Products-এ প্রকাশিত হয়েছে।",
        msgDeleted: "পণ্যটি Mart_Products থেকে মুছে ফেলা হয়েছে।",
        msgImageUploaded: "ছবি Google Drive-এ আপলোড হয়েছে।",
        msgFlagUpdated: "পণ্যের স্ট্যাটাস আপডেট করা হয়েছে।",
        copyLinkBtn: "লিংক কপি",
        linkCopiedMsg: "পণ্যের মার্কেটিং লিংক কপি করা হয়েছে।",
      },
      taxonomy: {
        catAddTitle: "নতুন ক্যাটাগরি তৈরি (Mart_Categories)",
        catEditTitle: "ক্যাটাগরি এডিট করুন",
        catSlugLabel: "URL স্লাগ (যুক্ত পণ্যে অটো সিঙ্ক হয়)",
        catSlugPlaceholder: "যেমন: baby-clothing",
        slugCascadeNote: "স্লাগ পরিবর্তন করলে সব যুক্ত পণ্যের ক্যাটাগরি ও লেবেল স্বয়ংক্রিয়ভাবে আপডেট হবে।",
        catNameEnLabel: "ক্যাটাগরির নাম (ইংরেজি) *",
        catNameEnPlaceholder: "যেমন: Baby, Clothing, Electronics",
        catNameBnLabel: "ক্যাটাগরির নাম (বাংলা)",
        catNameBnPlaceholder: "যেমন: বেবি, পোশাক, ইলেকট্রনিক্স",
        catParentLabel: "মূল / প্যারেন্ট ক্যাটাগরি (ঐচ্ছিক)",
        catParentNone: "নেই (মূল ক্যাটাগরি)",
        catSortOrderLabel: "সাজানোর ক্রম",
        catDescEnLabel: "সংক্ষিপ্ত বিবরণ (ইংরেজি)",
        catDescEnPlaceholder: "ক্যাটাগরি সাবটাইটেল",
        catDescBnLabel: "সংক্ষিপ্ত বিবরণ (বাংলা)",
        catDescBnPlaceholder: "ক্যাটাগরির সংক্ষিপ্ত পরিচয়",
        catImageLabel: "ক্যাটাগরি ছবির লিংক (Drive-এ আপলোড করলে অটো যুক্ত হবে)",
        driveUploadBtn: "Drive আপলোড",
        uploadingBtn: "আপলোড হচ্ছে...",
        catCreateBtn: "ক্যাটাগরি তৈরি করুন",
        catCreatingBtn: "তৈরি হচ্ছে...",
        catSaveBtn: "ক্যাটাগরি আপডেট করুন",
        catSavingBtn: "আপডেট হচ্ছে...",
        catListTitle: "ক্যাটাগরি তালিকা",
        catEmpty: "এখনো কোনো ক্যাটাগরি তৈরি করা হয়নি।",
        catParentPrefix: "মূল:",
        catVisible: "সক্রিয়",
        catHidden: "লুকানো",
        lblAddTitle: "নতুন লেবেল / কালেকশন তৈরি (Mart_Labels)",
        lblEditTitle: "লেবেল / কালেকশন এডিট করুন",
        lblSlugLabel: "URL স্লাগ (যুক্ত পণ্যে অটো সিঙ্ক হয়)",
        lblSlugPlaceholder: "যেমন: winter-collection",
        lblNameEnLabel: "লেবেল / কালেকশনের নাম (ইংরেজি) *",
        lblNameEnPlaceholder: "যেমন: Winter Collection, New Arrival, Hot Deal",
        lblNameBnLabel: "লেবেল / কালেকশনের নাম (বাংলা)",
        lblNameBnPlaceholder: "যেমন: উইন্টার কালেকশন, নতুন আগমন, হট ডিল",
        lblToneLabel: "হাইলাইট রঙের ধরন",
        lblToneEmerald: "এমারেল্ড (সিজনাল / প্রাইমারি)",
        lblToneGold: "ওয়ার্ম গোল্ড (প্রমো / বিশেষ ডিল)",
        lblToneSlate: "স্লেট (সাধারণ / মিনিমাল)",
        lblSortOrderLabel: "সাজানোর ক্রম",
        lblDescEnLabel: "সংক্ষিপ্ত বিবরণ (ইংরেজি)",
        lblDescEnPlaceholder: "ঐচ্ছিক কালেকশন পরিচিতি",
        lblDescBnLabel: "সংক্ষিপ্ত বিবরণ (বাংলা)",
        lblDescBnPlaceholder: "ঐচ্ছিক কালেকশন বিবরণ",
        lblCreateBtn: "লেবেল তৈরি করুন",
        lblCreatingBtn: "তৈরি হচ্ছে...",
        lblSaveBtn: "লেবেল আপডেট করুন",
        lblSavingBtn: "আপডেট হচ্ছে...",
        lblListTitle: "লেবেল ও কালেকশন তালিকা",
        lblEmpty: "এখনো কোনো লেবেল বা কালেকশন তৈরি করা হয়নি।",
        errCatNameReq: "ক্যাটাগরির ইংরেজি বা বাংলা নাম দেওয়া আবশ্যক।",
        errLblNameReq: "লেবেলের ইংরেজি বা বাংলা নাম দেওয়া আবশ্যক।",
        errDuplicateSlug: "এই স্লাগটি ইতিমধ্যেই অন্য একটি আইটেমে ব্যবহৃত হচ্ছে।",
        msgCatCreated: "ক্যাটাগরি Mart_Categories-এ সেভ হয়েছে।",
        msgCatUpdated: "ক্যাটাগরি আপডেট হয়েছে এবং যুক্ত পণ্য সিঙ্ক হয়েছে।",
        msgCatDeleted: "ক্যাটাগরি মুছে ফেলা হয়েছে।",
        msgCatImageUploaded: "ক্যাটাগরি ছবি Google Drive-এ সেভ হয়েছে।",
        msgLblCreated: "লেবেল Mart_Labels-এ সেভ হয়েছে।",
        msgLblUpdated: "লেবেল আপডেট হয়েছে এবং যুক্ত পণ্য সিঙ্ক হয়েছে।",
        msgLblDeleted: "লেবেল মুছে ফেলা হয়েছে।",
        removeImageBtn: "ছবি সরান",
        coverPreviewAlt: "ক্যাটাগরি কভার প্রিভিউ",
        linkedProductsSuffix: "টি পণ্য",
      },
      settings: {
        title: "দ্বিভাষিক স্টোরফ্রন্ট হিরো ও ডেলিভারি সেটিংস (Mart_Settings)",
        subtitle:
          "ইংরেজি ও বাংলা ভাষায় অ্যানাউন্সমেন্ট ব্যানার, হিরো টেক্সট, ডেলিভারি চার্জ ও মোবাইল ব্যাংকিং নম্বর পরিবর্তন করুন।",
        promoEnLabel: "শীর্ষ অ্যানাউন্সমেন্ট ব্যানার (ইংরেজি)",
        promoBnLabel: "শীর্ষ অ্যানাউন্সমেন্ট ব্যানার (বাংলা)",
        heroTitleEnLabel: "হিরো শিরোনাম (ইংরেজি)",
        heroTitleBnLabel: "হিরো শিরোনাম (বাংলা)",
        heroSubtitleEnLabel: "হিরো সাবটাইটেল (ইংরেজি)",
        heroSubtitleBnLabel: "হিরো সাবটাইটেল (বাংলা)",
        heroCtaEnLabel: "হিরো বাটন টেক্সট (ইংরেজি)",
        heroCtaBnLabel: "হিরো বাটন টেক্সট (বাংলা)",
        insideDhakaLabel: "ঢাকার ভেতরে ডেলিভারি চার্জ (৳)",
        outsideDhakaLabel: "ঢাকার বাইরে ডেলিভারি চার্জ (৳)",
        mobileBankingLabel: "মোবাইল ব্যাংকিং মার্চেন্ট / রিসিভার নম্বর (ঐচ্ছিক)",
        mobileBankingPlaceholder: "যেমন: 017XXXXXXXX (বিকাশ / নগদ পার্সোনাল বা মার্চেন্ট)",
        savingBtn: "সেটিংস সেভ হচ্ছে...",
        saveBtn: "দ্বিভাষিক সেটিংস সেভ করুন",
        msgSaved: "বাংলা ও ইংরেজি স্টোর সেটিংস এবং ডেলিভারি চার্জ সেভ হয়েছে।",
      },
      customers: {
        title: "ক্রেতা CRM ও সেলস রিপোর্ট এক্সপোর্ট",
        subtitle:
          "Mart_Orders থেকে সংগৃহীত প্রতিটি ক্রেতার মোট খরচ ও অর্ডার ইতিহাস দেখুন এবং CSV ডাউনলোড করুন।",
        downloadCsvBtn: "সেলস রিপোর্ট ডাউনলোড (CSV)",
        colCustomer: "ক্রেতা",
        colPhone: "মোবাইল",
        colAddress: "সর্বশেষ ডেলিভারি ঠিকানা",
        colOrders: "অর্ডার সংখ্যা",
        colSpend: "মোট খরচ",
        colHistory: "ইতিহাস",
        emptyCustomers: "এখনো কোনো ক্রেতার তথ্য নেই। চেকআউট অর্ডার সম্পন্ন হলে এখানে দেখাবে।",
        viewOrdersBtn: "অর্ডার দেখুন",
        ordersModalCloseAria: "ক্রেতার অর্ডার ইতিহাস বন্ধ করুন",
      },
      invoice: {
        titlePrefix: "অর্ডার ইনভয়েস",
        billTo: "বিল / ডেলিভারি প্রাপক",
        fulfillmentPayment: "ডেলিভারি ও পেমেন্ট তথ্য",
        areaLabel: "এলাকা",
        paymentLabel: "পেমেন্ট",
        trxIdLabel: "TrxID",
        itemCol: "পণ্য",
        qtyCol: "পরিমাণ",
        amountCol: "মূল্য",
        subtotalLabel: "সাবটোটাল",
        deliveryPrefix: "ডেলিভারি",
        totalAmountLabel: "সর্বমোট মূল্য",
      },
      csvHeaders: [
        "অর্ডার আইডি",
        "তারিখ",
        "ক্রেতার নাম",
        "মোবাইল নম্বর",
        "ডেলিভারি এলাকা",
        "ঠিকানা",
        "পণ্যসমূহ",
        "মোট আইটেম",
        "সাবটোটাল (৳)",
        "ডেলিভারি চার্জ (৳)",
        "সর্বমোট (৳)",
        "পেমেন্ট মাধ্যম",
        "ট্রানজেকশন আইডি",
        "নোট",
        "অবস্থা",
      ],
    },
    errors: {
      BACKEND_UNCONFIGURED:
        "স্টোর সার্ভিস সংযুক্ত করা হচ্ছে। অর্ডার বা সহায়তার জন্য +880 965 803 6631 নম্বরে কল করুন অথবা mart@xeetrix.com-এ ইমেইল করুন।",
      UNAUTHORIZED: "অননুমোদিত অ্যাডমিন সেশন। অনুগ্রহ করে সঠিক পাসকোড দিয়ে আনলক করুন।",
      NOT_FOUND: "কোনো তথ্য খুঁজে পাওয়া যায়নি। অনুগ্রহ করে অর্ডার আইডি ও ফোন নম্বর যাচাই করুন।",
      MISSING_FIELDS: "অনুগ্রহ করে সব আবশ্যক তথ্য পূরণ করুন।",
      GENERIC_NETWORK: "নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      OUT_OF_STOCK: "নির্বাচিত এক বা একাধিক পণ্যের পর্যাপ্ত স্টক বর্তমানে নেই।",
      VARIANT_UNAVAILABLE: "নির্বাচিত কালার বা সাইজ অপশনটি বর্তমানে উপলব্ধ নয়।",
      DUPLICATE_SKU:
        "ডুপ্লিকেট SKU কনফ্লিক্ট! এই SKU কোডটি ইতিমধ্যে অন্য একটি প্রোডাক্টে ব্যবহৃত হয়েছে। পরবর্তী সিরিয়াল পেতে Regenerate SKU বাটনে ক্লিক করুন।",
    },
  },
};

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toLocalizedDigits(input: string | number, lang: MartLang): string {
  const str = String(input);
  if (lang !== "bn") return str;
  return str.replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

export function formatMartPrice(amount: number, lang: MartLang): string {
  const formatted = new Intl.NumberFormat("en-US").format(Math.round(Number(amount) || 0));
  return `${MART_DICTIONARY[lang].common.currencySymbol}${toLocalizedDigits(formatted, lang)}`;
}

export function formatMartDate(iso?: string, lang: MartLang = "en"): string {
  if (!iso) return "";
  try {
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return iso;
    return dt.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function formatMartDateTime(iso?: string, lang: MartLang = "en"): string {
  if (!iso) return "";
  try {
    const dt = new Date(iso);
    if (isNaN(dt.getTime())) return iso;
    return dt.toLocaleString(lang === "bn" ? "bn-BD" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function pickLocalized(
  enVal?: string,
  bnVal?: string,
  lang: MartLang = "en",
  fallback = ""
): string {
  const cleanEn = (enVal || "").trim();
  const cleanBn = (bnVal || "").trim();
  if (lang === "bn") {
    return cleanBn || cleanEn || fallback;
  }
  return cleanEn || cleanBn || fallback;
}

export function parseCsvSlugs(val?: string): string[] {
  if (!val) return [];
  const list = val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(list));
}

export function slugifyTaxonomy(text: string): string {
  const ascii = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (ascii) return ascii;
  return `tax-${Date.now().toString(36)}`;
}

export function translateMartError(
  rawMessage: string | undefined,
  lang: MartLang,
  code?: string,
  contact?: { hotlinePhone?: string; supportEmail?: string }
): string {
  const applyContact = (text: string): string => {
    let out = text;
    if (contact?.hotlinePhone?.trim()) {
      out = out.replace(/\+880\s*965\s*803\s*6631/g, contact.hotlinePhone.trim());
    }
    if (contact?.supportEmail?.trim()) {
      out = out.replace(/mart@xeetrix\.com/gi, contact.supportEmail.trim());
    }
    return out;
  };

  const dict = MART_DICTIONARY[lang].errors;
  if (code && code in dict) {
    return applyContact(dict[code as keyof typeof dict]);
  }
  const msg = (rawMessage || "").toLowerCase();
  if (!msg) return MART_DICTIONARY[lang].common.errorFallback;
  if (msg.includes("mart_backend_not_configured") || msg.includes("being connected") || msg.includes("not configured")) {
    return applyContact(dict.BACKEND_UNCONFIGURED);
  }
  if (msg.includes("unauthorized") || msg.includes("passcode")) {
    return dict.UNAUTHORIZED;
  }
  if (msg.includes("no matching order") || msg.includes("not found")) {
    return dict.NOT_FOUND;
  }
  if (msg.includes("required")) {
    return dict.MISSING_FIELDS;
  }
  if (msg.includes("out_of_stock") || msg.includes("insufficient stock") || msg.includes("out of stock")) {
    return dict.OUT_OF_STOCK;
  }
  if (msg.includes("variant_unavailable") || msg.includes("variant unavailable") || msg.includes("no longer available")) {
    return dict.VARIANT_UNAVAILABLE;
  }
  if (msg.includes("duplicate_sku") || msg.includes("duplicate sku")) {
    return dict.DUPLICATE_SKU;
  }
  return applyContact(rawMessage || MART_DICTIONARY[lang].common.errorFallback);
}
