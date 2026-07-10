// src/tabs/Axon.test.tsx
import { render, screen } from "@testing-library/react";
import { Axon } from "./Axon";
import { DateRangeProvider } from "../state/DateRangeContext";
const data: any = { axon: { "30d": { kpis: { spend: 350, sales: 1200, roas: 3.4 }, deltas: {}, campaigns: [{ name: "GAF AU Conversion", spend: 350 }], creativeSets: [{ name: "C20_Review_SocialProof_HomeGym_v01", spend: 90 }], daily: [] } } };
test("renders Axon creative set and learning caveat", () => {
  render(<DateRangeProvider><Axon data={data} /></DateRangeProvider>);
  expect(screen.getByText(/C20_Review_SocialProof/)).toBeInTheDocument();
  expect(screen.getByText(/learning/i)).toBeInTheDocument();
});
