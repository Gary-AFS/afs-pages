// src/tabs/MetaAds.test.tsx
import { render, screen } from "@testing-library/react";
import { MetaAds } from "./MetaAds";
import { DateRangeProvider } from "../state/DateRangeContext";

const data: any = { meta: { "30d": { kpis: { spend: 5000, roas: 4.2 }, deltas: {}, campaigns: [{ name: "GAF Prospecting", spend: 5000, roas: 4.2 }], adsets: [], ads: [], daily: [] } } };

test("renders Meta KPIs and a campaign row", () => {
  render(<DateRangeProvider><MetaAds data={data} /></DateRangeProvider>);
  expect(screen.getByText("GAF Prospecting")).toBeInTheDocument();
});
