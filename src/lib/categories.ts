export type Category = {
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  query: string;
};

export const CATEGORIES: Category[] = [
  {
    slug: 'chandeliers',
    name: 'Chandeliers',
    description: 'Statement crystal, glass and modern chandeliers that anchor a room.',
    query: '(product_type:"Chandelier" OR product_type:"Chandeliers" OR product_type:"Antique Chandelier" OR product_type:"Ceiling Mount Chandelier" OR product_type:"Crystal Chandelier" OR product_type:"Dining Chandelier" OR product_type:"Double Height Chandelier" OR product_type:"Glass Chandelier" OR product_type:"Glass Crystal Chandelier" OR product_type:"Glass Leaf Chandelier" OR product_type:"Glass Pipe Chandelier" OR product_type:"Modern Chandelier" OR product_type:"Ring Chandelier" OR product_type:"Single Height Chandelier" OR tag:"jhoomer" OR tag:"jhoomar" OR tag:"jhumer") -product_type:"Chandelier Ceiling Fan" -product_type:"Chandelier Cleaner"',
  },
  {
    slug: 'wall-lights',
    name: 'Wall Lights',
    description: 'Sconces, mirror lights and up-down washes for warm, layered walls.',
    query: '(product_type:"Wall Lights" OR product_type:"Wall lamp" OR product_type:"Mirror Wall Light" OR product_type:"Mirror Light" OR product_type:"Up Down" OR tag:"wall light" OR tag:"sconce light" OR tag:"picture light") -product_type:"Outdoor wall light" -product_type:"Facade Light" -product_type:"Facade" -tag:"outdoor"',
  },
  {
    slug: 'hanging-pendant',
    name: 'Hanging & Pendant',
    shortName: 'Pendants',
    description: 'Pendant and hanging lights for dining nooks, islands and stairwells.',
    query: 'product_type:"Hanging Light" OR tag:"pendant" OR tag:"pendant light" OR tag:"hanging light" OR tag:"drop light" OR tag:"Ceiling Hanging Lights"',
  },
  {
    slug: 'outdoor-garden',
    name: 'Outdoor & Garden',
    shortName: 'Outdoor',
    description: 'Facade, gate, bollard and garden lighting built for the elements.',
    query: 'product_type:"Outdoor wall light" OR product_type:"Facade" OR product_type:"Facade Light" OR product_type:"Garden Lights" OR product_type:"Gate light" OR product_type:"Bollard Lights" OR product_type:"Step Light" OR product_type:"Flood Light" OR product_type:"STREET-LIGHT" OR product_type:"Burial Lights" OR product_type:"Foot Lights" OR product_type:"High Bay Lighting" OR product_type:"Par Light" OR tag:"outdoor" OR tag:"garden" OR tag:"solar light" OR tag:"spike light" OR tag:"Path Light" OR tag:"swimming pool"',
  },
  {
    slug: 'ceiling-fans',
    name: 'Ceiling Fans',
    description: 'Chandelier ceiling fans — moving air without giving up sparkle.',
    query: 'product_type:"Chandelier Ceiling Fan" OR tag:"ceiling fan" OR tag:"chandelier fan"',
  },
  {
    slug: 'spotlights-track',
    name: 'Spotlights & Track',
    shortName: 'Spot & Track',
    description: 'COB spotlights and magnetic track systems for precise, directed light.',
    query: 'product_type:"Spotlight" OR product_type:"LED Spotlights" OR product_type:"Track Lights" OR tag:"spotlight" OR tag:"track light" OR tag:"magnetic" OR tag:"concealed spotlight" OR title:magnetic* OR title:track*',
  },
  {
    slug: 'led-strips-panels',
    name: 'LED Strips & Panels',
    shortName: 'Strips & Panels',
    description: 'Strip, profile and panel lighting for coves, ceilings and workspaces.',
    query: 'product_type:"LED STRIP LIGHTS" OR product_type:"LED Panel" OR product_type:"Led" OR product_type:"LED Hanging Profile Lights" OR tag:"led strip" OR tag:"strip light" OR tag:"profile light" OR tag:"cove light" OR tag:"rope light" OR tag:"led panel"',
  },
  {
    slug: 'table-floor-lamps',
    name: 'Table & Floor Lamps',
    shortName: 'Lamps',
    description: 'Table and floor lamps for reading corners and soft evening light.',
    query: '(product_type:"Table Lamp" OR product_type:"Lamps" OR tag:"table lamp" OR tag:"floor lamp" OR tag:"bedside light" OR tag:"reading light") -tag:"Furniture"',
  },
  {
    slug: 'ceiling-lights',
    name: 'Ceiling Lights',
    description: 'Flush mounts and surface lights for clean, even overhead light.',
    query: '(tag:"ceiling light" OR tag:"flush mount" OR tag:"Down light" OR tag:"roof light" OR tag:"false ceiling") -product_type:"Chandelier Ceiling Fan"',
  },
  {
    slug: 'festive-temple',
    name: 'Festive & Temple',
    shortName: 'Festive',
    description: 'String lights, diyas and temple lighting for celebrations.',
    query: 'product_type:"Festive Light" OR product_type:"Temple Lights" OR product_type:"Diye" OR tag:"festive" OR tag:"diwali" OR tag:"diwali ladi" OR tag:"ladi" OR tag:"fairy light" OR tag:"LED String Light" OR tag:"christmas" OR tag:"curtain" OR tag:"temple"',
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
