import ToolCard from '@/components/ToolCard'
import PDFSKUScanner from '@/components/PDFSKUScanner'

export default function PDFScannerPage() {
  return (
    <ToolCard
      title="PDF SKU Scanner"
      description="Upload a catalog PDF and extract all SKUs with direct search links. Supports Herrschners and Vesey's."
      basecampUrl=""
    >
      <PDFSKUScanner />
    </ToolCard>
  )
}
