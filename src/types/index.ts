export interface CountryScores {
  business_environment: number | null;
  political_stability: number | null;
  govt_effectiveness: number | null;
  regulatory_quality: number | null;
  rule_of_law: number | null;
  corruption_control: number | null;
  voice_accountability: number | null;
}

export interface BreadyData {
  composite: number | null;
  regulatory_framework: number | null;
  public_services: number | null;
  operational_efficiency: number | null;
  business_entry: number | null;
  business_location: number | null;
  utility_services: number | null;
  labor: number | null;
  financial_services: number | null;
  international_trade: number | null;
  taxation: number | null;
  dispute_resolution: number | null;
  market_competition: number | null;
  business_insolvency: number | null;
}

export interface TradeData {
  tariff_rate_weighted_mean: number | null;
  tariff_rate_simple_mean: number | null;
  tariff_bound_mean: number | null;
  tariff_overhang: number | null;
  trade_pct_gdp: number | null;
  merchandise_exports_usd: number | null;
  merchandise_imports_usd: number | null;
  trade_balance_usd: number | null;
  logistics_performance_index: number | null;
}

export interface DataSource {
  label: string;
  year: number;
  coverage: number;
  url: string;
}

export interface DataFreshness {
  generated_utc: string;
  sources: Record<string, DataSource>;
}

export interface EconomicData {
  gdp_usd: number | null;
  gdp_growth_pct: number | null;
  gdp_per_capita: number | null;
  population: number | null;
  fdi_pct_gdp: number | null;
  corporate_tax_rate: number | null;
  cpi_score: number | null;
  birth_rate: number | null;
  birth_rate_history: [number, number][];  // [[year, value], ...]
}

export interface Country {
  code: string;
  name: string;
  region: string;
  income_level: string;
  capital: string;
  lat: string;
  lon: string;
  overall_score: number | null;
  scores: CountryScores;
  bready: BreadyData;
  economic: EconomicData;
  trade: TradeData;
}

export type ScoreCategory = 'overall' | 'business_environment' | 'political_stability' | 'rule_of_law' | 'corruption_control' | 'govt_effectiveness';

export interface NewsSource {
  name: string;
  url: string;
  type: 'general' | 'financial' | 'business' | 'government';
}

export interface FilterState {
  region: string;
  incomeLevel: string;
  minScore: number;
  maxScore: number;
  sortBy: ScoreCategory;
}
