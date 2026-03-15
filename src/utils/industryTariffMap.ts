import { IndustryCategory, TariffSectors } from '../types'

export const INDUSTRY_TARIFF_MAP: Record<IndustryCategory, {
  label: string;
  description: string;
  raw_materials: (keyof TariffSectors)[];
  components: (keyof TariffSectors)[];
  finished_goods: (keyof TariffSectors)[];
}> = {
  automotive: {
    label: 'Automotive',
    description: 'Vehicle assembly, parts & components',
    raw_materials: ['base_metals', 'chemicals'],
    components: ['machinery_electrical'],
    finished_goods: ['transportation'],
  },
  aerospace_defense: {
    label: 'Aerospace & Defense',
    description: 'Aircraft, defense systems & precision parts',
    raw_materials: ['base_metals', 'chemicals'],
    components: ['machinery_electrical'],
    finished_goods: ['transportation', 'machinery_electrical'],
  },
  electronics: {
    label: 'Electronics',
    description: 'Consumer & industrial electronics, semiconductors',
    raw_materials: ['base_metals', 'chemicals'],
    components: ['machinery_electrical'],
    finished_goods: ['machinery_electrical'],
  },
  textiles_apparel: {
    label: 'Textiles & Apparel',
    description: 'Clothing, fabrics, yarn & technical textiles',
    raw_materials: ['agriculture_food', 'chemicals'],
    components: ['textiles_apparel'],
    finished_goods: ['textiles_apparel'],
  },
  food_beverage: {
    label: 'Food & Beverage',
    description: 'Food processing, beverages & agricultural goods',
    raw_materials: ['agriculture_food'],
    components: ['machinery_electrical'],
    finished_goods: ['agriculture_food'],
  },
  chemicals: {
    label: 'Chemicals & Plastics',
    description: 'Specialty chemicals, plastics & rubber',
    raw_materials: ['chemicals', 'base_metals'],
    components: ['chemicals', 'machinery_electrical'],
    finished_goods: ['chemicals'],
  },
  metals_materials: {
    label: 'Metals & Materials',
    description: 'Steel, aluminum, mining & advanced materials',
    raw_materials: ['base_metals', 'stone_glass'],
    components: ['base_metals', 'chemicals'],
    finished_goods: ['base_metals'],
  },
  medical_devices: {
    label: 'Medical Devices',
    description: 'Medical equipment, instruments & diagnostics',
    raw_materials: ['base_metals', 'chemicals'],
    components: ['machinery_electrical'],
    finished_goods: ['machinery_electrical'],
  },
  consumer_goods: {
    label: 'Consumer Goods',
    description: 'Household products, appliances & durable goods',
    raw_materials: ['base_metals', 'chemicals', 'wood_paper'],
    components: ['machinery_electrical'],
    finished_goods: ['machinery_electrical', 'stone_glass'],
  },
  energy: {
    label: 'Energy',
    description: 'Power generation, oil & gas, renewables',
    raw_materials: ['base_metals', 'chemicals'],
    components: ['machinery_electrical'],
    finished_goods: ['machinery_electrical'],
  },
  general_manufacturing: {
    label: 'General Manufacturing',
    description: 'Diversified industrial manufacturing',
    raw_materials: ['base_metals', 'chemicals'],
    components: ['machinery_electrical'],
    finished_goods: ['machinery_electrical', 'transportation'],
  },
}

export const SECTOR_LABELS: Record<keyof TariffSectors, string> = {
  agriculture_food: 'Agriculture & Food',
  textiles_apparel: 'Textiles & Apparel',
  base_metals: 'Base Metals (Steel/Aluminum)',
  chemicals: 'Chemicals & Plastics',
  machinery_electrical: 'Machinery & Electronics',
  transportation: 'Vehicles & Transport',
  wood_paper: 'Wood & Paper',
  stone_glass: 'Stone, Cement & Glass',
}

export const INDUSTRY_LABELS: Record<IndustryCategory, string> = Object.fromEntries(
  (Object.entries(INDUSTRY_TARIFF_MAP) as [IndustryCategory, { label: string }][]).map(
    ([k, v]) => [k, v.label]
  )
) as Record<IndustryCategory, string>
