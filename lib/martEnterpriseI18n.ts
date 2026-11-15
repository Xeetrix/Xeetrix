// Bilingual Dictionary (EN & BN) for Xeetrix Mart Sourcing, Accounting & Full CRM Modules
// TypeScript enforces 100% key parity across both languages with zero hardcoded UI strings.

import { MartLang } from "./martI18n";

export interface MartEnterpriseDictionary {
  sourcing: {
    sectionTitle: string;
    fulfillmentModeLabel: string;
    ownStockMode: string;
    ownStockHint: string;
    dropshipMode: string;
    dropshipHint: string;
    supplierLabel: string;
    noSupplierOption: string;
    sourceNameLabel: string;
    sourceNamePlaceholder: string;
    costPriceLabel: string;
    marginPreviewLabel: string;
    unitProfitLabel: string;
    collectionModeLabel: string;
    storeCollectsOption: string;
    supplierCollectsOption: string;
    supplierAvailableCheckbox: string;
    lowStockThresholdLabel: string;
    unlimitedLabel: string;
    availableStatus: string;
    pausedStatus: string;
    colSourcing: string;
    colCostMargin: string;
  };
  orderItems: {
    fulfillmentPanelBtn: string;
    hidePanelBtn: string;
    itemSourceLabel: string;
    supplierCol: string;
    collectionCol: string;
    costProfitCol: string;
    itemStatusCol: string;
    orderPnlSummary: string;
    orderSalesLabel: string;
    orderCostLabel: string;
    orderProfitLabel: string;
    highRiskWarning: string;
    blockedWarning: string;
    vipCustomerTag: string;
    regularCustomerTag: string;
    newCustomerTag: string;
    statusUpdatedMsg: string;
    itemStatuses: {
      Pending: string;
      "Forwarded to Supplier": string;
      Packaging: string;
      Shipped: string;
      Delivered: string;
      Returned: string;
      Cancelled: string;
    };
  };
  suppliers: {
    title: string;
    subtitle: string;
    addTitle: string;
    editTitle: string;
    cancelEdit: string;
    nameLabel: string;
    namePlaceholder: string;
    companyTypeLabel: string;
    types: {
      dropship: string;
      wholesale: string;
      manufacturer: string;
    };
    contactPersonLabel: string;
    contactPersonPlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    altPhoneLabel: string;
    emailLabel: string;
    addressLabel: string;
    payoutModeLabel: string;
    payoutModes: {
      we_pay_supplier: string;
      supplier_pays_us: string;
    };
    leadTimeLabel: string;
    tagsLabel: string;
    tagsPlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    nextFollowUpLabel: string;
    activeCheckbox: string;
    saveBtn: string;
    createBtn: string;
    savingBtn: string;
    searchPlaceholder: string;
    emptyTitle: string;
    colSupplier: string;
    colTypeTerms: string;
    colSlaStats: string;
    colPayableDue: string;
    colReceivableDue: string;
    colActions: string;
    productsCountSuffix: string;
    deliveryRateLabel: string;
    returnRateLabel: string;
    paySupplierBtn: string;
    receiveDropshipBtn: string;
    openCrmBtn: string;
    settledLabel: string;
    settlementModalTitlePay: string;
    settlementModalTitleReceive: string;
    settlementAmountLabel: string;
    settlementAccountLabel: string;
    settlementRefLabel: string;
    settlementNoteLabel: string;
    settlementSubmitBtn: string;
    msgCreated: string;
    msgUpdated: string;
    msgDeleted: string;
    msgSettlementSaved: string;
    errNameRequired: string;
    errInvalidAmount: string;
  };
  accounts: {
    title: string;
    subtitle: string;
    exportCsvBtn: string;
    rangeAll: string;
    rangeThisMonth: string;
    rangeLast30: string;
    rangeCustom: string;
    fromDateLabel: string;
    toDateLabel: string;
    grossSalesCard: string;
    deliveryCollectedSub: string;
    totalCogsCard: string;
    cogsSplitPrefix: string;
    grossProfitCard: string;
    grossMarginSuffix: string;
    operatingExpCard: string;
    marketingSubPrefix: string;
    netProfitCard: string;
    netMarginSuffix: string;
    payableDueCard: string;
    receivableDueCard: string;
    netCashPositionCard: string;
    inventoryPurchaseSub: string;
    breakdownTitle: string;
    rowProductRevenue: string;
    rowOwnStockCogs: string;
    rowDropshipCogs: string;
    rowGrossProfit: string;
    rowMarketingAds: string;
    rowOperatingExp: string;
    rowReturnLoss: string;
    rowOtherExpense: string;
    rowOtherIncome: string;
    rowNetProfit: string;
    rowInventoryCashOut: string;
    rowSupplierPayouts: string;
    rowDropshipReceipts: string;
    addTxnTitle: string;
    dateLabel: string;
    typeLabel: string;
    categoryLabel: string;
    categoryPlaceholder: string;
    amountLabel: string;
    supplierOptionalLabel: string;
    orderOptionalLabel: string;
    accountLabel: string;
    refNoLabel: string;
    noteLabel: string;
    recordTxnBtn: string;
    recordingTxnBtn: string;
    ledgerTitle: string;
    filterTypeLabel: string;
    allTypesOption: string;
    emptyLedger: string;
    colDate: string;
    colTypeCategory: string;
    colPartyRef: string;
    colAccount: string;
    colAmount: string;
    colAction: string;
    txnTypes: {
      marketing_expense: string;
      operating_expense: string;
      inventory_purchase: string;
      return_shipping_loss: string;
      supplier_payout: string;
      dropship_receipt: string;
      other_income: string;
      other_expense: string;
    };
    paymentAccounts: {
      Cash: string;
      bKash: string;
      Nagad: string;
      Bank: string;
    };
    msgTxnCreated: string;
    msgTxnUpdated: string;
    msgTxnDeleted: string;
    errInvalidTxn: string;
    editTxnTitle: string;
    saveTxnBtn: string;
    cancelEdit: string;
    csvHeaders: string[];
  };
  crm: {
    title: string;
    subtitle: string;
    addClientBtn: string;
    exportCsvBtn: string;
    searchPlaceholder: string;
    filterAll: string;
    filterDue: string;
    tiers: {
      auto: string;
      vip: string;
      regular: string;
      new: string;
      high_risk: string;
      blocked: string;
    };
    statsVip: string;
    statsRegular: string;
    statsHighRisk: string;
    statsDueToday: string;
    colClient: string;
    colTierRisk: string;
    colOrdersReturns: string;
    colFinancials: string;
    colFollowUpTags: string;
    colAction: string;
    emptyClients: string;
    successRateSuffix: string;
    returnRateSuffix: string;
    profitPrefix: string;
    dueTodayBadge: string;
    overdueBadge: string;
    open360Btn: string;
    manualClientModalTitle: string;
    nameLabel: string;
    phoneLabel: string;
    altPhoneLabel: string;
    emailLabel: string;
    addressLabel: string;
    tierOverrideLabel: string;
    tagsLabel: string;
    tagsPlaceholder: string;
    followUpDateLabel: string;
    followUpTaskLabel: string;
    followUpTaskPlaceholder: string;
    notesLabel: string;
    saveProfileBtn: string;
    savingProfileBtn: string;
    profileTitleSuffix: string;
    callNowBtn: string;
    emailNowBtn: string;
    timelineTitle: string;
    logActionTitle: string;
    channelLabel: string;
    outcomeLabel: string;
    summaryLabel: string;
    summaryPlaceholder: string;
    nextFollowUpLabel: string;
    relatedOrderLabel: string;
    addLogBtn: string;
    addingLogBtn: string;
    emptyLogs: string;
    orderHistoryTitle: string;
    markDoneBtn: string;
    channels: {
      call: string;
      sms: string;
      email: string;
      meeting: string;
      order_followup: string;
      settlement_followup: string;
      note: string;
    };
    outcomes: {
      connected: string;
      no_answer: string;
      promised_payment: string;
      confirmed: string;
      resolved: string;
      escalated: string;
    };
    dashboardQueueTitle: string;
    dashboardQueueSubtitle: string;
    dashboardQueueEmpty: string;
    entityCustomer: string;
    entitySupplier: string;
    openProfileBtn: string;
    netProfitKpi: string;
    payableKpi: string;
    receivableKpi: string;
    msgProfileSaved: string;
    msgProfileDeleted: string;
    msgLogAdded: string;
    msgLogUpdated: string;
    msgLogDeleted: string;
    msgFollowUpCleared: string;
    errProfileFields: string;
    errLogSummary: string;
    editLogBtn: string;
    saveLogBtn: string;
    cancelEditLogBtn: string;
    deleteProfileBtn: string;
    confirmDeleteProfile: string;
    csvHeaders: string[];
  };
  variations: {
    sectionTitle: string;
    sectionSubtitle: string;
    toggleBuilderBtn: string;
    galleryTitle: string;
    galleryHint: string;
    addImageUrlPlaceholder: string;
    addImageBtn: string;
    uploadGalleryBtn: string;
    primaryImageLabel: string;
    colorsTitle: string;
    addColorBtn: string;
    colorNameEnLabel: string;
    colorNameEnPlaceholder: string;
    colorNameBnLabel: string;
    colorNameBnPlaceholder: string;
    colorHexLabel: string;
    colorImageLabel: string;
    sizesLabel: string;
    sizesPlaceholder: string;
    generateMatrixBtn: string;
    clearMatrixBtn: string;
    matrixTitle: string;
    matrixHint: string;
    colCombination: string;
    colVariantSku: string;
    colPriceOverride: string;
    colCostOverride: string;
    colStock: string;
    colActive: string;
    wholesaleTitle: string;
    wholesaleMinQtyLabel: string;
    wholesalePriceLabel: string;
    wholesaleHint: string;
    wholesaleCardHintPrefix: string;
    wholesaleActiveBadge: string;
    wholesaleUnlockPrefix: string;
    wholesaleUnlockMiddle: string;
    wholesaleUnitSuffix: string;
    selectColorLabel: string;
    selectSizeLabel: string;
    selectedVariantOutOfStock: string;
    colorsCountSuffix: string;
    sizesCountSuffix: string;
  };
  coupons: {
    title: string;
    subtitle: string;
    addTitle: string;
    codeLabel: string;
    codePlaceholder: string;
    discountTypeLabel: string;
    percentOption: string;
    fixedOption: string;
    discountValueLabel: string;
    maxDiscountLabel: string;
    minOrderLabel: string;
    expiryDateLabel: string;
    usageLimitLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    createBtn: string;
    creatingBtn: string;
    editTitle: string;
    saveBtn: string;
    savingBtn: string;
    cancelEdit: string;
    activeCheckbox: string;
    emptyTitle: string;
    colCode: string;
    colOffer: string;
    colRules: string;
    colUsage: string;
    colStatus: string;
    colActions: string;
    unlimitedUsage: string;
    noMinOrder: string;
    noExpiry: string;
    minOrderPrefix: string;
    maxCapPrefix: string;
    checkoutLabel: string;
    checkoutPlaceholder: string;
    applyBtn: string;
    applyingBtn: string;
    removeBtn: string;
    appliedPrefix: string;
    discountRowLabel: string;
    msgCreated: string;
    msgUpdated: string;
    msgEdited: string;
    msgDeleted: string;
    errMissingCode: string;
    errReasons: {
      MISSING_COUPON_CODE: string;
      COUPON_NOT_FOUND: string;
      COUPON_INACTIVE: string;
      COUPON_EXPIRED: string;
      COUPON_LIMIT_REACHED: string;
      COUPON_MIN_ORDER_NOT_MET: string;
      DEFAULT: string;
    };
  };
  qrPayment: {
    adminSectionTitle: string;
    adminSectionSubtitle: string;
    bkashQrUrlLabel: string;
    bkashMerchantLabel: string;
    bkashMerchantPlaceholder: string;
    banglaQrUrlLabel: string;
    banglaQrAccountLabel: string;
    banglaQrAccountPlaceholder: string;
    uploadQrBtn: string;
    qrUploadedMsg: string;
    checkoutOnlineOption: string;
    selectQrTypeLabel: string;
    bkashQrTab: string;
    banglaQrTab: string;
    manualMobileTab: string;
    scanPayTitle: string;
    amountToPayLabel: string;
    merchantNoLabel: string;
    copyNoBtn: string;
    copiedNoBtn: string;
    downloadQrBtn: string;
    noQrConfiguredHint: string;
    trxRequiredHint: string;
    qrHelpText: string;
  };
}

