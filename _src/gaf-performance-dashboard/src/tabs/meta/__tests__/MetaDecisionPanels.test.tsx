// src/tabs/meta/__tests__/MetaDecisionPanels.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CampaignTierPanel, BudgetAtRiskPanel, ScaleWinnersPanel } from "../MetaDecisionPanels";
import type { MetaEntityRow, MetaKpis } from "../../../lib/data";

const winCampaign: MetaEntityRow = {
  campaignId: "1",
  campaign: "Win Campaign",
  objective: "OUTCOME_SALES",
  spend: 1000,
  roas: 5.0,
  ctr: 2.0,
  cpm: 10,
  conversions: 20,
  convValue: 5000,
};

const wasteCampaign: MetaEntityRow = {
  campaignId: "2",
  campaign: "Waste Campaign",
  objective: "OUTCOME_SALES",
  spend: 500,
  roas: 0.3,
  ctr: 0.1,
  cpm: 40,
  conversions: 1,
  convValue: 150,
};

const watchCampaign: MetaEntityRow = {
  campaignId: "3",
  campaign: "Watch Campaign",
  objective: "OUTCOME_SALES",
  spend: 200,
  roas: 2.5,
  ctr: 1.0,
  cpm: 20,
  conversions: 5,
  convValue: 500,
};

const winAdSet: MetaEntityRow = {
  adsetId: "a1",
  adset: "Scale Winner Ad Set",
  spend: 500,
  roas: 6.0,
  ctr: 3.0,
  conversions: 5,
  convValue: 3000,
};

describe("CampaignTierPanel", () => {
  it("renders tier breakdown", () => {
    render(<CampaignTierPanel campaigns={[winCampaign, wasteCampaign, watchCampaign]} />);
    expect(screen.getByText("Win")).toBeTruthy();
    expect(screen.getByText("Watch")).toBeTruthy();
    expect(screen.getByText("Waste")).toBeTruthy();
  });

  it("renders nothing with empty campaigns", () => {
    const { container } = render(<CampaignTierPanel campaigns={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("BudgetAtRiskPanel", () => {
  it("renders budget at risk when waste campaigns exist", () => {
    render(<BudgetAtRiskPanel campaigns={[winCampaign, wasteCampaign]} />);
    expect(screen.getByText(/budget at risk/i)).toBeTruthy();
    expect(screen.getByText(/waste campaign/i)).toBeTruthy();
  });

  it("renders nothing when no waste campaigns", () => {
    const { container } = render(<BudgetAtRiskPanel campaigns={[winCampaign]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing with empty campaigns", () => {
    const { container } = render(<BudgetAtRiskPanel campaigns={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("ScaleWinnersPanel", () => {
  const kpis: MetaKpis = { roas: 3.0 };

  it("renders scale winners ad sets", () => {
    render(<ScaleWinnersPanel adsets={[winAdSet]} kpis={kpis} />);
    expect(screen.getByText("Scale Winners")).toBeTruthy();
    expect(screen.getByText("Scale Winner Ad Set")).toBeTruthy();
  });

  it("renders nothing when no qualifying ad sets", () => {
    const lowAdSet: MetaEntityRow = { adsetId: "x", adset: "Low", spend: 100, roas: 1.0, conversions: 1 };
    const { container } = render(<ScaleWinnersPanel adsets={[lowAdSet]} kpis={kpis} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing with empty adsets", () => {
    const { container } = render(<ScaleWinnersPanel adsets={[]} kpis={kpis} />);
    expect(container.firstChild).toBeNull();
  });
});
