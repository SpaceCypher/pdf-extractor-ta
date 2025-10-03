// Pre-processed example data for demonstration
export interface ExampleResult {
  markdown: string;
  elements: Array<{
    id: string;
    type: 'title' | 'header' | 'text' | 'table' | 'image' | 'list';
    content: string;
    bbox: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      page: number;
    };
    page: number;
    confidence: number;
  }>;
  metadata: {
    total_pages: number;
    total_elements: number;
    confidence_avg: number;
    processing_time: number;
    model_used: string;
    by_type: Record<string, number>;
  };
  processing_time: number;
  model: string;
}

export const exampleResults: Record<string, Record<string, ExampleResult>> = {
  'financial-report': {
    'docling': {
      markdown: `# QUARTERLY REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934

## Company Overview

TechCorp Inc. is a leading technology company specializing in cloud computing and artificial intelligence solutions. This quarterly report provides an overview of our financial performance for Q3 2024.

## Financial Highlights

- **Revenue**: $2.4 billion (up 15% YoY)
- **Net Income**: $456 million (up 22% YoY)  
- **Operating Margin**: 19.2%
- **Cash and Cash Equivalents**: $8.7 billion

| Metric | Q3 2024 | Q3 2023 | Change |
|--------|---------|---------|---------|
| Revenue | $2,400M | $2,087M | +15.0% |
| Gross Profit | $1,680M | $1,461M | +15.0% |
| Operating Income | $461M | $375M | +22.9% |
| Net Income | $456M | $374M | +21.9% |

## Business Segments

### Cloud Services
Our cloud services division continues to show strong growth with revenue of $1.8 billion, representing 75% of total revenue.

### AI Solutions  
AI solutions generated $600 million in revenue, growing 35% year-over-year as enterprise adoption accelerates.

## Risk Factors

The following risk factors may materially affect our business:
- Increased competition in cloud computing
- Regulatory changes affecting data privacy
- Economic uncertainty and potential recession
- Cybersecurity threats and data breaches

## Forward-Looking Statements

This report contains forward-looking statements based on current expectations and assumptions. Actual results may differ materially from those projected.`,
      
      elements: [
        {
          id: 'title_1_1',
          type: 'title',
          content: 'QUARTERLY REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934',
          bbox: { x1: 72, y1: 720, x2: 540, y2: 750, page: 1 },
          page: 1,
          confidence: 0.98
        },
        {
          id: 'header_1_2',
          type: 'header',
          content: 'Company Overview',
          bbox: { x1: 72, y1: 680, x2: 200, y2: 700, page: 1 },
          page: 1,
          confidence: 0.95
        },
        {
          id: 'text_1_3',
          type: 'text',
          content: 'TechCorp Inc. is a leading technology company specializing in cloud computing and artificial intelligence solutions. This quarterly report provides an overview of our financial performance for Q3 2024.',
          bbox: { x1: 72, y1: 640, x2: 540, y2: 675, page: 1 },
          page: 1,
          confidence: 0.94
        },
        {
          id: 'header_1_4',
          type: 'header',
          content: 'Financial Highlights',
          bbox: { x1: 72, y1: 600, x2: 200, y2: 620, page: 1 },
          page: 1,
          confidence: 0.96
        },
        {
          id: 'list_1_5',
          type: 'list',
          content: '• Revenue: $2.4 billion (up 15% YoY)\n• Net Income: $456 million (up 22% YoY)\n• Operating Margin: 19.2%\n• Cash and Cash Equivalents: $8.7 billion',
          bbox: { x1: 72, y1: 520, x2: 400, y2: 595, page: 1 },
          page: 1,
          confidence: 0.93
        },
        {
          id: 'table_1_6',
          type: 'table',
          content: 'Financial metrics comparison table showing Q3 2024 vs Q3 2023 performance',
          bbox: { x1: 72, y1: 400, x2: 540, y2: 515, page: 1 },
          page: 1,
          confidence: 0.91
        },
        {
          id: 'header_1_7',
          type: 'header',
          content: 'Business Segments',
          bbox: { x1: 72, y1: 360, x2: 200, y2: 380, page: 1 },
          page: 1,
          confidence: 0.95
        },
        {
          id: 'text_1_8',
          type: 'text',
          content: 'Our cloud services division continues to show strong growth with revenue of $1.8 billion, representing 75% of total revenue.',
          bbox: { x1: 72, y1: 320, x2: 540, y2: 355, page: 1 },
          page: 1,
          confidence: 0.92
        }
      ],
      metadata: {
        total_pages: 24,
        total_elements: 234,
        confidence_avg: 0.94,
        processing_time: 45.2,
        model_used: 'docling',
        by_type: {
          'title': 1,
          'header': 12,
          'text': 156,
          'table': 18,
          'list': 24,
          'image': 23
        }
      },
      processing_time: 45.2,
      model: 'docling'
    },
    
    'surya': {
      markdown: `# QUARTERLY REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934

## Company Overview

TechCorp Inc. is a leading technology company specializing in cloud computing and artificial intelligence solutions. This quarterly report provides an overview of our financial performance for Q3 2024.

## Financial Highlights

Revenue: $2.4 billion (up 15% YoY)
Net Income: $456 million (up 22% YoY)  
Operating Margin: 19.2%
Cash and Cash Equivalents: $8.7 billion

**Financial Performance Table**

Metric | Q3 2024 | Q3 2023 | Change
Revenue | $2,400M | $2,087M | +15.0%
Gross Profit | $1,680M | $1,461M | +15.0%
Operating Income | $461M | $375M | +22.9%
Net Income | $456M | $374M | +21.9%

## Business Segments

**Cloud Services**
Our cloud services division continues to show strong growth with revenue of $1.8 billion, representing 75% of total revenue.

**AI Solutions**
AI solutions generated $600 million in revenue, growing 35% year-over-year as enterprise adoption accelerates.

## Risk Factors

The following risk factors may materially affect our business:
- Increased competition in cloud computing
- Regulatory changes affecting data privacy
- Economic uncertainty and potential recession
- Cybersecurity threats and data breaches`,
      
      elements: [
        {
          id: 'title_1_1',
          type: 'title',
          content: 'QUARTERLY REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934',
          bbox: { x1: 75, y1: 718, x2: 537, y2: 748, page: 1 },
          page: 1,
          confidence: 0.96
        },
        {
          id: 'header_1_2',
          type: 'header',
          content: 'Company Overview',
          bbox: { x1: 75, y1: 678, x2: 198, y2: 698, page: 1 },
          page: 1,
          confidence: 0.93
        },
        {
          id: 'text_1_3',
          type: 'text',
          content: 'TechCorp Inc. is a leading technology company specializing in cloud computing and artificial intelligence solutions. This quarterly report provides an overview of our financial performance for Q3 2024.',
          bbox: { x1: 75, y1: 638, x2: 537, y2: 673, page: 1 },
          page: 1,
          confidence: 0.92
        },
        {
          id: 'header_1_4',
          type: 'header',
          content: 'Financial Highlights',
          bbox: { x1: 75, y1: 598, x2: 198, y2: 618, page: 1 },
          page: 1,
          confidence: 0.94
        },
        {
          id: 'text_1_5',
          type: 'text',
          content: 'Revenue: $2.4 billion (up 15% YoY)\nNet Income: $456 million (up 22% YoY)\nOperating Margin: 19.2%\nCash and Cash Equivalents: $8.7 billion',
          bbox: { x1: 75, y1: 518, x2: 397, y2: 593, page: 1 },
          page: 1,
          confidence: 0.91
        },
        {
          id: 'table_1_6',
          type: 'table',
          content: 'Financial Performance Table',
          bbox: { x1: 75, y1: 398, x2: 537, y2: 513, page: 1 },
          page: 1,
          confidence: 0.89
        }
      ],
      metadata: {
        total_pages: 24,
        total_elements: 218,
        confidence_avg: 0.91,
        processing_time: 52.1,
        model_used: 'surya',
        by_type: {
          'title': 1,
          'header': 11,
          'text': 142,
          'table': 16,
          'list': 22,
          'image': 26
        }
      },
      processing_time: 52.1,
      model: 'surya'
    },
    
    'mineru': {
      markdown: `# QUARTERLY REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934

## Company Overview

TechCorp Inc. is a leading technology company specializing in cloud computing and artificial intelligence solutions. This quarterly report provides an overview of our financial performance for Q3 2024.

## Financial Highlights

- Revenue: $$2.4 \\times 10^9$$ (up 15% YoY)
- Net Income: $$4.56 \\times 10^8$$ (up 22% YoY)  
- Operating Margin: $$19.2\\%$$
- Cash and Cash Equivalents: $$8.7 \\times 10^9$$

### Performance Metrics

$$\\text{Revenue Growth Rate} = \\frac{\\text{Q3 2024} - \\text{Q3 2023}}{\\text{Q3 2023}} \\times 100\\% = 15\\%$$

| Metric | Q3 2024 | Q3 2023 | Change |
|--------|---------|---------|---------|
| Revenue | $2,400M | $2,087M | +15.0% |
| Gross Profit | $1,680M | $1,461M | +15.0% |
| Operating Income | $461M | $375M | +22.9% |
| Net Income | $456M | $374M | +21.9% |

## Business Segments

### Cloud Services
Our cloud services division continues to show strong growth with revenue of $1.8 billion, representing 75% of total revenue.

Mathematical relationship: $$\\text{Cloud Revenue} = 0.75 \\times \\text{Total Revenue}$$

### AI Solutions  
AI solutions generated $600 million in revenue, growing 35% year-over-year as enterprise adoption accelerates.

Growth formula: $$\\text{AI Growth} = \\frac{600M - 444M}{444M} \\times 100\\% = 35\\%$$`,
      
      elements: [
        {
          id: 'title_1_1',
          type: 'title',
          content: 'QUARTERLY REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934',
          bbox: { x1: 72, y1: 720, x2: 540, y2: 750, page: 1 },
          page: 1,
          confidence: 0.97
        },
        {
          id: 'header_1_2',
          type: 'header',
          content: 'Company Overview',
          bbox: { x1: 72, y1: 680, x2: 200, y2: 700, page: 1 },
          page: 1,
          confidence: 0.94
        },
        {
          id: 'text_1_3',
          type: 'text',
          content: 'TechCorp Inc. is a leading technology company specializing in cloud computing and artificial intelligence solutions. This quarterly report provides an overview of our financial performance for Q3 2024.',
          bbox: { x1: 72, y1: 640, x2: 540, y2: 675, page: 1 },
          page: 1,
          confidence: 0.93
        }
      ],
      metadata: {
        total_pages: 24,
        total_elements: 201,
        confidence_avg: 0.89,
        processing_time: 38.7,
        model_used: 'mineru',
        by_type: {
          'title': 1,
          'header': 10,
          'text': 128,
          'table': 15,
          'list': 20,
          'image': 27
        }
      },
      processing_time: 38.7,
      model: 'mineru'
    }
  }
};

// Function to load example results 
export function loadExampleResults(exampleId: string): Record<string, ExampleResult> | null {
  return exampleResults[exampleId] || null;
}