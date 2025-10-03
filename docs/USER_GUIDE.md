# 📖 User Guide - PDF Extraction Playground

## Welcome to PDF Extraction Playground!

This comprehensive guide will walk you through using our advanced PDF extraction platform to extract content from your documents using state-of-the-art AI models.

## 🚀 Getting Started

### Step 1: Upload Your PDF

1. **Navigate to the main page** - You'll see a clean interface with an upload area
2. **Upload your PDF** in one of these ways:
   - **Drag & Drop**: Simply drag your PDF file onto the upload area
   - **Click to Browse**: Click the upload area and select your file
3. **File Requirements**:
   - Maximum size: 50MB
   - Format: PDF only
   - Pages: Unlimited (processing time scales with pages)

**✅ Tip**: For best results, ensure your PDF is not password-protected and has good text quality.

### Step 2: Choose Your AI Model

After upload, you'll see three powerful AI models to choose from:

#### 🤖 **Docling (Recommended for Most Documents)**
- **Best for**: Business reports, invoices, contracts, general documents
- **Strengths**: Superior layout analysis, excellent table detection
- **Speed**: Medium (20-30 seconds per page)
- **Use when**: You have structured business documents with tables and complex layouts

#### 🌍 **Surya (Best for Multilingual)**
- **Best for**: Documents in multiple languages, scanned PDFs
- **Strengths**: 90+ language support, excellent OCR for scanned documents
- **Speed**: Fast (15-25 seconds per page)
- **Use when**: Your document contains non-English text or is a scanned image

#### 🔬 **MinerU (Scientific Documents)**
- **Best for**: Research papers, academic articles, mathematical content
- **Strengths**: LaTeX formula extraction, citation parsing, scientific notation
- **Speed**: Slower but more accurate (30-45 seconds per page)
- **Use when**: You have academic papers with formulas, citations, or scientific content

**✅ Pro Tip**: You can select multiple models to compare results side-by-side!

### Step 3: Start Extraction

1. **Click "Extract All"** or the blue "Extract" button
2. **Watch the progress**: You'll see real-time updates showing:
   - Current processing stage
   - Page being processed
   - Estimated time remaining
3. **Wait for completion**: Processing time depends on document length and selected model(s)

## 🖥️ Understanding the Interface

### Left Pane: PDF Viewer with Annotations

Once processing is complete, you'll see your original PDF with colored annotations:

#### Color-Coded Elements:
- 🔴 **Red**: Titles and main headings
- 🟠 **Orange**: Section headers and subheadings  
- 🔵 **Blue**: Regular text paragraphs
- 🟢 **Green**: Tables and tabular data
- 🟣 **Purple**: Images and figures
- 🟡 **Yellow**: Lists and bullet points

#### Interactive Features:
- **Zoom**: Use +/- buttons or mouse wheel to zoom (50% to 200%)
- **Pan**: Click and drag to move around the document
- **Page Navigation**: Use arrows or click page numbers
- **Element Details**: Hover over colored boxes to see element information
- **Filter Elements**: Use checkboxes to show/hide specific element types

### Right Pane: Extracted Content

The right side shows your extracted content in clean, formatted text:

#### Content Tabs:
- **📄 Markdown**: Clean text format perfect for copying/editing
- **🔍 Schema**: Document structure and statistics
- **⚡ No Chunking**: Raw extracted content

#### Features:
- **Copy Content**: Click the copy button to copy all text
- **Download**: Save as Markdown (.md) file
- **Search**: Find specific content within extracted text
- **Scroll Sync**: Content scrolls with PDF pages

## 🔄 Comparing Multiple Models

When you select multiple models, you'll get powerful comparison features:

### Side-by-Side Results
- **Split View**: See outputs from each model simultaneously
- **Difference Highlighting**: Unique content is color-coded
- **Performance Metrics**: Compare speed, accuracy, and elements detected

### Metrics Dashboard
- **Processing Time**: How long each model took
- **Elements Detected**: Count of titles, headers, tables, etc.
- **Confidence Scores**: Model certainty ratings
- **Text Statistics**: Word count, character count comparisons

**✅ Best Practice**: Use comparison mode to find the most accurate model for your document type.

## 📥 Exporting Your Results

### Export Options:
1. **📝 Markdown (.md)**: Perfect for editing, version control, or documentation
2. **🌐 HTML (.html)**: Web-ready format with styling
3. **📄 DOCX (.docx)**: Microsoft Word format for further editing
4. **📋 Copy to Clipboard**: Quick copying for immediate use

### How to Export:
1. **Choose Format**: Click the download dropdown
2. **Select Model**: If you used multiple models, choose which result to export
3. **Download**: File will download automatically
4. **Verify**: Check the exported content meets your needs

## 🎯 Tips for Best Results

