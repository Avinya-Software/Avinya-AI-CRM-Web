import React, { useState } from "react";
import { Tabs } from "antd";
import LeadPipelineReport from "./reports/LeadPipelineReport";
import ClientRevenueReport from "./reports/ClientRevenueReport";
import QuotationReport from "./reports/QuotationReport";
import OrderReport from "./reports/OrderReport";
import FinanceReport from "./reports/FinanceReport";

const ReportsOverview: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-100 px-6">
        <Tabs
          defaultActiveKey="1"
          size="large"
          className="reports-tabs"
          items={[
            {
              key: "1",
              label: <span className="font-semibold">Lead Report</span>,
              children: (
                <div className="min-h-screen bg-slate-50 -mx-6 -mt-4">
                  <LeadPipelineReport />
                </div>
              ),
            },
            {
              key: "2",
              label: <span className="font-semibold">Client Revenue</span>,
              children: (
                <div className="min-h-screen bg-slate-50 -mx-6 -mt-4">
                  <ClientRevenueReport />
                </div>
              ),
            },
            {
              key: "3",
              label: <span className="font-semibold">Quotations</span>,
              children: (
                <div className="min-h-screen bg-slate-50 -mx-6 -mt-4">
                  <QuotationReport />
                </div>
              ),
            },
            {
              key: "4",
              label: <span className="font-semibold">Orders</span>,
              children: (
                <div className="min-h-screen bg-slate-50 -mx-6 -mt-4">
                  <OrderReport />
                </div>
              ),
            },
            {
              key: "5",
              label: <span className="font-semibold">Financials</span>,
              children: (
                <div className="min-h-screen bg-slate-50 -mx-6 -mt-4">
                  <FinanceReport />
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default ReportsOverview;
