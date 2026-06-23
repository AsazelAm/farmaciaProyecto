import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

type BarcodeRendererProps = Readonly<{
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  displayValue?: boolean;
  enableDownload?: boolean;
}>;

export default function BarcodeRenderer({
  value,
  width = 1.5,
  height = 35,
  fontSize = 10,
  displayValue = true,
  enableDownload = false,
}: BarcodeRendererProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value.trim()) {
      try {
        JsBarcode(svgRef.current, value.trim(), {
          format: "CODE128",
          width,
          height,
          displayValue,
          fontSize,
          margin: 4,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (err) {
        console.warn("Error rendering barcode:", err);
      }
    }
  }, [value, width, height, fontSize, displayValue]);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current;
    
    // Serializar SVG
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    
    const reader = new FileReader();
    reader.readAsDataURL(svgBlob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const img = new Image();
      img.src = base64data;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        // Escalar para una calidad de impresión excelente
        const scale = 3;
        canvas.width = (svgElement.clientWidth || 200) * scale;
        canvas.height = (svgElement.clientHeight || 80) * scale;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          const pngUrl = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngUrl;
          downloadLink.download = `codigo_${value.trim()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
    };
  };

  if (!value || !value.trim()) {
    return (
      <div className="text-xs text-gray-400 italic">
        Sin código de barra
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-center gap-2 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
      <svg ref={svgRef} className="block max-w-full h-auto" />
      
      {enableDownload && (
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors active:scale-95"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Descargar Imagen
        </button>
      )}
    </div>
  );
}