### Document Preparation:
- **High Quality**: Use high-resolution PDFs when possible
- **Text-based**: Native PDFs work better than scanned images
- **Clean Layout**: Well-formatted documents extract more accurately
- **Language**: For non-English documents, use Surya model

### Model Selection Strategy:
- **Unknown Document Type**: Start with Docling (most versatile)
- **Scientific Papers**: Always use MinerU for formulas and citations
- **Multilingual Content**: Use Surya for non-English text
- **Complex Tables**: Docling excels at table structure
- **Scanned Documents**: Surya has the best OCR capabilities

### Troubleshooting Common Issues:

#### "Upload Failed" Error:
- ✅ Check file size (must be under 50MB)
- ✅ Ensure file is a valid PDF
- ✅ Remove password protection from PDF
- ✅ Try a different browser if issues persist

#### "Processing Timeout" Error:
- ✅ Try a smaller document first
- ✅ Use faster models (Surya instead of MinerU)
- ✅ Check your internet connection
- ✅ Refresh and try again

#### Poor Extraction Quality:
- ✅ Try a different model better suited for your document type
- ✅ Ensure original PDF has good text quality
- ✅ For scanned documents, use Surya model
- ✅ Check if document has complex layouts that need manual review

#### Visual Annotations Not Showing:
- ✅ Ensure extraction completed successfully
- ✅ Check that annotation toggle is enabled
- ✅ Try refreshing the page
- ✅ Zoom out to see if boxes are outside current view

## 🔧 Advanced Features

### Document Templates
- **Access**: Click the templates button in the header
- **Purpose**: Pre-configured settings for common document types
- **Options**: Financial reports, academic papers, legal documents, etc.
- **Benefit**: Optimized extraction settings for specific document formats

### Processing History
- **Access**: Click the history button in the header  
- **Features**: View previously processed documents
- **Actions**: Re-download results, delete old extractions
- **Storage**: Documents saved for 30 days

### Settings & Preferences
- **Theme**: Switch between light and dark modes
- **Default Model**: Set your preferred extraction model
- **Export Format**: Choose default download format
- **Language**: Set interface language preference

## 📱 Mobile Usage

The platform is fully responsive and works great on mobile devices:

### Mobile-Specific Features:
- **Touch-Friendly**: Large buttons and touch targets
- **Swipe Navigation**: Swipe between pages
- **Pinch to Zoom**: Natural zoom gestures
- **Adaptive Layout**: Interface adjusts to screen size

### Mobile Tips:
- **Portrait Mode**: Better for reading extracted content
- **Landscape Mode**: Better for viewing PDF with annotations
- **WiFi Recommended**: Large files upload faster on WiFi

## 🆘 Getting Help

### In-App Support:
- **Help Button**: Click the (?) icon for contextual help
- **Error Messages**: Detailed error descriptions with solutions
- **Status Indicators**: Visual feedback on processing status

### Additional Resources:
- **API Documentation**: https://your-api-url.com/docs
- **GitHub Repository**: Complete source code and examples
- **Email Support**: support@pdf-extraction-playground.com

### Community:
- **Discord**: Join our community for tips and discussions
- **GitHub Issues**: Report bugs or request features
- **Documentation**: Comprehensive guides and tutorials

## 🎓 Example Workflows

### Workflow 1: Business Report Analysis
1. Upload quarterly report PDF
2. Select **Docling** model (best for business documents)
3. Wait for processing (typically 2-3 minutes)
4. Review extracted tables and financial data
5. Export as Markdown for documentation
6. Use copy function for immediate sharing

### Workflow 2: Academic Paper Processing
1. Upload research paper PDF
2. Select **MinerU** model (optimized for scientific content)
3. Review extracted formulas and citations
4. Compare with **Docling** for layout analysis
5. Export as HTML for web publication
6. Copy specific sections for quotes

### Workflow 3: Multilingual Document
1. Upload document with mixed languages
2. Select **Surya** model (90+ language support)
3. Review extraction quality across languages
4. Use comparison with Docling if needed
5. Export as DOCX for further editing
6. Review and correct any OCR errors

## 🚀 Pro Tips for Power Users

### Batch Processing Strategy:
- Process similar document types with same model
- Use comparison mode for quality assessment
- Set up templates for recurring document types
- Export in consistent formats for workflow integration

### Quality Optimization:
- Test different models on sample pages first
- Use highest quality PDF sources available
- Review extraction before exporting
- Combine manual review with automated extraction

### Integration Workflows:
- Use API endpoints for programmatic access
- Set up automated workflows with webhooks
- Integrate with document management systems
- Export to formats compatible with your tools

---

## 🎉 You're Ready to Go!

You now have everything you need to successfully extract content from your PDF documents. Start with a simple document to get familiar with the interface, then gradually try more complex documents and different models.

**Happy Extracting!** 🚀

---

*Last updated: October 2025 | Version 1.0*