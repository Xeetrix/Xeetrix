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
    msgTxnDeleted: string;
    errInvalidTxn: string;
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
    msgLogAdded: string;
    msgFollowUpCleared: string;
    errProfileFields: string;
    errLogSummary: string;
    csvHeaders: string[];
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
      msgTxnDeleted: "Transaction deleted from ledger.",
      errInvalidTxn: "Please provide a valid date and positive amount.",
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
      msgLogAdded: "Interaction log saved to CRM timeline.",
      msgFollowUpCleared: "Follow-up marked as completed.",
      errProfileFields: "Client name and phone number are required.",
      errLogSummary: "Please enter a brief interaction summary.",
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
      msgTxnDeleted: "লেনদেনটি লেজার থেকে মুছে ফেলা হয়েছে।",
      errInvalidTxn: "অনুগ্রহ করে সঠিক তারিখ ও টাকার পরিমাণ লিখুন।",
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
      msgLogAdded: "যোগাযোগ লগ CRM টাইমলাইনে যুক্ত হয়েছে।",
      msgFollowUpCleared: "ফলোআপ টাস্ক সম্পন্ন হিসেবে চিহ্নিত হয়েছে।",
      errProfileFields: "ক্লায়েন্টের নাম এবং মোবাইল নম্বর দেওয়া আবশ্যক।",
      errLogSummary: "অনুগ্রহ করে আলোচনার একটি সংক্ষিপ্ত সারসংক্ষেপ লিখুন।",
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
  },
};
