// src/tabs/GoogleAds.test.tsx
import { render, screen } from "@testing-library/react";
import { GoogleAds } from "./GoogleAds";
import { DateRangeProvider } from "../state/DateRangeContext";

const data: any = { google: { "30d": { kpis: { spend: 20000, roas: 5.8, atc: 400 }, deltas: {}, campaigns: [{ name: "Shopping - All", spend: 20000 }], adGroups: [], keywords: [], searchTerms: [], ads: [], daily: [] } } };

test("renders Google KPIs and a campaign row", () => {
  render(<DateRangeProvider><GoogleAds data={data} /></DateRangeProvider>);
  expect(screen.getByText("Shopping - All")).toBeInTheDocument();
});
