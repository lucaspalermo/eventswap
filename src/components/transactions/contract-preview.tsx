'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fadeIn } from '@/design-system/animations';
import { type ContractData, generateTransferContract } from '@/lib/contract-template';

interface ContractPreviewProps {
  contractData: ContractData;
}

export function ContractPreview({ contractData }: ContractPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const contractHtml = generateTransferContract(contractData);

  function handlePrint() {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }

  function handleDownloadPdf() {
    // Opens contract HTML in a new tab so user can use browser's Save as PDF
    const blob = new Blob([contractHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('load', () => {
        win.print();
        // Revoke after a delay to allow print dialog to open
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      });
    }
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/10">
            <FileText className="h-5 w-5 text-[#2563EB]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              Instrumento de Cessão de Contrato
            </p>
            <p className="text-xs text-neutral-500">
              Cód. {contractData.transactionCode} &bull; {contractData.platformName}
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="flex-1 sm:flex-none"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir / Salvar PDF
          </Button>
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            className="flex-1 sm:flex-none bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar como PDF
          </Button>
        </div>
      </div>

      {/* Contract Preview (iframe for isolation) */}
      <div className="relative w-full rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden bg-white shadow-sm">
        {/* A4 aspect ratio hint bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex gap-1">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs text-neutral-400 font-mono ml-2">
            contrato-cessao-{contractData.transactionCode.toLowerCase()}.pdf
          </span>
        </div>

        {/* Iframe renders the contract HTML in isolation */}
        <iframe
          ref={iframeRef}
          srcDoc={contractHtml}
          title={`Contrato de Cessão - ${contractData.transactionCode}`}
          className="w-full bg-white"
          style={{ height: '75vh', minHeight: '500px', border: 'none' }}
          sandbox="allow-same-origin allow-modals"
        />
      </div>

      {/* Legal notice */}
      <p className="text-xs text-neutral-400 text-center px-4">
        Este documento foi gerado eletronicamente pela plataforma {contractData.platformName} e
        possui validade jurídica nos termos da legislação brasileira vigente.
        Recomendamos salvar uma cópia para seus registros.
      </p>
    </motion.div>
  );
}
