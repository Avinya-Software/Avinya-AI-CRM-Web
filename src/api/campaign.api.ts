// src/api/campaign.api.ts
import api from "./axios";

/*   GET CAMPAIGNS (PAGINATED)   */

export const getCampaignsApi = async (
  pageNumber: number,
  pageSize: number,
  search: string
) => {
  const res = await api.get("/campaigns", {
    params: { pageNumber, pageSize, search },
  });
  return res.data;
};

/*   GET CAMPAIGN BY ID   */

export const getCampaignByIdApi = async (campaignId: string) => {
  const res = await api.get(`/campaigns/${campaignId}`);
  return res.data;
};

/*   CREATE CAMPAIGN   */

export const createCampaignApi = async (data: {
  campaign: any;
  templates: any[];
  customerIds?: string[];
}) => {
  const res = await api.post("/campaigns", data);
  return res.data;
};

/*   UPDATE CAMPAIGN   */

export const updateCampaignApi = async (
  campaignId: string,
  data: {
    campaign: any;
    templates: any[];
    customerIds?: string[];
  }
) => {
  const res = await api.put(`/campaigns/${campaignId}`, data);
  return res.data;
};

/*   DELETE CAMPAIGN   */

export const deleteCampaignApi = async (campaignId: string) => {
  const res = await api.delete(`/campaigns/${campaignId}`);
  return res.data;
};

/*   CAMPAIGN DROPDOWN   */

export const getCampaignDropdownApi = async () => {
  const res = await api.get<
    { campaignId: string; name: string }[]
  >("/campaigns/dropdown");

  return res.data;
};

/*   CAMPAIGN TYPE DROPDOWN   */

export const getCampaignTypeDropdownApi = async () => {
  const res = await api.get<
    { campaignTypeId: number; name: string }[]
  >("/campaigns/campaign-types/dropdown");

  return res.data;
};