export const MART_ENTERPRISE_DICTIONARY: Record<MartLang, MartEnterpriseDictionary> = {
  en: {
    sourcing: {
      sectionTitle: "Sourcing Mode, Costing & Inventory Control",
      fulfillmentModeLabel: "Fulfillment & Sourcing Type *",
      ownStockMode: "Own Stock (In-House Inventory)",
      ownStockHint: "Tracks warehouse quantity and deducts stock automatically on checkout.",
      dropshipMode: "Dropshipping (Supplier-Fulfilled)",
      dropshipHint: "Always available while supplier supply is active. Zero warehouse stock deduction.",
      supplierLabel: "Linked Supplier / Source",
      noSupplierOption: "No Supplier Linked / Direct Market Purchase",
      sourceNameLabel: "Source / Market Label (Optional)",
      sourceNamePlaceholder: "e.g. Chawkbazar Wholesale or AliDropship Partner",
      costPriceLabel: "Cost / Purchase Price (৳)",
      marginPreviewLabel: "Unit Gross Margin",
      unitProfitLabel: "Profit / Unit",
      collectionModeLabel: "Payment Collection Flow",
      storeCollectsOption: "Store collects payment & owes Supplier Cost (Payable)",
      supplierCollectsOption: "Dropship Partner collects COD & pays Profit back (Receivable)",
      supplierAvailableCheckbox: "Supplier Supply Active (Unlimited Availability on Storefront)",
      lowStockThresholdLabel: "Low-Stock Alert Threshold",
      unlimitedLabel: "Unlimited (Dropship)",
      availableStatus: "Supply Active",
      pausedStatus: "Supply Paused",
      colSourcing: "Sourcing",
      colCostMargin: "Cost & Profit",
    },
    orderItems: {
      fulfillmentPanelBtn: "Items & Profit",
      hidePanelBtn: "Close Details",
      itemSourceLabel: "Item Sourcing & Fulfillment Breakdown",
      supplierCol: "Source / Supplier",
      collectionCol: "Billing Flow",
      costProfitCol: "Cost / Profit",
      itemStatusCol: "Item Status",
      orderPnlSummary: "Order Financial Summary",
      orderSalesLabel: "Item Sales",
      orderCostLabel: "Product Cost",
      orderProfitLabel: "Gross Profit",
      highRiskWarning: "High Return Risk Buyer",
      blockedWarning: "Blocked / Do Not Ship",
      vipCustomerTag: "VIP Client",
      regularCustomerTag: "Regular",
      newCustomerTag: "New Client",
      statusUpdatedMsg: "Item fulfillment status updated and P&L recalculated.",
      itemStatuses: {
        Pending: "Pending",
        "Forwarded to Supplier": "Forwarded to Supplier",
        Packaging: "Packaging",
        Shipped: "Shipped",
        Delivered: "Delivered",
        Returned: "Returned",
        Cancelled: "Cancelled",
      },
    },
    suppliers: {
      title: "Suppliers & Dropshipping Partners (Mart_Suppliers)",
      subtitle:
        "Manage dropship vendors, wholesalers, SLA delivery rates, payable dues, and dropship profit receivables.",
      addTitle: "Add Supplier / Dropship Partner",
      editTitle: "Edit Supplier Profile",
      cancelEdit: "Cancel Edit",
      nameLabel: "Supplier / Company Name *",
      namePlaceholder: "e.g. Dhaka Apparel Dropship Hub",
      companyTypeLabel: "Partner Type",
      types: {
        dropship: "Dropshipping Partner",
        wholesale: "Wholesale Supplier",
        manufacturer: "Direct Factory / Importer",
      },
      contactPersonLabel: "Contact Person",
      contactPersonPlaceholder: "e.g. Tariqul Islam",
      phoneLabel: "Phone Number *",
      phonePlaceholder: "01XXXXXXXXX",
      altPhoneLabel: "Alternate Phone",
      emailLabel: "Email Address",
      addressLabel: "Warehouse / Pickup Address",
      payoutModeLabel: "Default Settlement Flow",
      payoutModes: {
        we_pay_supplier: "We collect COD & pay Supplier Cost (Payable)",
        supplier_pays_us: "Partner collects COD & sends Profit/Commission (Receivable)",
      },
      leadTimeLabel: "Avg Lead Time (Days)",
      tagsLabel: "Tags (Comma-separated)",
      tagsPlaceholder: "e.g. Fast-Dispatch, Dhaka-Hub, Winter-Stock",
      notesLabel: "Agreement & Account Notes",
      notesPlaceholder: "Bank/bKash details, return rules, commission notes...",
      nextFollowUpLabel: "Next Follow-up Date",
      activeCheckbox: "Supplier Active (Products orderable)",
      saveBtn: "Save Supplier Changes",
      createBtn: "Save Supplier",
      savingBtn: "Saving...",
      searchPlaceholder: "Search supplier name, phone, tags...",
      emptyTitle: "No suppliers added yet. Create your first wholesaler or dropshipping partner above.",
      colSupplier: "Supplier & Contact",
      colTypeTerms: "Type & Settlement",
      colSlaStats: "Performance SLA",
      colPayableDue: "We Owe (Payable)",
      colReceivableDue: "Owed to Us (Receivable)",
      colActions: "Actions",
      productsCountSuffix: "SKUs",
      deliveryRateLabel: "Delivered",
      returnRateLabel: "Return",
      paySupplierBtn: "Pay Due",
      receiveDropshipBtn: "Receive Payout",
      openCrmBtn: "CRM Log",
      settledLabel: "Settled",
      settlementModalTitlePay: "Record Supplier Payout",
      settlementModalTitleReceive: "Record Dropship Partner Payment Received",
      settlementAmountLabel: "Amount (BDT ৳) *",
      settlementAccountLabel: "Payment Account",
      settlementRefLabel: "Transaction / Reference No",
      settlementNoteLabel: "Settlement Note",
      settlementSubmitBtn: "Record Settlement",
      msgCreated: "Supplier saved to Mart_Suppliers.",
      msgUpdated: "Supplier profile updated.",
      msgDeleted: "Supplier removed.",
      msgSettlementSaved: "Supplier financial settlement recorded in Cashbook.",
      errNameRequired: "Supplier name is required.",
      errInvalidAmount: "Please enter a valid positive settlement amount.",
    },
    accounts: {
      title: "Accounting, Profit & Loss (P&L) & Cashbook Ledger",
      subtitle:
        "Complete tracking of Product Costs (COGS), Marketing/Ad Spend, Operating Expenses, Net Profit, Supplier Payables & Dropship Receipts.",
      exportCsvBtn: "Export Accounting CSV",
      rangeAll: "All Time",
      rangeThisMonth: "This Month",
      rangeLast30: "Last 30 Days",
      rangeCustom: "Custom Range",
      fromDateLabel: "From",
      toDateLabel: "To",
      grossSalesCard: "Valid Product Sales",
      deliveryCollectedSub: "Delivery fee collected",
      totalCogsCard: "Product Cost (COGS)",
      cogsSplitPrefix: "Own Stock / Dropship",
      grossProfitCard: "Gross Profit",
      grossMarginSuffix: "gross margin",
      operatingExpCard: "Marketing & Operating Exp",
      marketingSubPrefix: "Marketing Ads",
      netProfitCard: "Net Profit",
      netMarginSuffix: "net margin",
      payableDueCard: "Total Supplier Payable",
      receivableDueCard: "Dropship Receivable",
      netCashPositionCard: "Net Cash Position",
      inventoryPurchaseSub: "Stock Purchases Outflow",
      breakdownTitle: "Income Statement (P&L) & Settlement Breakdown",
      rowProductRevenue: "Product Revenue (Excluding Cancelled & Returned)",
      rowOwnStockCogs: "Own Stock Product Cost (COGS)",
      rowDropshipCogs: "Dropshipping Supplier Cost (COGS)",
      rowGrossProfit: "Gross Profit (Revenue - Total COGS)",
      rowMarketingAds: "Marketing & Advertising Spend",
      rowOperatingExp: "Packaging, Office & Operations",
      rowReturnLoss: "Courier & Return Losses",
      rowOtherExpense: "Other Business Expenses",
      rowOtherIncome: "Other Income / Adjustments",
      rowNetProfit: "Net Business Profit",
      rowInventoryCashOut: "Own Inventory Restock Purchases (Cash Outflow)",
      rowSupplierPayouts: "Supplier Payouts Sent",
      rowDropshipReceipts: "Dropship Partner Payments Received",
      addTxnTitle: "Log Expense, Marketing Spend or Cashbook Entry",
      dateLabel: "Date *",
      typeLabel: "Transaction Type *",
      categoryLabel: "Sub-Category / Campaign",
      categoryPlaceholder: "e.g. Facebook Winter Hoodie Ads, Box & Poly, Courier Damage",
      amountLabel: "Amount (BDT ৳) *",
      supplierOptionalLabel: "Linked Supplier (Optional)",
      orderOptionalLabel: "Related Order ID (Optional)",
      accountLabel: "Payment Account",
      refNoLabel: "Reference / TrxID",
      noteLabel: "Note / Details",
      recordTxnBtn: "Record Entry",
      recordingTxnBtn: "Recording...",
      ledgerTitle: "Cashbook & Expense Ledger (Mart_Transactions)",
      filterTypeLabel: "Filter by type",
      allTypesOption: "All Transactions",
      emptyLedger: "No accounting transactions logged yet. Add ad spend, expenses, or settlements above.",
      colDate: "Date",
      colTypeCategory: "Type & Category",
      colPartyRef: "Supplier / Order / Ref",
      colAccount: "Account",
      colAmount: "Amount",
      colAction: "Action",
      txnTypes: {
        marketing_expense: "Marketing & Ads Spend",
        operating_expense: "Packaging & Operations Expense",
        inventory_purchase: "Inventory / Stock Purchase",
        return_shipping_loss: "Return / Courier Loss",
        supplier_payout: "Supplier Payout Sent",
        dropship_receipt: "Dropship Payment Received",
        other_income: "Other Income",
        other_expense: "Other Expense",
      },
      paymentAccounts: {
        Cash: "Cash",
        bKash: "bKash",
        Nagad: "Nagad",
        Bank: "Bank Transfer",
      },
      msgTxnCreated: "Transaction recorded in Mart_Transactions.",
      msgTxnUpdated: "Transaction entry updated in Mart_Transactions.",
      msgTxnDeleted: "Transaction deleted from ledger.",
      errInvalidTxn: "Please provide a valid date and positive amount.",
      editTxnTitle: "Edit Cashbook / Expense Entry",
      saveTxnBtn: "Save Entry Changes",
      cancelEdit: "Cancel Edit",
      csvHeaders: [
        "ID",
        "Date",
        "Type",
        "Category",
        "Amount (BDT)",
        "Payment Account",
        "Supplier ID",
        "Order ID",
        "Reference No",
        "Note",
      ],
    },
    crm: {
      title: "Client 360° CRM, Risk Scoring & Follow-up Hub",
      subtitle:
        "Automatic VIP, Regular & High-Return Risk classification with interaction logs, tags, and scheduled follow-up reminders.",
      addClientBtn: "+ Add Manual Client",
      exportCsvBtn: "Export CRM CSV",
      searchPlaceholder: "Search client name, phone, tags, address...",
      filterAll: "All Clients",
      filterDue: "Follow-up Due",
      tiers: {
        auto: "Auto Tier",
        vip: "VIP",
        regular: "Regular",
        new: "New",
        high_risk: "High Risk",
        blocked: "Blocked",
      },
      statsVip: "VIP Clients",
      statsRegular: "Regular Buyers",
      statsHighRisk: "High-Risk Buyers",
      statsDueToday: "Follow-ups Due",
      colClient: "Client & Contact",
      colTierRisk: "Tier & Risk",
      colOrdersReturns: "Orders & Delivery",
      colFinancials: "Spend & Profit",
      colFollowUpTags: "Tags & Follow-up",
      colAction: "Action",
      emptyClients: "No client profiles match your filter.",
      successRateSuffix: "delivered",
      returnRateSuffix: "return/cancel",
      profitPrefix: "Profit",
      dueTodayBadge: "Due Today",
      overdueBadge: "Overdue",
      open360Btn: "Open 360° CRM",
      manualClientModalTitle: "Add / Update Client CRM Profile",
      nameLabel: "Client Name *",
      phoneLabel: "Phone Number *",
      altPhoneLabel: "Alternate Phone",
      emailLabel: "Email",
      addressLabel: "Address",
      tierOverrideLabel: "Tier / Status Rule",
      tagsLabel: "Tags (Comma-separated)",
      tagsPlaceholder: "e.g. Corporate-Buyer, Dhaka-Regular, COD-Verified",
      followUpDateLabel: "Next Follow-up Date",
      followUpTaskLabel: "Follow-up Task / Reminder",
      followUpTaskPlaceholder: "e.g. Confirm shipping address or collect balance",
      notesLabel: "CRM Profile Notes",
      saveProfileBtn: "Save CRM Profile",
      savingProfileBtn: "Saving...",
      profileTitleSuffix: "360° CRM Profile",
      callNowBtn: "Call",
      emailNowBtn: "Email",
      timelineTitle: "Communication & Call Log Timeline",
      logActionTitle: "Log Call / Message / Follow-up",
      channelLabel: "Channel",
      outcomeLabel: "Outcome",
      summaryLabel: "Summary / Discussion Notes *",
      summaryPlaceholder: "e.g. Called customer, confirmed size M and delivery tomorrow...",
      nextFollowUpLabel: "Schedule Next Follow-up (Optional)",
      relatedOrderLabel: "Order ID (Optional)",
      addLogBtn: "Save Interaction Log",
      addingLogBtn: "Saving...",
      emptyLogs: "No calls or communication logs recorded yet.",
      orderHistoryTitle: "Order & Fulfillment History",
      markDoneBtn: "Mark Done",
      channels: {
        call: "Phone Call",
        sms: "SMS / Text",
        email: "Email",
        meeting: "In-Person Meeting",
        order_followup: "Order Confirmation Call",
        settlement_followup: "Payment / Settlement Call",
        note: "Internal Note",
      },
      outcomes: {
        connected: "Connected / Spoke",
        no_answer: "No Answer",
        promised_payment: "Promised Payment",
        confirmed: "Confirmed Order",
        resolved: "Resolved",
        escalated: "Escalated / Issue",
      },
      dashboardQueueTitle: "Today & Overdue CRM Follow-up Queue",
      dashboardQueueSubtitle: "Scheduled callbacks for high-risk orders, clients, and supplier settlements.",
      dashboardQueueEmpty: "All scheduled client and supplier follow-ups are clear.",
      entityCustomer: "Client",
      entitySupplier: "Supplier",
      openProfileBtn: "Open CRM",
      netProfitKpi: "Net Business Profit",
      payableKpi: "Supplier Payable Due",
      receivableKpi: "Dropship Receivable",
      msgProfileSaved: "CRM profile saved.",
      msgProfileDeleted: "CRM profile deleted.",
      msgLogAdded: "Interaction log saved to CRM timeline.",
      msgLogUpdated: "Interaction log updated.",
      msgLogDeleted: "Interaction log deleted.",
      msgFollowUpCleared: "Follow-up marked as completed.",
      errProfileFields: "Client name and phone number are required.",
      errLogSummary: "Please enter a brief interaction summary.",
      editLogBtn: "Edit",
      saveLogBtn: "Save Log",
      cancelEditLogBtn: "Cancel",
      deleteProfileBtn: "Delete Profile",
      confirmDeleteProfile: "Confirm Delete Profile?",
      csvHeaders: [
        "Name",
        "Phone",
        "Email",
        "Address",
        "Tier",
        "Orders",
        "Delivered",
        "Cancelled/Returned",
        "Delivery Success %",
        "Total Spend (BDT)",
        "Profit Contribution (BDT)",
        "Tags",
        "Next Follow-up",
        "Follow-up Task",
      ],
    },
    variations: {
      sectionTitle: "Color & Size Variations, Multi-Image Gallery & Wholesale Pricing",
      sectionSubtitle: "Optional for standard items — ideal for garments, footwear & bulk items.",
      toggleBuilderBtn: "Variations & Wholesale",
      galleryTitle: "Additional Product Gallery Photos",
      galleryHint: "Upload extra angles or paste URLs. Customers can browse thumbnails and link photos to colors.",
      addImageUrlPlaceholder: "Paste extra image URL (https://...)",
      addImageBtn: "Add URL",
      uploadGalleryBtn: "Upload Extra Photo to Drive",
      primaryImageLabel: "Primary Photo",
      colorsTitle: "Color Swatches",
      addColorBtn: "+ Add Color",
      colorNameEnLabel: "Color (EN)",
      colorNameEnPlaceholder: "e.g. Midnight Black",
      colorNameBnLabel: "Color (BN)",
      colorNameBnPlaceholder: "যেমন: কালো",
      colorHexLabel: "Swatch",
      colorImageLabel: "Linked Photo URL (Optional)",
      sizesLabel: "Sizes (Comma-separated)",
      sizesPlaceholder: "e.g. S, M, L, XL, XXL or 38, 40, 42",
      generateMatrixBtn: "Build Color × Size Matrix",
      clearMatrixBtn: "Clear Matrix",
      matrixTitle: "Color × Size Price & Stock Matrix (Optional)",
      matrixHint: "Leave Price or Cost Override as 0 to inherit base product pricing.",
      colCombination: "Color / Size",
      colVariantSku: "Variant SKU",
      colPriceOverride: "Price Override (৳)",
      colCostOverride: "Cost Override (৳)",
      colStock: "Stock",
      colActive: "Active",
      wholesaleTitle: "Wholesale / Bulk Tier Rate (Optional)",
      wholesaleMinQtyLabel: "Min Wholesale Qty",
      wholesalePriceLabel: "Wholesale Unit Price (৳)",
      wholesaleHint: "When a buyer orders this quantity or more, this rate applies automatically.",
      wholesaleCardHintPrefix: "Wholesale",
      wholesaleActiveBadge: "Wholesale Rate Applied",
      wholesaleUnlockPrefix: "Buy",
      wholesaleUnlockMiddle: "+ pcs at",
      wholesaleUnitSuffix: "/ pc",
      selectColorLabel: "Color",
      selectSizeLabel: "Size",
      selectedVariantOutOfStock: "This selected color/size combination is currently out of stock.",
      colorsCountSuffix: "colors",
      sizesCountSuffix: "sizes",
    },
    coupons: {
      title: "Discount Coupons & Promo Codes (Mart_Coupons)",
      subtitle: "Create percentage or flat BDT promo codes with minimum order rules, usage limits, and expiry dates.",
      addTitle: "Create New Promo Coupon",
      codeLabel: "Coupon Code *",
      codePlaceholder: "e.g. WINTER10 or EID200",
      discountTypeLabel: "Discount Type",
      percentOption: "Percentage (%)",
      fixedOption: "Flat Amount (৳)",
      discountValueLabel: "Discount Value *",
      maxDiscountLabel: "Max Discount Cap (৳)",
      minOrderLabel: "Min Subtotal (৳)",
      expiryDateLabel: "Expiry Date",
      usageLimitLabel: "Max Total Uses (0 = Unlimited)",
      notesLabel: "Campaign Note",
      notesPlaceholder: "e.g. Winter jacket launch offer",
      createBtn: "Publish Coupon",
      creatingBtn: "Publishing...",
      editTitle: "Edit Discount Coupon",
      saveBtn: "Save Coupon Changes",
      savingBtn: "Saving...",
      cancelEdit: "Cancel Edit",
      activeCheckbox: "Coupon Active (Redeemable at checkout)",
      emptyTitle: "No promo coupons created yet. Add your first discount code above.",
      colCode: "Promo Code",
      colOffer: "Discount Offer",
      colRules: "Conditions",
      colUsage: "Used / Limit",
      colStatus: "Status",
      colActions: "Actions",
      unlimitedUsage: "Unlimited",
      noMinOrder: "No min order",
      noExpiry: "No expiry",
      minOrderPrefix: "Min",
      maxCapPrefix: "Cap",
      checkoutLabel: "Promo / Coupon Code",
      checkoutPlaceholder: "Enter promo code (e.g. WINTER10)",
      applyBtn: "Apply",
      applyingBtn: "Checking...",
      removeBtn: "Remove",
      appliedPrefix: "Coupon applied",
      discountRowLabel: "Coupon Discount",
      msgCreated: "Coupon created in Mart_Coupons.",
      msgUpdated: "Coupon status updated.",
      msgEdited: "Coupon updated in Mart_Coupons.",
      msgDeleted: "Coupon deleted.",
      errMissingCode: "Coupon code and positive discount value are required.",
      errReasons: {
        MISSING_COUPON_CODE: "Please enter a valid coupon code.",
        COUPON_NOT_FOUND: "Coupon code not found.",
        COUPON_INACTIVE: "This coupon code is currently paused.",
        COUPON_EXPIRED: "This coupon code has expired.",
        COUPON_LIMIT_REACHED: "This coupon has reached its maximum redemption limit.",
        COUPON_MIN_ORDER_NOT_MET: "Minimum order subtotal requirement not met for this coupon.",
        DEFAULT: "Coupon code could not be applied.",
      },
    },
    qrPayment: {
      adminSectionTitle: "Official bKash Merchant QR & Bangla QR Payments",
      adminSectionSubtitle: "Upload official QR code images to Drive so customers can preview, download, and scan directly at checkout.",
      bkashQrUrlLabel: "Official bKash Merchant QR Image URL",
      bkashMerchantLabel: "bKash Merchant / Payment Number",
      bkashMerchantPlaceholder: "e.g. 017XXXXXXXX",
      banglaQrUrlLabel: "Official Bangla QR Image URL (Interoperable Bank/MFS)",
      banglaQrAccountLabel: "Bangla QR Merchant Name / Bank Label",
      banglaQrAccountPlaceholder: "e.g. Xeetrix Mart · National Bangla QR",
      uploadQrBtn: "Upload QR to Drive",
      qrUploadedMsg: "QR code uploaded cleanly to Google Drive.",
      checkoutOnlineOption: "Online / QR Pay",
      selectQrTypeLabel: "Choose QR / Online Payment Option",
      bkashQrTab: "bKash Merchant QR",
      banglaQrTab: "Bangla QR (All Banks & MFS)",
      manualMobileTab: "Nagad / Rocket",
      scanPayTitle: "Scan QR or Download Image to Your App",
      amountToPayLabel: "Payable Amount",
      merchantNoLabel: "Merchant Number",
      copyNoBtn: "Copy",
      copiedNoBtn: "Copied",
      downloadQrBtn: "Download QR Image",
      noQrConfiguredHint: "QR image not uploaded yet. Use merchant/receiver number below or Cash on Delivery.",
      trxRequiredHint: "After paying, enter your TrxID below for fast verification.",
      qrHelpText: "Works inside bKash, Nagad, Rocket, CellFin, and banking apps via QR gallery upload.",
    },
  },
  bn: {
    sourcing: {
      sectionTitle: "সোর্সিং ধরন, ক্রয়মূল্য ও ইনভেন্টরি নিয়ন্ত্রণ",
      fulfillmentModeLabel: "পণ্য সরবরাহ / সোর্সিং মোড *",
      ownStockMode: "নিজস্ব স্টক (নিজের গোডাউন ইনভেন্টরি)",
      ownStockHint: "নিজস্ব স্টকের সংখ্যা হিসাব রাখে এবং অর্ডারের সাথে স্বয়ংক্রিয়ভাবে স্টক কমায়।",
      dropshipMode: "ড্রপশিপিং (সাপ্লাইয়ার সরবরাহ করবে)",
      dropshipHint: "সাপ্লাইয়ার চালু রাখলে স্টোরফ্রন্টে আনলিমিটেড প্রাপ্য দেখাবে ও স্টক কমবে না।",
      supplierLabel: "সাপ্লাইয়ার / সোর্স নির্বাচন করুন",
      noSupplierOption: "নির্দিষ্ট সাপ্লাইয়ার ছাড়া / সরাসরি মার্কেট ক্রয়",
      sourceNameLabel: "সোর্স বা মার্কেটের নাম (ঐচ্ছিক)",
      sourceNamePlaceholder: "যেমন: চকবাজার হোলসেল বা ড্রপশিপ পার্টনার",
      costPriceLabel: "ক্রয়মূল্য / সাপ্লাইয়ার মূল্য (৳)",
      marginPreviewLabel: "একক গ্রস মার্জিন",
      unitProfitLabel: "প্রতি ইউনিট লাভ",
      collectionModeLabel: "টাকা সংগ্রহ ও সেটেলমেন্ট ধরন",
      storeCollectsOption: "স্টোর টাকা নেবে ও সাপ্লাইয়ারকে ক্রয়মূল্য দেবে (Payable)",
      supplierCollectsOption: "ড্রপশিপ কোম্পানি COD নেবে ও আমাদের লাভ পাঠাবে (Receivable)",
      supplierAvailableCheckbox: "সাপ্লাইয়ারের কাছে পণ্য চালু আছে (স্টোরফ্রন্টে আনলিমিটেড অর্ডারযোগ্য)",
      lowStockThresholdLabel: "কম স্টক সতর্কতা সীমা",
      unlimitedLabel: "আনলিমিটেড (ড্রপশিপ)",
      availableStatus: "সরবরাহ চালু",
      pausedStatus: "সরবরাহ বন্ধ",
      colSourcing: "সোর্সিং",
      colCostMargin: "ক্রয় ও লাভ",
    },
    orderItems: {
      fulfillmentPanelBtn: "আইটেম ও লাভ",
      hidePanelBtn: "বিস্তারিত বন্ধ করুন",
      itemSourceLabel: "আইটেম-ভিত্তিক সোর্সিং ও ফুলফিলমেন্ট নিয়ন্ত্রণ",
      supplierCol: "সোর্স / সাপ্লাইয়ার",
      collectionCol: "টাকা কালেকশন মোড",
      costProfitCol: "ক্রয়মূল্য / লাভ",
      itemStatusCol: "আইটেম স্ট্যাটাস",
      orderPnlSummary: "এই অর্ডারের আর্থিক সারসংক্ষেপ",
      orderSalesLabel: "পণ্যের বিক্রি",
      orderCostLabel: "ক্রয়মূল্য",
      orderProfitLabel: "মোট লাভ",
      highRiskWarning: "উচ্চ-রিটার্ন ঝুঁকি ক্রেতা",
      blockedWarning: "ব্লকড / ডেলিভারি সতর্কতা",
      vipCustomerTag: "VIP ক্লায়েন্ট",
      regularCustomerTag: "নিয়মিত",
      newCustomerTag: "নতুন ক্লায়েন্ট",
      statusUpdatedMsg: "আইটেম ফুলফিলমেন্ট স্ট্যাটাস আপডেট ও হিসাব সমন্বয় হয়েছে।",
      itemStatuses: {
        Pending: "অপেক্ষমাণ",
        "Forwarded to Supplier": "সাপ্লাইয়ারকে পাঠানো হয়েছে",
        Packaging: "প্যাকেজিং চলছে",
        Shipped: "কুরিয়ারে পাঠানো হয়েছে",
        Delivered: "ডেলিভারড",
        Returned: "রিটার্ন হয়েছে",
        Cancelled: "বাতিল",
      },
    },
    suppliers: {
      title: "সাপ্লাইয়ার ও ড্রপশিপিং পার্টনার (Mart_Suppliers)",
      subtitle:
        "ড্রপশিপিং কোম্পানি, হোলসেলার, ডেলিভারি সফলতার হার, আমাদের বকেয়া দেনা ও ড্রপশিপিং পাওনা ম্যানেজ করুন।",
      addTitle: "নতুন সাপ্লাইয়ার / ড্রপশিপার যোগ করুন",
      editTitle: "সাপ্লাইয়ার তথ্য এডিট করুন",
      cancelEdit: "এডিট বাতিল",
      nameLabel: "সাপ্লাইয়ার / কোম্পানির নাম *",
      namePlaceholder: "যেমন: ঢাকা অ্যাপারেল ড্রপশিপ হাব",
      companyTypeLabel: "সোর্সের ধরন",
      types: {
        dropship: "ড্রপশিপিং পার্টনার",
        wholesale: "পাইকারি / হোলসেল সাপ্লাইয়ার",
        manufacturer: "সরাসরি ফ্যাক্টরি / আমদানিকারক",
      },
      contactPersonLabel: "দায়িত্বপ্রাপ্ত ব্যক্তির নাম",
      contactPersonPlaceholder: "যেমন: তারিকুল ইসলাম",
      phoneLabel: "ফোন নম্বর *",
      phonePlaceholder: "01XXXXXXXXX",
      altPhoneLabel: "বিকল্প ফোন",
      emailLabel: "ইমেইল ঠিকানা",
      addressLabel: "অফিস / পিকআপ ঠিকানা",
      payoutModeLabel: "ডিফল্ট পেমেন্ট ও সেটেলমেন্ট নিয়ম",
      payoutModes: {
        we_pay_supplier: "আমরা কাস্টমার থেকে টাকা নেব এবং সাপ্লাইয়ারকে ক্রয়মূল্য দেব (দেনা)",
        supplier_pays_us: "ড্রপশিপার কাস্টমার থেকে COD নেবে এবং আমাদের লাভ পাঠাবে (পাওনা)",
      },
      leadTimeLabel: "গড় ডেলিভারি প্রস্তুতি সময় (দিন)",
      tagsLabel: "ট্যাগ (কমা দিয়ে আলাদা)",
      tagsPlaceholder: "যেমন: ফাস্ট-ডিসপ্যাচ, ঢাকা-হাব, উইন্টার-স্টক",
      notesLabel: "চুক্তি ও ব্যাংক/বিকাশ তথ্য",
      notesPlaceholder: "বিকাশ/ব্যাংক নম্বর, রিটার্ন নীতি, কমিশনের শর্তাবলি...",
      nextFollowUpLabel: "পরবর্তী ফলোআপ তারিখ",
      activeCheckbox: "সাপ্লাইয়ার সক্রিয় (পণ্য অর্ডার নেওয়া যাবে)",
      saveBtn: "সাপ্লাইয়ার আপডেট করুন",
      createBtn: "সাপ্লাইয়ার সংরক্ষণ করুন",
      savingBtn: "সংরক্ষণ হচ্ছে...",
      searchPlaceholder: "সাপ্লাইয়ার নাম, ফোন, ট্যাগ খুঁজুন...",
      emptyTitle: "এখনো কোনো সাপ্লাইয়ার যুক্ত করা হয়নি। উপরের ফর্ম থেকে প্রথম সাপ্লাইয়ার বা ড্রপশিপিং পার্টনার যোগ করুন।",
      colSupplier: "সাপ্লাইয়ার ও যোগাযোগ",
      colTypeTerms: "ধরন ও সেটেলমেন্ট নিয়ম",
      colSlaStats: "ডেলিভারি পারফর্ম্যান্স",
      colPayableDue: "আমাদের দেনা (Payable)",
      colReceivableDue: "আমাদের পাওনা (Receivable)",
      colActions: "অ্যাকশন",
      productsCountSuffix: "টি পণ্য",
      deliveryRateLabel: "ডেলিভার্ড",
      returnRateLabel: "রিটার্ন",
      paySupplierBtn: "দেনা পরিশোধ",
      receiveDropshipBtn: "পেমেন্ট রিসিভ",
      openCrmBtn: "CRM লগ",
      settledLabel: "হিসাব সমান",
      settlementModalTitlePay: "সাপ্লাইয়ার বকেয়া পরিশোধ এন্ট্রি",
      settlementModalTitleReceive: "ড্রপশিপিং কোম্পানি থেকে পেমেন্ট রিসিভ এন্ট্রি",
      settlementAmountLabel: "টাকার পরিমাণ (৳) *",
      settlementAccountLabel: "পেমেন্ট অ্যাকাউন্ট",
      settlementRefLabel: "ট্রানজেকশন / রেফারেন্স নম্বর",
      settlementNoteLabel: "সেটেলমেন্ট নোট",
      settlementSubmitBtn: "হিসাব সংরক্ষণ করুন",
      msgCreated: "সাপ্লাইয়ার Mart_Suppliers-এ সংরক্ষিত হয়েছে।",
      msgUpdated: "সাপ্লাইয়ারের তথ্য আপডেট করা হয়েছে।",
      msgDeleted: "সাপ্লাইয়ার তালিকা থেকে মুছে ফেলা হয়েছে।",
      msgSettlementSaved: "সাপ্লাইয়ার পেমেন্ট সেটেলমেন্ট ক্যাশবুকে যুক্ত হয়েছে।",
      errNameRequired: "সাপ্লাইয়ারের নাম দেওয়া আবশ্যক।",
      errInvalidAmount: "অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন।",
    },
    accounts: {
      title: "হিসাব-নিকাশ, লাভ-ক্ষতি (P&L) ও ক্যাশবুক লেজার",
      subtitle:
        "পণ্যের ক্রয়মূল্য (COGS), মার্কেটিং/বিজ্ঞাপন খরচ, পরিচালন ব্যয়, নিট লাভ, সাপ্লাইয়ার বকেয়া ও ড্রপশিপিং পেমেন্ট আদায়ের পূর্ণাঙ্গ হিসাব।",
      exportCsvBtn: "অ্যাকাউন্টিং CSV ডাউনলোড",
      rangeAll: "সকল সময়",
      rangeThisMonth: "চলতি মাস",
      rangeLast30: "গত ৩০ দিন",
      rangeCustom: "নির্দিষ্ট তারিখ",
      fromDateLabel: "শুরু",
      toDateLabel: "শেষ",
      grossSalesCard: "মোট বৈধ পণ্য বিক্রি",
      deliveryCollectedSub: "সংগৃহীত ডেলিভারি চার্জ",
      totalCogsCard: "পণ্যের ক্রয়মূল্য (COGS)",
      cogsSplitPrefix: "নিজস্ব / ড্রপশিপ",
      grossProfitCard: "মোট লাভ (Gross Profit)",
      grossMarginSuffix: "গ্রস মার্জিন",
      operatingExpCard: "মার্কেটিং ও পরিচালন খরচ",
      marketingSubPrefix: "বিজ্ঞাপন খরচ",
      netProfitCard: "চূড়ান্ত নিট লাভ (Net Profit)",
      netMarginSuffix: "নিট মার্জিন",
      payableDueCard: "সাপ্লাইয়ার বকেয়া দেনা",
      receivableDueCard: "ড্রপশিপার থেকে পাওনা",
      netCashPositionCard: "নিট নগদ অবস্থান",
      inventoryPurchaseSub: "স্টক ক্রয়ে নগদ ব্যয়",
      breakdownTitle: "বিস্তারিত আয়-ব্যয় বিবরণী (P&L Statement)",
      rowProductRevenue: "মোট পণ্য বিক্রি (বাতিল ও রিটার্ন বাদে)",
      rowOwnStockCogs: "নিজস্ব স্টক পণ্যের ক্রয়মূল্য (COGS)",
      rowDropshipCogs: "ড্রপশিপিং পণ্যের সাপ্লাইয়ার মূল্য (COGS)",
      rowGrossProfit: "মোট লাভ (বিক্রি − মোট ক্রয়মূল্য)",
      rowMarketingAds: "মার্কেটিং ও বিজ্ঞাপন খরচ (Ads / Boost)",
      rowOperatingExp: "প্যাকেজিং, অফিস ও পরিচালন ব্যয়",
      rowReturnLoss: "কুরিয়ার ও রিটার্ন ক্ষতি",
      rowOtherExpense: "অন্যান্য ব্যবসায়িক খরচ",
      rowOtherIncome: "অন্যান্য আয় / সমন্বয়",
      rowNetProfit: "নিট ব্যবসায়িক লাভ",
      rowInventoryCashOut: "নিজস্ব স্টক রিস্টক ক্রয় (নগদ ইনভেন্টরি ব্যয়)",
      rowSupplierPayouts: "সাপ্লাইয়ারদের পরিশোধিত মোট অর্থ",
      rowDropshipReceipts: "ড্রপশিপিং কোম্পানি থেকে প্রাপ্ত মোট অর্থ",
      addTxnTitle: "খরচ, মার্কেটিং ব্যয় বা ক্যাশবুক এন্ট্রি যোগ করুন",
      dateLabel: "তারিখ *",
      typeLabel: "লেনদেনের ধরন *",
      categoryLabel: "ক্যাটাগরি / ক্যাম্পেইন নাম",
      categoryPlaceholder: "যেমন: Facebook Winter Ads, বক্স ও পলিথিন, কুরিয়ার ড্যামেজ",
      amountLabel: "টাকার পরিমাণ (৳) *",
      supplierOptionalLabel: "সংশ্লিষ্ট সাপ্লাইয়ার (ঐচ্ছিক)",
      orderOptionalLabel: "অর্ডার আইডি (ঐচ্ছিক)",
      accountLabel: "পেমেন্ট মাধ্যম",
      refNoLabel: "রেফারেন্স / TrxID",
      noteLabel: "নোট / বিবরণ",
      recordTxnBtn: "এন্ট্রি যোগ করুন",
      recordingTxnBtn: "সংরক্ষণ হচ্ছে...",
      ledgerTitle: "ক্যাশবুক ও খরচ লেজার (Mart_Transactions)",
      filterTypeLabel: "ধরন অনুযায়ী ফিল্টার",
      allTypesOption: "সকল লেনদেন",
      emptyLedger: "এখনো কোনো আর্থিক লেনদেন যুক্ত করা হয়নি। উপর থেকে মার্কেটিং খরচ বা সেটেলমেন্ট যোগ করুন।",
      colDate: "তারিখ",
      colTypeCategory: "ধরন ও বিবরণ",
      colPartyRef: "সাপ্লাইয়ার / অর্ডার / রেফ",
      colAccount: "অ্যাকাউন্ট",
      colAmount: "পরিমাণ",
      colAction: "অ্যাকশন",
      txnTypes: {
        marketing_expense: "মার্কেটিং ও বিজ্ঞাপন খরচ",
        operating_expense: "প্যাকেজিং ও পরিচালন খরচ",
        inventory_purchase: "নিজস্ব স্টক / মাল ক্রয়",
        return_shipping_loss: "রিটার্ন ও কুরিয়ার লস",
        supplier_payout: "সাপ্লাইয়ারকে পেমেন্ট প্রদান",
        dropship_receipt: "ড্রপশিপার থেকে পেমেন্ট গ্রহণ",
        other_income: "অন্যান্য আয়",
        other_expense: "অন্যান্য খরচ",
      },
      paymentAccounts: {
        Cash: "নগদ (Cash)",
        bKash: "বিকাশ (bKash)",
        Nagad: "নগদ (Nagad)",
        Bank: "ব্যাংক ট্রান্সফার",
      },
      msgTxnCreated: "আর্থিক এন্ট্রি Mart_Transactions-এ যুক্ত হয়েছে।",
      msgTxnUpdated: "আর্থিক লেনদেনটি Mart_Transactions-এ আপডেট হয়েছে।",
      msgTxnDeleted: "লেনদেনটি লেজার থেকে মুছে ফেলা হয়েছে।",
      errInvalidTxn: "অনুগ্রহ করে সঠিক তারিখ ও টাকার পরিমাণ লিখুন।",
      editTxnTitle: "ক্যাশবুক / খরচের এন্ট্রি এডিট করুন",
      saveTxnBtn: "পরিবর্তন সেভ করুন",
      cancelEdit: "এডিট বাতিল",
      csvHeaders: [
        "আইডি",
        "তারিখ",
        "ধরন",
        "ক্যাটাগরি",
        "টাকা (৳)",
        "অ্যাকাউন্ট",
        "সাপ্লাইয়ার আইডি",
        "অর্ডার আইডি",
        "রেফারেন্স",
        "নোট",
      ],
    },
    crm: {
      title: "ক্লায়েন্ট ৩৬০° CRM, ঝুঁকি স্কোরিং ও ফলোআপ হাব",
      subtitle:
        "অর্ডার ও রিটার্ন হারের ওপর ভিত্তি করে স্বয়ংক্রিয় VIP, নিয়মিত ও উচ্চ-ঝুঁকি লেভেল, কল/যোগাযোগ লগ, ট্যাগ এবং ফলোআপ রিমাইন্ডার।",
      addClientBtn: "+ নতুন ক্লায়েন্ট যোগ করুন",
      exportCsvBtn: "CRM CSV ডাউনলোড",
      searchPlaceholder: "ক্লায়েন্টের নাম, ফোন, ট্যাগ, ঠিকানা দিয়ে খুঁজুন...",
      filterAll: "সকল ক্লায়েন্ট",
      filterDue: "আজ/বকেয়া ফলোআপ",
      tiers: {
        auto: "স্বয়ংক্রিয় (Auto)",
        vip: "VIP",
        regular: "নিয়মিত",
        new: "নতুন",
        high_risk: "উচ্চ-ঝুঁকি",
        blocked: "ব্লকড",
      },
      statsVip: "VIP ক্লায়েন্ট",
      statsRegular: "নিয়মিত ক্রেতা",
      statsHighRisk: "উচ্চ-রিটার্ন ঝুঁকি",
      statsDueToday: "আজ/বকেয়া ফলোআপ",
      colClient: "ক্লায়েন্ট ও যোগাযোগ",
      colTierRisk: "টিয়ার ও ঝুঁকি",
      colOrdersReturns: "অর্ডার ও ডেলিভারি",
      colFinancials: "মোট খরচ ও লাভ",
      colFollowUpTags: "ট্যাগ ও ফলোআপ",
      colAction: "অ্যাকশন",
      emptyClients: "আপনার ফিল্টারের সাথে মিলে এমন কোনো ক্লায়েন্ট পাওয়া যায়নি।",
      successRateSuffix: "সফল",
      returnRateSuffix: "রিটার্ন/বাতিল",
      profitPrefix: "লাভ",
      dueTodayBadge: "আজ ফলোআপ",
      overdueBadge: "সময় পেরিয়েছে",
      open360Btn: "৩৬০° CRM খুলুন",
      manualClientModalTitle: "নতুন ক্লায়েন্ট প্রোফাইল তৈরি / আপডেট",
      nameLabel: "ক্লায়েন্টের নাম *",
      phoneLabel: "ফোন নম্বর *",
      altPhoneLabel: "বিকল্প নম্বর",
      emailLabel: "ইমেইল",
      addressLabel: "ঠিকানা",
      tierOverrideLabel: "টিয়ার / ঝুঁকি নির্ধারণ",
      tagsLabel: "কাস্টম ট্যাগ (কমা দিয়ে আলাদা)",
      tagsPlaceholder: "যেমন: কর্পোরেট-ক্রেতা, ঢাকা-রেগুলার, ভেরিফায়েড",
      followUpDateLabel: "পরবর্তী ফলোআপ তারিখ",
      followUpTaskLabel: "ফলোআপ কাজের বিবরণ",
      followUpTaskPlaceholder: "যেমন: ঠিকানা যাচাই কল বা পরবর্তী অর্ডার ফলোআপ",
      notesLabel: "CRM প্রোফাইল নোট",
      saveProfileBtn: "CRM প্রোফাইল সেভ করুন",
      savingProfileBtn: "সেভ হচ্ছে...",
      profileTitleSuffix: "৩৬০° CRM প্রোফাইল",
      callNowBtn: "কল করুন",
      emailNowBtn: "ইমেইল",
      timelineTitle: "যোগাযোগ ও কল লগ টাইমলাইন",
      logActionTitle: "নতুন কল / মেসেজ / ফলোআপ লগ লিখুন",
      channelLabel: "যোগাযোগের মাধ্যম",
      outcomeLabel: "ফলাফল / স্ট্যাটাস",
      summaryLabel: "আলোচনার সারসংক্ষেপ *",
      summaryPlaceholder: "যেমন: কাস্টমারের সাথে কথা হয়েছে, কাল ডেলিভারি নিতে রাজি...",
      nextFollowUpLabel: "পরবর্তী ফলোআপ তারিখ (ঐচ্ছিক)",
      relatedOrderLabel: "সংশ্লিষ্ট অর্ডার আইডি (ঐচ্ছিক)",
      addLogBtn: "যোগাযোগ লগ সেভ করুন",
      addingLogBtn: "সেভ হচ্ছে...",
      emptyLogs: "এখনো কোনো কল বা যোগাযোগের লগ সংরক্ষণ করা হয়নি।",
      orderHistoryTitle: "অর্ডার ও ডেলিভারির সম্পূর্ণ ইতিহাস",
      markDoneBtn: "সম্পন্ন",
      channels: {
        call: "ফোন কল",
        sms: "SMS / মেসেজ",
        email: "ইমেইল",
        meeting: "সরাসরি মিটিং",
        order_followup: "অর্ডার কনফার্মেশন কল",
        settlement_followup: "পেমেন্ট / হিসাব ফলোআপ",
        note: "অভ্যন্তরীণ নোট",
      },
      outcomes: {
        connected: "কথা হয়েছে",
        no_answer: "রিসিভ করেননি",
        promised_payment: "পেমেন্টের প্রতিশ্রুতি",
        confirmed: "অর্ডার নিশ্চিত",
        resolved: "সমাধান হয়েছে",
        escalated: "সমস্যা / পর্যালোচনা প্রয়োজন",
      },
      dashboardQueueTitle: "আজকের ও বকেয়া CRM ফলোআপ রিমাইন্ডার",
      dashboardQueueSubtitle: "ক্লায়েন্ট অর্ডার ভেরিফিকেশন এবং সাপ্লাইয়ার সেটেলমেন্ট ফলোআপ তালিকা।",
      dashboardQueueEmpty: "কোনো বকেয়া ক্লায়েন্ট বা সাপ্লাইয়ার ফলোআপ বাকি নেই।",
      entityCustomer: "ক্লায়েন্ট",
      entitySupplier: "সাপ্লাইয়ার",
      openProfileBtn: "প্রোফাইল খুলুন",
      netProfitKpi: "নিট ব্যবসায়িক লাভ",
      payableKpi: "সাপ্লাইয়ার বকেয়া",
      receivableKpi: "ড্রপশিপার পাওনা",
      msgProfileSaved: "CRM প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে।",
      msgProfileDeleted: "CRM প্রোফাইল মুছে ফেলা হয়েছে।",
      msgLogAdded: "যোগাযোগ লগ CRM টাইমলাইনে যুক্ত হয়েছে।",
      msgLogUpdated: "যোগাযোগ লগ আপডেট করা হয়েছে।",
      msgLogDeleted: "যোগাযোগ লগ মুছে ফেলা হয়েছে।",
      msgFollowUpCleared: "ফলোআপ টাস্ক সম্পন্ন হিসেবে চিহ্নিত হয়েছে।",
      errProfileFields: "ক্লায়েন্টের নাম এবং মোবাইল নম্বর দেওয়া আবশ্যক।",
      errLogSummary: "অনুগ্রহ করে আলোচনার একটি সংক্ষিপ্ত সারসংক্ষেপ লিখুন।",
      editLogBtn: "এডিট",
      saveLogBtn: "লগ সেভ করুন",
      cancelEditLogBtn: "বাতিল",
      deleteProfileBtn: "প্রোফাইল মুছুন",
      confirmDeleteProfile: "নিশ্চিত প্রোফাইল মুছবেন?",
      csvHeaders: [
        "নাম",
        "মোবাইল",
        "ইমেইল",
        "ঠিকানা",
        "টিয়ার",
        "মোট অর্ডার",
        "সফল ডেলিভারি",
        "রিটার্ন/বাতিল",
        "ডেলিভারি সফলতা %",
        "মোট খরচ (৳)",
        "লাভ অবদান (৳)",
        "ট্যাগসমূহ",
        "পরবর্তী ফলোআপ",
        "ফলোআপ টাস্ক",
      ],
    },
    variations: {
      sectionTitle: "কালার ও সাইজ ভ্যারিয়েশন, একাধিক ছবি গ্যালারি এবং পাইকারি মূল্য",
      sectionSubtitle: "পোশাক, জুতা বা প্রযোজ্য পণ্যের জন্য ঐচ্ছিক — সাধারণ পণ্যে ফাঁকা রাখা যাবে।",
      toggleBuilderBtn: "কালার, সাইজ ও পাইকারি রেট",
      galleryTitle: "অতিরিক্ত গ্যালারি ছবি (একাধিক ছবি)",
      galleryHint: "অতিরিক্ত অ্যাঙ্গেলের ছবি আপলোড করুন। কাস্টমার থাম্বনেইল দেখতে ও কালার অনুযায়ী ছবি বদলাতে পারবে।",
      addImageUrlPlaceholder: "অতিরিক্ত ছবির লিংক দিন (https://...)",
      addImageBtn: "লিংক যোগ",
      uploadGalleryBtn: "Drive-এ গ্যালারি ছবি আপলোড",
      primaryImageLabel: "মূল ছবি",
      colorsTitle: "কালার সোয়াচসমূহ",
      addColorBtn: "+ নতুন কালার",
      colorNameEnLabel: "কালার (ইংরেজি)",
      colorNameEnPlaceholder: "যেমন: Black",
      colorNameBnLabel: "কালার (বাংলা)",
      colorNameBnPlaceholder: "যেমন: কালো",
      colorHexLabel: "রং",
      colorImageLabel: "এই কালারের ছবির লিংক (ঐচ্ছিক)",
      sizesLabel: "সাইজ তালিকা (কমা দিয়ে আলাদা)",
      sizesPlaceholder: "যেমন: S, M, L, XL, XXL অথবা 38, 40, 42",
      generateMatrixBtn: "কালার × সাইজ ম্যাট্রিক্স তৈরি করুন",
      clearMatrixBtn: "ম্যাট্রিক্স মুছুন",
      matrixTitle: "কালার × সাইজ প্রাইস ও স্টক ম্যাট্রিক্স (ঐচ্ছিক)",
      matrixHint: "মূল পণ্যের দাম ব্যবহার করতে চাইলে Price বা Cost ঘরে 0 রাখুন।",
      colCombination: "কালার / সাইজ",
      colVariantSku: "ভ্যারিয়েন্ট SKU",
      colPriceOverride: "ভিন্ন বিক্রয় মূল্য (৳)",
      colCostOverride: "ভিন্ন ক্রয়মূল্য (৳)",
      colStock: "স্টক",
      colActive: "সক্রিয়",
      wholesaleTitle: "পাইকারি / বাল্ক অর্ডার রেট (ঐচ্ছিক)",
      wholesaleMinQtyLabel: "ন্যূনতম পাইকারি পরিমাণ",
      wholesalePriceLabel: "পাইকারি একক মূল্য (৳)",
      wholesaleHint: "ক্রেতা এই পরিমাণ বা তার বেশি অর্ডার করলে স্বয়ংক্রিয়ভাবে পাইকারি রেট কার্যকর হবে।",
      wholesaleCardHintPrefix: "পাইকারি",
      wholesaleActiveBadge: "পাইকারি রেট প্রযোজ্য হয়েছে",
      wholesaleUnlockPrefix: "ন্যূনতম",
      wholesaleUnlockMiddle: "+ পিস কিনলে",
      wholesaleUnitSuffix: "/ পিস",
      selectColorLabel: "কালার",
      selectSizeLabel: "সাইজ",
      selectedVariantOutOfStock: "নির্বাচিত এই কালার/সাইজটি বর্তমানে স্টকে নেই।",
      colorsCountSuffix: "টি কালার",
      sizesCountSuffix: "টি সাইজ",
    },
    coupons: {
      title: "ডিসকাউন্ট কুপন ও প্রমো কোড (Mart_Coupons)",
      subtitle: "শতকরা (%) বা নির্দিষ্ট টাকা (৳) ডিসকাউন্ট কুপন, ন্যূনতম অর্ডার শর্ত, ব্যবহার সীমা ও মেয়াদ নির্ধারণ করুন।",
      addTitle: "নতুন ডিসকাউন্ট কুপন তৈরি করুন",
      codeLabel: "কুপন কোড *",
      codePlaceholder: "যেমন: WINTER10 বা EID200",
      discountTypeLabel: "ডিসকাউন্টের ধরন",
      percentOption: "শতকরা (%)",
      fixedOption: "নির্দিষ্ট টাকা (৳)",
      discountValueLabel: "ডিসকাউন্ট পরিমাণ *",
      maxDiscountLabel: "সর্বোচ্চ ডিসকাউন্ট সীমা (৳)",
      minOrderLabel: "ন্যূনতম অর্ডার মূল্য (৳)",
      expiryDateLabel: "শেষ হওয়ার তারিখ",
      usageLimitLabel: "ব্যবহার সীমা (0 = আনলিমিটেড)",
      notesLabel: "ক্যাম্পেইন নোট",
      notesPlaceholder: "যেমন: শীতকালীন কালেকশন বিশেষ ছাড়",
      createBtn: "কুপন প্রকাশ করুন",
      creatingBtn: "প্রকাশ হচ্ছে...",
      editTitle: "ডিসকাউন্ট কুপন এডিট করুন",
      saveBtn: "কুপন আপডেট করুন",
      savingBtn: "আপডেট হচ্ছে...",
      cancelEdit: "এডিট বাতিল",
      activeCheckbox: "কুপন সক্রিয় (চেকআউটে ব্যবহারযোগ্য)",
      emptyTitle: "এখনো কোনো কুপন কোড তৈরি করা হয়নি। উপর থেকে প্রথম ডিসকাউন্ট কুপন তৈরি করুন।",
      colCode: "কুপন কোড",
      colOffer: "ডিসকাউন্ট অফার",
      colRules: "শর্তাবলি",
      colUsage: "ব্যবহৃত / সীমা",
      colStatus: "অবস্থা",
      colActions: "অ্যাকশন",
      unlimitedUsage: "আনলিমিটেড",
      noMinOrder: "শর্ত নেই",
      noExpiry: "মেয়াদহীন",
      minOrderPrefix: "ন্যূনতম",
      maxCapPrefix: "সর্বোচ্চ",
      checkoutLabel: "কুপন / প্রমো কোড",
      checkoutPlaceholder: "কুপন কোড লিখুন (যেমন: WINTER10)",
      applyBtn: "প্রয়োগ করুন",
      applyingBtn: "যাচাই হচ্ছে...",
      removeBtn: "বাতিল",
      appliedPrefix: "কুপন যুক্ত হয়েছে",
      discountRowLabel: "কুপন ছাড়",
      msgCreated: "কুপন কোড Mart_Coupons-এ তৈরি হয়েছে।",
      msgUpdated: "কুপনের স্ট্যাটাস আপডেট হয়েছে।",
      msgEdited: "কুপন কোড Mart_Coupons-এ আপডেট হয়েছে।",
      msgDeleted: "কুপন মুছে ফেলা হয়েছে।",
      errMissingCode: "সঠিক কুপন কোড এবং ধনাত্মক ডিসকাউন্ট মান লিখুন।",
      errReasons: {
        MISSING_COUPON_CODE: "অনুগ্রহ করে একটি সঠিক কুপন কোড লিখুন।",
        COUPON_NOT_FOUND: "এই কুপন কোডটি পাওয়া যায়নি।",
        COUPON_INACTIVE: "এই কুপন কোডটি বর্তমানে বন্ধ রয়েছে।",
        COUPON_EXPIRED: "এই কুপন কোডের মেয়াদ শেষ হয়ে গেছে।",
        COUPON_LIMIT_REACHED: "এই কুপন কোডটির ব্যবহার সীমা পূর্ণ হয়ে গেছে।",
        COUPON_MIN_ORDER_NOT_MET: "এই কুপনের জন্য ন্যূনতম অর্ডার মূল্য পূর্ণ হয়নি।",
        DEFAULT: "কুপন কোডটি প্রয়োগ করা যায়নি।",
      },
    },
    qrPayment: {
      adminSectionTitle: "অফিশিয়াল বিকাশ মার্চেন্ট QR ও Bangla QR পেমেন্ট সেটআপ",
      adminSectionSubtitle: "আপনার অফিশিয়াল বিকাশ মার্চেন্ট ও Bangla QR কোড ছবি Google Drive-এ আপলোড করুন যাতে ক্রেতারা স্ক্যান বা ডাউনলোড করতে পারেন।",
      bkashQrUrlLabel: "অফিশিয়াল বিকাশ মার্চেন্ট QR কোড ছবির লিংক",
      bkashMerchantLabel: "বিকাশ মার্চেন্ট পেমেন্ট নম্বর",
      bkashMerchantPlaceholder: "যেমন: 017XXXXXXXX",
      banglaQrUrlLabel: "অফিশিয়াল Bangla QR কোড ছবির লিংক (সব ব্যাংক ও MFS)",
      banglaQrAccountLabel: "Bangla QR মার্চেন্ট নাম / বিবরণ",
      banglaQrAccountPlaceholder: "যেমন: Xeetrix Mart · National Bangla QR",
      uploadQrBtn: "Drive-এ QR আপলোড",
      qrUploadedMsg: "QR কোড ছবি Google Drive-এ আপলোড সম্পন্ন হয়েছে।",
      checkoutOnlineOption: "অনলাইন / QR পেমেন্ট",
      selectQrTypeLabel: "অনলাইন ও QR পেমেন্ট মাধ্যম নির্বাচন করুন",
      bkashQrTab: "বিকাশ মার্চেন্ট QR",
      banglaQrTab: "Bangla QR (ব্যাংক ও MFS)",
      manualMobileTab: "নগদ / রকেট",
      scanPayTitle: "QR স্ক্যান করুন অথবা ছবি ডাউনলোড করে অ্যাপ থেকে পেমেন্ট করুন",
      amountToPayLabel: "প্রদেয় টাকা",
      merchantNoLabel: "মার্চেন্ট নম্বর",
      copyNoBtn: "কপি করুন",
      copiedNoBtn: "কপি হয়েছে",
      downloadQrBtn: "QR ছবি ডাউনলোড",
      noQrConfiguredHint: "QR ছবি এখনো সেটআপ করা হয়নি। নিচের নম্বর ব্যবহার করুন অথবা ক্যাশ অন ডেলিভারি নিন।",
      trxRequiredHint: "পেমেন্ট করার পর দ্রুত ভেরিফিকেশনের জন্য TrxID লিখুন।",
      qrHelpText: "বিকাশ, নগদ, রকেট, সেলফিন বা যেকোনো ব্যাংক অ্যাপে Scan / Gallery Upload দিয়ে পেমেন্ট করা যাবে।",
    },
  },
};
